import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { checkContactRateLimit } from "../scripts/qa-rate-limit.mjs";

const policy = JSON.parse(readFileSync(new URL("../ops/contact-rate-limit.json", import.meta.url), "utf8"));

test("tracked firewall rule scopes five attempts per minute to contact POSTs, keyed only by IP", () => {
  assert.equal(policy.active, true);
  assert.deepEqual(policy.action.mitigate, {
    action: "rate_limit",
    rateLimit: { algo: "fixed_window", window: 60, limit: 5, keys: ["ip"], action: "rate_limit" },
  });
  assert.equal(policy.conditionGroup.length, 1);
  assert.deepEqual(policy.conditionGroup[0].conditions, [
    { type: "path", op: "re", value: "^/api/contact/?$" },
    { type: "method", op: "eq", value: "POST" },
  ]);
  const path = new RegExp(policy.conditionGroup[0].conditions[0].value);
  for (const match of ["/api/contact", "/api/contact/"]) assert.ok(path.test(match));
  for (const other of ["/", "/api/contact-extra", "/api/contacts", "/api/contact/child"]) assert.ok(!path.test(other));
});

function mockHost({ localOnly = false } = {}) {
  const requests = [];
  let posts = 0;
  return {
    requests,
    fetcher: async (url, options = {}) => {
      requests.push({ url, options });
      if (options.method === "POST") {
        posts++;
        if (posts <= 5) return Response.json({ message: "The enquiry could not be submitted." }, { status: 400 });
        if (localOnly) return Response.json({ message: "Too many attempts. Please wait a minute and try again." }, { status: 429 });
        const id = `bom1::qa-${posts}`;
        return Response.json({ error: { code: "429", message: "Too Many Requests", id } }, { status: 429, headers: { "x-vercel-id": id } });
      }
      return url.endsWith("/api/contact")
        ? Response.json({ deliveryEnabled: true, deliveryProvider: "resend" })
        : new Response("Portfolio", { status: 200 });
    },
  };
}

test("live QA uses only invalid honeypots, alternates owned domains, and distinguishes edge blocking", async () => {
  const host = mockHost();
  const result = await checkContactRateLimit({ fetcher: host.fetcher });
  assert.equal(result.attempts.length, 8);
  assert.equal(result.realEmailSent, false);
  assert.ok(result.attempts.slice(5).every(attempt => attempt.edgeBlocked));
  assert.equal(result.attempts.at(-1).trailingSlash, true);
  const posts = host.requests.filter(r => r.options.method === "POST");
  for (const { url, options } of posts) {
    assert.deepEqual(JSON.parse(options.body), { website: "rate-limit-qa.invalid" });
    assert.equal(options.headers.Origin, new URL(url).origin);
    assert.ok(options.signal instanceof AbortSignal);
  }
  assert.equal(new Set(posts.map(r => r.options.headers["X-Forwarded-For"])).size, 8);
  assert.equal(new Set(posts.map(r => new URL(r.url).hostname)).size, 2);
});

test("an application-only 429 is not accepted as proof of shared edge protection", async () => {
  await assert.rejects(checkContactRateLimit({ fetcher: mockHost({ localOnly: true }).fetcher }), /edge 429/);
});

test("recovery check sends only one invalid attempt per owned domain", async () => {
  const host = mockHost();
  const result = await checkContactRateLimit({ fetcher: host.fetcher, recoveryOnly: true });
  assert.equal(result.mode, "recovery");
  assert.equal(result.attempts.length, 2);
  assert.ok(result.attempts.every(attempt => attempt.status === 400));
});
