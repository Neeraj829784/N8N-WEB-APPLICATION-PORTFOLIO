// Explicit live check of this portfolio only. Every POST is deliberately invalid
// AND honeypot-marked, so it cannot reach Resend or the optional webhook.
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";

const origins = ["https://portfolio.neerajwork.in", "https://neerajwork-portfolio.vercel.app"];

export async function checkContactRateLimit({ fetcher = fetch, recoveryOnly = false } = {}) {
  const attempts = [];
  const total = recoveryOnly ? 2 : 8;
  for (let index = 0; index < total; index++) {
    const origin = origins[index % origins.length];
    const trailingSlash = !recoveryOnly && index === total - 1;
    const response = await fetcher(`${origin}/api/contact${trailingSlash ? "/" : ""}`, {
      method: "POST",
      headers: {
        Origin: origin,
        "Content-Type": "application/json",
        // Spoofed forwarded headers must not create new firewall counting keys.
        "X-Forwarded-For": `192.0.2.${index + 10}`,
        "X-Real-IP": `192.0.2.${index + 30}`,
      },
      body: JSON.stringify({ website: "rate-limit-qa.invalid" }),
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    });
    const body = await response.json();
    const edgeBlocked = response.status === 429
      && body.error?.code === "429"
      && body.error?.message === "Too Many Requests"
      && typeof body.error?.id === "string"
      && body.error.id === response.headers.get("x-vercel-id");
    const invalidAtApp = response.status === 400 && body.message === "The enquiry could not be submitted.";
    attempts.push({ host: new URL(origin).hostname, trailingSlash, status: response.status, edgeBlocked });
    if (recoveryOnly || index < 5) {
      assert.ok(invalidAtApp, "Expected application validation before the limit. Wait at least 65 seconds without other contact POSTs from this IP, then retry.");
    } else {
      assert.ok(edgeBlocked, "Expected Vercel's edge 429, not only the application's per-instance limit.");
    }
  }

  // GETs must remain available even while the contact POST bucket is exhausted.
  for (const origin of origins) {
    const home = await fetcher(origin, { redirect: "error", signal: AbortSignal.timeout(10_000) });
    assert.equal(home.status, 200, "The rate limit must not block the homepage.");
    await home.arrayBuffer();
    const status = await fetcher(`${origin}/api/contact`, { redirect: "error", signal: AbortSignal.timeout(10_000) });
    assert.equal(status.status, 200, "Delivery-status GET must not share the POST bucket.");
    assert.deepEqual(await status.json(), { deliveryEnabled: true, deliveryProvider: "resend" });
  }
  return { mode: recoveryOnly ? "recovery" : "burst", attempts, getRoutesAvailable: true, realEmailSent: false };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const args = process.argv.slice(2);
    assert.ok(args.every(arg => arg === "--recovery"), "Only --recovery is supported.");
    console.log(JSON.stringify(await checkContactRateLimit({ recoveryOnly: args.includes("--recovery") }), null, 2));
  } catch (error) {
    console.error(`Rate-limit check failed: ${error.message}`);
    process.exitCode = 1;
  }
}
