import assert from "node:assert/strict";
import test from "node:test";
import { contactServices, formatBrief, validateContact } from "../src/lib/contact-validation.ts";
import { createContactHandler } from "../src/lib/contact-server.ts";
import { getContactWebhookConfig } from "../src/lib/contact-delivery.ts";

const valid = { service: contactServices[0], description: "We copy enquiries into a spreadsheet every morning.", tools: "Email, Sheets", name: "Test Visitor", email: "visitor@example.org" };
const config = () => ({ provider: "webhook", url: "https://webhook.example.org/contact", token: "test-token-not-a-real-secret" });
function request(data = valid, headers = {}) {
  return new Request("https://portfolio.example.org/api/contact", { method: "POST", headers: { Origin: "https://portfolio.example.org", "Content-Type": "application/json", ...headers }, body: JSON.stringify(data) });
}

test("validation trims every field and accepts a meaningful enquiry", () => {
  const result = validateContact({ ...valid, description: `  ${valid.description}  `, name: "  Test Visitor  " });
  assert.equal(result.success, true);
  assert.equal(result.data.description, valid.description);
  assert.equal(result.data.name, valid.name);
});
test("spaces cannot satisfy the minimum description length", () => {
  const result = validateContact({ ...valid, description: " ".repeat(100) });
  assert.equal(result.success, false);
  assert.ok(result.errors.description);
});
test("reply name and a valid email are required for delivery", () => {
  const result = validateContact({ ...valid, name: " ", email: "not-an-email" });
  assert.equal(result.success, false);
  assert.ok(result.errors.name);
  assert.ok(result.errors.email);
});
test("local brief preparation does not require reply details", () => {
  assert.equal(validateContact({ ...valid, name: "", email: "" }, false).success, true);
});
test("unknown services and oversized fields are rejected", () => {
  const result = validateContact({ ...valid, service: "unknown", tools: "a".repeat(301), description: "a".repeat(2001) });
  assert.equal(result.success, false);
  assert.deepEqual(Object.keys(result.errors).sort(), ["description", "service", "tools"]);
});
test("non-string payloads do not bypass validation", () => {
  for (const input of [null, [], "text", { description: {}, service: 1 }]) assert.equal(validateContact(input).success, false);
});
test("downloadable briefs contain the agreed process and reply details", () => {
  const text = formatBrief(valid);
  assert.ok(text.includes(valid.description));
  assert.ok(text.includes(valid.email));
  assert.ok(text.includes(valid.service));
});
test("only valid HTTPS webhook URLs enable delivery", () => {
  for (const url of ["", "garbage", "http://example.org", "https://user:pass@example.org"]) assert.equal(getContactWebhookConfig({ CONTACT_WEBHOOK_URL: url }), null);
  assert.equal(getContactWebhookConfig({ CONTACT_WEBHOOK_URL: "https://example.org/hook" }).url, "https://example.org/hook");
});
test("an unconfigured endpoint returns an honest unavailable state", async () => {
  const handler = createContactHandler({ getConfig: () => null, fetcher: () => { throw Error("must not send"); } });
  const response = await handler(request());
  assert.equal(response.status, 503);
  assert.match((await response.json()).message, /not available/);
});
test("valid enquiries reach the configured webhook with a private token", async () => {
  let forwarded;
  const handler = createContactHandler({ getConfig: config, fetcher: async (url, options) => { forwarded = { url, options }; return new Response("accepted", { status: 202 }); } });
  const response = await handler(request({ ...valid, ignored: "not forwarded" }));
  assert.equal(response.status, 200);
  assert.equal(forwarded.url, config().url);
  assert.equal(forwarded.options.headers.Authorization, `Bearer ${config().token}`);
  assert.equal(forwarded.options.redirect, "error");
  const body = JSON.parse(forwarded.options.body);
  assert.equal(body.email, valid.email);
  assert.equal(body.ignored, undefined);
  assert.equal(body.source, "portfolio");
  assert.ok(!JSON.stringify(await response.json()).includes(config().token));
});
test("server validation stops invalid enquiries before forwarding", async () => {
  let called = false;
  const handler = createContactHandler({ getConfig: config, fetcher: async () => { called = true; return new Response(); } });
  const response = await handler(request({ ...valid, description: " ".repeat(30) }));
  assert.equal(response.status, 400);
  assert.ok((await response.json()).errors.description);
  assert.equal(called, false);
});
test("cross-origin and non-JSON requests are rejected", async () => {
  const handler = createContactHandler({ getConfig: config });
  assert.equal((await handler(request(valid, { Origin: "https://another.example.org" }))).status, 403);
  assert.equal((await handler(request(valid, { "Content-Type": "text/plain" }))).status, 415);
});
test("the configured public origin works behind an internal reverse-proxy address", async () => {
  const handler = createContactHandler({ getConfig: config, getSiteOrigin: () => "https://public.example.org", fetcher: async () => new Response(null, { status: 204 }) });
  const proxied = new Request("http://internal:3000/api/contact", { method: "POST", headers: { Origin: "https://public.example.org", "Content-Type": "application/json" }, body: JSON.stringify(valid) });
  assert.equal((await handler(proxied)).status, 200);
});
test("the browser Host origin is accepted when Next normalises the internal request hostname", async () => {
  const handler = createContactHandler({ getConfig: config, fetcher: async () => new Response(null, { status: 204 }) });
  const local = new Request("http://localhost:3000/api/contact", { method: "POST", headers: { Host: "127.0.0.1:3000", Origin: "http://127.0.0.1:3000", "Content-Type": "application/json" }, body: JSON.stringify(valid) });
  assert.equal((await handler(local)).status, 200);
});
test("stable enquiry IDs can be forwarded for downstream retry deduplication", async () => {
  let body;
  const handler = createContactHandler({ getConfig: config, fetcher: async (_url, options) => { body = JSON.parse(options.body); return new Response(null, { status: 204 }); } });
  const enquiryId = "59db8379-a78b-49dd-8a77-4e116e9a8d9b";
  assert.equal((await handler(request({ ...valid, enquiryId }))).status, 200);
  assert.equal(body.enquiryId, enquiryId);
  assert.equal((await handler(request({ ...valid, enquiryId: "malformed" }))).status, 400);
});
test("invalid JSON and oversized bodies have specific error responses", async () => {
  const handler = createContactHandler({ getConfig: config });
  const headers = { Origin: "https://portfolio.example.org", "Content-Type": "application/json" };
  assert.equal((await handler(new Request("https://portfolio.example.org/api/contact", { method: "POST", headers, body: "{" }))).status, 400);
  assert.equal((await handler(new Request("https://portfolio.example.org/api/contact", { method: "POST", headers, body: "a".repeat(17_000) }))).status, 413);
});
test("honeypot submissions never reach the webhook", async () => {
  const handler = createContactHandler({ getConfig: config, fetcher: () => { throw Error("must not send"); } });
  assert.equal((await handler(request({ ...valid, website: "spam.example.org" }))).status, 400);
});
test("repeated attempts are limited and the window recovers", async () => {
  let time = 0;
  const handler = createContactHandler({ getConfig: config, now: () => time, fetcher: async () => new Response(null, { status: 204 }) });
  for (let i = 0; i < 5; i++) assert.equal((await handler(request())).status, 200);
  const limited = await handler(request());
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get("Retry-After"), "60");
  time = 60_001;
  assert.equal((await handler(request())).status, 200);
});
test("upstream failures and timeouts never produce a success response", async () => {
  const failed = createContactHandler({ getConfig: config, fetcher: async () => new Response("private upstream diagnostic", { status: 500 }) });
  const response = await failed(request());
  assert.equal(response.status, 502);
  assert.ok(!(await response.text()).includes("private upstream diagnostic"));
  const timeout = createContactHandler({ getConfig: config, fetcher: async () => { throw new DOMException("timed out", "TimeoutError"); } });
  assert.equal((await timeout(request())).status, 502);
});
