import assert from "node:assert/strict";
import test from "node:test";
import { portfolio } from "../src/data/portfolio.ts";
import { getContactDeliveryConfig, getContactDeliveryStatus, createEnquiryEmail } from "../src/lib/contact-delivery.ts";
import { validateContact } from "../src/lib/contact-validation.ts";
import { createContactHandler } from "../src/lib/contact-server.ts";

// All provider traffic is mocked. These tests never deliver email.
const env = { RESEND_API_KEY: "test-key-not-a-real-secret", CONTACT_FROM_EMAIL: "enquiries@example.org" };
const valid = { service: "Lead operations", name: "Test Visitor", email: "visitor@example.net", description: "We manually copy new enquiries into our spreadsheet.", tools: "Gmail, Sheets" };
const enquiryId = "59db8379-a78b-49dd-8a77-4e116e9a8d9b";
const config = () => getContactDeliveryConfig(env);
const request = (data = valid) => new Request("https://portfolio.example.org/api/contact", {
  method: "POST", headers: { Origin: "https://portfolio.example.org", "Content-Type": "application/json" }, body: JSON.stringify({ ...data, enquiryId }),
});

test("email delivery requires key and sender; recipient defaults to the profile inbox", () => {
  assert.equal(getContactDeliveryConfig({}), null);
  assert.equal(getContactDeliveryConfig({ CONTACT_TO_EMAIL: portfolio.email }), null);
  assert.equal(getContactDeliveryConfig({ RESEND_API_KEY: env.RESEND_API_KEY }), null);
  assert.equal(getContactDeliveryConfig({ CONTACT_FROM_EMAIL: env.CONTACT_FROM_EMAIL }), null);
  assert.deepEqual(config(), { provider: "resend", apiKey: env.RESEND_API_KEY, from: env.CONTACT_FROM_EMAIL, to: portfolio.email });
  assert.equal(getContactDeliveryConfig({ ...env, CONTACT_TO_EMAIL: "owner@example.net" }).to, "owner@example.net");
});

test("email credentials take precedence and partial setup never falls back to an old webhook", () => {
  const webhook = { CONTACT_WEBHOOK_URL: "https://hooks.example.org/contact" };
  assert.equal(getContactDeliveryConfig(webhook).provider, "webhook");
  assert.equal(getContactDeliveryConfig({ ...webhook, ...env }).provider, "resend");
  assert.equal(getContactDeliveryConfig({ ...webhook, RESEND_API_KEY: env.RESEND_API_KEY }), null);
});

test("the portfolio default and explicit recipient use the Zoho inbox without copying Gmail", async () => {
  const to = "neerajautomations@zohomail.in";
  assert.equal(portfolio.email, to);
  const getConfig = () => getContactDeliveryConfig({ ...env, CONTACT_TO_EMAIL: to });
  let email;
  const handler = createContactHandler({ getConfig, fetcher: async (_url, options) => {
    email = JSON.parse(options.body);
    return Response.json({ id: "zoho-recipient-test" });
  } });
  assert.equal((await handler(request())).status, 200);
  assert.deepEqual(email.to, [to]);
  assert.equal(email.cc, undefined);
  assert.equal(email.bcc, undefined);
  assert.equal(email.reply_to, valid.email);
});

test("server configuration rejects invalid addresses, recipient lists, and header injection", () => {
  for (const address of ["not-an-address", "Name <sender@example.org>", "a@example.org,b@example.org", "a@example.org;b@example.org", "a@example.org\r\nBcc: victim@example.org", "a\u0000@example.org"]) {
    assert.equal(getContactDeliveryConfig({ ...env, CONTACT_FROM_EMAIL: address }), null);
    assert.equal(getContactDeliveryConfig({ ...env, CONTACT_TO_EMAIL: address }), null);
  }
  assert.equal(getContactDeliveryConfig({ ...env, RESEND_API_KEY: "bad key" }), null);
});

test("public delivery status exposes only availability and provider, never credentials", () => {
  assert.deepEqual(getContactDeliveryStatus(config()), { deliveryEnabled: true, deliveryProvider: "resend" });
  assert.deepEqual(getContactDeliveryStatus(null), { deliveryEnabled: false, deliveryProvider: null });
});

test("reply addresses cannot inject additional headers or recipients", () => {
  for (const email of ["visitor@example.net\r\nBcc: victim@example.org", "visitor@example.net,second@example.org", "visitor\u0000@example.net"]) {
    assert.equal(validateContact({ ...valid, email }).success, false);
  }
});

test("email templates include the brief and reference and escape all visitor HTML", () => {
  const injected = { ...valid, name: '<img src=x onerror="alert(1)">', description: "<script>alert('x')</script> & customer process", tools: "<b>Sheets</b>" };
  const email = createEnquiryEmail(injected, enquiryId);
  assert.ok(email.text.includes(injected.description));
  assert.ok(email.text.includes(enquiryId));
  assert.ok(email.html.includes("&lt;script&gt;"));
  assert.ok(email.html.includes("&amp; customer process"));
  assert.ok(!email.html.includes("<script>"));
  assert.ok(!email.html.includes("<img"));
  assert.ok(!email.html.includes("<b>Sheets"));
  assert.equal(email.subject, "New automation enquiry: Lead operations");
});

test("valid enquiries send only to the fixed inbox with the visitor as Reply-To", async () => {
  let sent;
  const handler = createContactHandler({ getConfig: config, fetcher: async (url, options) => {
    sent = { url, options, body: JSON.parse(options.body) };
    return Response.json({ id: "provider-message-id" });
  } });
  const response = await handler(request({ ...valid, to: "attacker@example.org", from: "fake@example.org", apiKey: "not-used" }));
  assert.equal(response.status, 200);
  assert.equal(sent.url, "https://api.resend.com/emails");
  assert.equal(sent.options.headers.Authorization, `Bearer ${env.RESEND_API_KEY}`);
  assert.equal(sent.options.headers["Idempotency-Key"], `portfolio-enquiry/${enquiryId}`);
  assert.equal(sent.options.redirect, "error");
  assert.equal(sent.options.cache, "no-store");
  assert.ok(sent.options.signal instanceof AbortSignal);
  assert.deepEqual(sent.body.to, [portfolio.email]);
  assert.equal(sent.body.from, `${portfolio.name} <${env.CONTACT_FROM_EMAIL}>`);
  assert.equal(sent.body.reply_to, valid.email);
  assert.ok(sent.body.text.includes(valid.description));
  assert.ok(!JSON.stringify(sent.body).includes("attacker@example.org"));
  const result = await response.text();
  assert.ok(result.includes("accepted for email delivery"));
  assert.ok(!result.includes(env.RESEND_API_KEY));
  assert.ok(!result.includes("provider-message-id"));
});

test("retries preserve the idempotency key AND identical email payload despite clock changes", async () => {
  let time = 0;
  const attempts = [];
  const handler = createContactHandler({ getConfig: config, now: () => time, fetcher: async (_url, options) => {
    attempts.push(options);
    return attempts.length === 1 ? new Response(null, { status: 503 }) : Response.json({ id: "accepted-id" });
  } });
  assert.equal((await handler(request())).status, 502);
  time = 2000;
  assert.equal((await handler(request())).status, 200);
  assert.equal(attempts[0].headers["Idempotency-Key"], attempts[1].headers["Idempotency-Key"]);
  assert.equal(attempts[0].body, attempts[1].body);
});

test("provider failures, timeouts, and malformed receipts never claim email acceptance", async () => {
  const providers = [
    async () => new Response("private account diagnostic", { status: 401 }),
    async () => new Response(null, { status: 429 }),
    async () => new Response(null, { status: 204 }),
    async () => Response.json({}),
    async () => Response.json({ id: "" }),
    async () => Response.json({ id: "id", error: "unexpected provider error" }),
    async () => new Response("not-json"),
    async () => { throw new DOMException("provider timeout", "TimeoutError"); },
  ];
  for (const fetcher of providers) {
    const response = await createContactHandler({ getConfig: config, fetcher })(request());
    assert.equal(response.status, 502);
    const body = await response.text();
    assert.ok(!body.includes("private account"));
    assert.ok(!body.includes("accepted for email delivery"));
  }
});

test("invalid submissions and honeypots never contact the email provider", async () => {
  const handler = createContactHandler({ getConfig: config, fetcher: () => { throw Error("must not send"); } });
  assert.equal((await handler(request({ ...valid, email: "invalid" }))).status, 400);
  assert.equal((await handler(request({ ...valid, website: "spam.example.org" }))).status, 400);
});

test("email submissions retain the existing per-instance attempt limit", async () => {
  let calls = 0;
  const handler = createContactHandler({ getConfig: config, fetcher: async () => { calls++; return Response.json({ id: "accepted-id" }); } });
  for (let index = 0; index < 5; index++) assert.equal((await handler(request())).status, 200);
  assert.equal((await handler(request())).status, 429);
  assert.equal(calls, 5);
});
