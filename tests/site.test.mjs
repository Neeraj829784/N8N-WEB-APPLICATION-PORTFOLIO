import assert from "node:assert/strict";
import test from "node:test";
import { getSiteConfiguration } from "../src/lib/site.ts";

test("previews do not advertise a production URL or enable indexing", () => {
  assert.deepEqual(getSiteConfiguration({}), { url: null, indexable: false });
});
test("production indexing requires an explicit HTTPS domain and opt-in", () => {
  const env = { SITE_URL: "https://portfolio.example.org" };
  assert.equal(getSiteConfiguration(env).indexable, false);
  const site = getSiteConfiguration({ ...env, SITE_INDEXABLE: "true" });
  assert.equal(site.indexable, true);
  assert.equal(site.url.href, "https://portfolio.example.org/");
});
test("unsafe or malformed site origins never enable indexing", () => {
  for (const value of ["invalid", "http://example.org", "https://user:password@example.org", "https://example.org/subpath", "https://example.org/?private=true", "https://example.org/#anchor"]) {
    assert.equal(getSiteConfiguration({ SITE_URL: value, SITE_INDEXABLE: "true" }).url, null);
  }
});
