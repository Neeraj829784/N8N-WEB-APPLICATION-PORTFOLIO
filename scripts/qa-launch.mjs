import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";

const pages = await (await fetch("http://127.0.0.1:9227/json")).json();
const page = pages.find(item => item.type === "page" && item.url.includes("3000")) ?? pages.find(item => item.type === "page");
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
let id = 0;
const pending = new Map();
let mockDelivery = false;
let deliveryResult = "failure";
let posted = [];
const runtimeErrors = [];
socket.onmessage = async event => {
  const message = JSON.parse(event.data);
  const call = pending.get(message.id);
  if (call) {
    pending.delete(message.id);
    if (message.error) call.reject(Error(JSON.stringify(message.error)));
    else call.resolve(message.result);
  }
  if (message.method === "Runtime.exceptionThrown") runtimeErrors.push(message.params.exceptionDetails.text);
  if (message.method === "Fetch.requestPaused") {
    const { requestId, request } = message.params;
    if (request.method === "GET") {
      await cdp("Fetch.fulfillRequest", { requestId, responseCode: 200, responseHeaders: [{ name: "Content-Type", value: "application/json" }], body: Buffer.from(JSON.stringify({ deliveryEnabled: mockDelivery, deliveryProvider: mockDelivery ? "resend" : null })).toString("base64") });
    } else {
      posted.push(JSON.parse(request.postData));
      await wait(300);
      const body = deliveryResult === "success" ? { message: "Your enquiry has been accepted for email delivery. Thank you for getting in touch." } : { message: "Your enquiry could not be sent. Please try again, or save your brief below." };
      await cdp("Fetch.fulfillRequest", { requestId, responseCode: deliveryResult === "success" ? 200 : 502, responseHeaders: [{ name: "Content-Type", value: "application/json" }], body: Buffer.from(JSON.stringify(body)).toString("base64") });
    }
  }
};
const cdp = (method, params = {}) => new Promise((resolve, reject) => { pending.set(++id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
const evaluate = async expression => {
  const result = await cdp("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const check = (value, name) => { assert.ok(value, name); console.log("PASS: " + name); };
const fill = (selector, value) => evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value').set.call(el,${JSON.stringify(value)});el.dispatchEvent(new Event('input',{bubbles:true}));})()`);
const viewport = width => cdp("Emulation.setDeviceMetricsOverride", { width, height: 1000, deviceScaleFactor: 1, mobile: false });
const axe = await readFile(new URL("../node_modules/axe-core/axe.min.js", import.meta.url), "utf8");

async function audit(label) {
  await evaluate(axe);
  const result = await evaluate("axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','best-practice']}}).then(r=>({violations:r.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})),passes:r.passes.length}))");
  await writeFile(`qa-accessibility-${label}.json`, JSON.stringify(result, null, 2));
  if (result.violations.length) console.log(JSON.stringify(result.violations, null, 2));
  check(result.violations.length === 0, `No automated accessibility violations: ${label}`);
}

try {
  await cdp("Page.enable"); await cdp("Runtime.enable"); await cdp("Network.enable");
  await cdp("Network.setCacheDisabled", { cacheDisabled: true });
  await cdp("Page.addScriptToEvaluateOnNewDocument", { source: "window.__pageMetrics={cls:0,lcp:0};new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__pageMetrics.cls+=e.value}).observe({type:'layout-shift',buffered:true});new PerformanceObserver(list=>{for(const e of list.getEntries())window.__pageMetrics.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});" });
  await viewport(1440);
  await cdp("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await cdp("Page.navigate", { url: "http://127.0.0.1:3000/" }); await wait(1400); await evaluate("document.fonts.ready");
  check(await evaluate("document.title.includes('Vasupalli Neeraj')"), "Client identity is present in metadata");
  check(await evaluate("!!document.querySelector('meta[property=\"og:image\"]')&&!!document.querySelector('meta[name=\"twitter:image\"]')"), "Open Graph and Twitter sharing images are wired");
  check(await evaluate("document.querySelector('meta[name=\"robots\"]').content.includes('noindex')"), "Unconfigured previews remain unindexed");
  await audit("desktop");
  await evaluate("document.querySelector('.command-trigger').click()"); await fill("#command-search", " contact "); await wait(80);
  check(await evaluate("document.querySelectorAll('.command-result').length===1&&document.querySelector('.command-result').textContent.includes('brief')"), "Contact search works with surrounding spaces");
  await evaluate("document.querySelector('.command-dialog').close()");
  await fill("#process-description", " ".repeat(30)); await evaluate("document.querySelector('.brief-submit').click()"); await wait(80);
  check(await evaluate("!!document.querySelector('#description-error')&&!document.querySelector('.brief-preview')&&document.activeElement.id==='process-description'"), "Whitespace-only briefs show a focused validation error");
  await viewport(390); await evaluate("document.querySelector('.menu-toggle').click();document.querySelector('.menu-toggle').focus()");
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape" });
  check(await evaluate("!document.querySelector('#mobile-navigation')&&document.activeElement.classList.contains('menu-toggle')"), "Escape closes the phone menu from its toggle");
  await evaluate("document.querySelector('.menu-toggle').click()"); await viewport(1440); await wait(80); await viewport(390);
  check(await evaluate("!document.querySelector('#mobile-navigation')"), "Desktop resize resets the phone menu");

  mockDelivery = true;
  await cdp("Fetch.enable", { patterns: [{ urlPattern: "*/api/contact", requestStage: "Request" }] });
  await cdp("Page.navigate", { url: "http://127.0.0.1:3000/?qa=delivery#contact" }); await wait(1100);
  check(await evaluate("!!document.querySelector('#enquiry-email')&&document.querySelector('.brief-submit').textContent.includes('Send my enquiry')"), "Configured delivery mode collects reply details");
  check(await evaluate("document.querySelector('.privacy-note').textContent.includes('processed by Resend')"), "Email processing is disclosed before submission");
  await evaluate("document.querySelector('.brief-form').scrollIntoView({block:'start'})");
  await writeFile("qa-contact-delivery-form.png", Buffer.from((await cdp("Page.captureScreenshot", { format: "png" })).data, "base64"));
  await fill("#enquiry-name", "Preview Visitor"); await fill("#enquiry-email", "preview@example.org");
  await fill("#process-description", "We manually copy new enquiries into a spreadsheet every morning.");
  await fill("#project-tools", "Gmail, Google Sheets");
  await evaluate("document.querySelector('.brief-submit').click();document.querySelector('.brief-submit').click()"); await wait(70);
  check(await evaluate("document.querySelector('.brief-submit').disabled&&document.querySelector('.brief-form').getAttribute('aria-busy')==='true'"), "Sending state prevents repeated submissions");
  await wait(500);
  check(posted.length === 1, "Double-click creates only one delivery request");
  check(await evaluate("document.querySelector('[role=\"alert\"]').textContent.includes('could not be sent')&&document.querySelector('#enquiry-email').value==='preview@example.org'&&!!document.querySelector('.brief-preview')"), "Delivery failure preserves inputs and the downloadable brief");
  await evaluate("document.querySelector('.brief-submit').scrollIntoView({block:'center'})");
  await audit("mobile-delivery-error");
  await writeFile("qa-contact-delivery-error.png", Buffer.from((await cdp("Page.captureScreenshot", { format: "png" })).data, "base64"));
  deliveryResult = "success";
  await evaluate("document.querySelector('.brief-submit').click()"); await wait(500);
  check(await evaluate("document.querySelector('.brief-submit').disabled&&document.querySelector('.brief-submit').textContent.includes('Enquiry submitted')&&document.querySelector('.form-feedback').textContent.includes('accepted for email delivery')"), "Accepted delivery is not misrepresented as confirmed inbox delivery");
  check(posted.length === 2 && posted[1].email === "preview@example.org" && posted[1].enquiryId === posted[0].enquiryId, "Retry preserves the enquiry details and stable delivery ID");
  for (const width of [320, 390, 768, 1440]) { await viewport(width); check(await evaluate("document.documentElement.scrollWidth<=innerWidth"), `Delivery form fits at ${width}px`); }
  await viewport(390);
  await evaluate("document.querySelector('.brief-submit').scrollIntoView({block:'center'})");
  await writeFile("qa-contact-delivery-success.png", Buffer.from((await cdp("Page.captureScreenshot", { format: "png" })).data, "base64"));
  await cdp("Fetch.disable"); mockDelivery = false;

  const pageResponse = await fetch("http://127.0.0.1:3000/");
  check(pageResponse.headers.get("x-content-type-options") === "nosniff", "Production response headers are present");
  const contactConfig = await (await fetch("http://127.0.0.1:3000/api/contact")).json();
  if (!contactConfig.deliveryEnabled) {
    const headers = { Origin: "http://127.0.0.1:3000", "Content-Type": "application/json" };
    const invalid = await fetch("http://127.0.0.1:3000/api/contact", { method: "POST", headers, body: JSON.stringify({ ...posted[0], description: " ".repeat(20) }) });
    check(invalid.status === 400, "The real server rejects whitespace-only enquiries");
    const unavailable = await fetch("http://127.0.0.1:3000/api/contact", { method: "POST", headers, body: JSON.stringify(posted[0]) });
    check(unavailable.status === 503, "The real server never reports delivery when unconfigured");
  }
  const robots = await fetch("http://127.0.0.1:3000/robots.txt");
  check(robots.ok && (await robots.text()).includes("Disallow: /"), "Preview robots file blocks indexing");
  const sitemap = await fetch("http://127.0.0.1:3000/sitemap.xml");
  check(sitemap.ok && !(await sitemap.text()).includes("<loc>"), "Preview sitemap contains no invented domain");
  const image = await fetch("http://127.0.0.1:3000/opengraph-image");
  check(image.ok && image.headers.get("content-type").includes("image/png"), "Social preview renders as a PNG");
  await writeFile("qa-social-preview.png", Buffer.from(await image.arrayBuffer()));
  const missing = await fetch("http://127.0.0.1:3000/nonexistent-page-check");
  check(missing.status === 404 && (await missing.text()).includes("Back to the portfolio"), "Unknown pages have a helpful branded 404");

  await viewport(1440); await cdp("Page.navigate", { url: "http://127.0.0.1:3000/" }); await wait(1400);
  console.log("LOCAL_PERFORMANCE", await evaluate("({...window.__pageMetrics,fcp:performance.getEntriesByName('first-contentful-paint')[0]?.startTime,initialJsKB:Math.round(performance.getEntriesByType('resource').filter(e=>e.initiatorType==='script').reduce((sum,e)=>sum+e.encodedBodySize,0)/1024)})"));
  check(runtimeErrors.length === 0, "No uncaught browser exceptions during launch checks");
  console.log("LAUNCH_QA=PASS (delivery UI responses were mocked; no external enquiries sent)");
} finally {
  try { await cdp("Fetch.disable"); await cdp("Network.setCacheDisabled", { cacheDisabled: false }); } catch { /* Session may already be closed after a failure. */ }
  socket.close();
}
