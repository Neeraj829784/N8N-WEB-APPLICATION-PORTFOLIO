// Navigation-only regression checks. Never fills or submits the contact form.
const origin = new URL(process.env.QA_ORIGIN || "http://127.0.0.1:3000").origin;
const browser = process.env.QA_CDP_URL || "http://127.0.0.1:9227";
const tab = await (await fetch(`${browser}/json/new?${encodeURIComponent(origin)}`, { method: "PUT" })).json();
const socket = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
let sequence = 0;
const pending = new Map();
socket.onmessage = event => {
  const response = JSON.parse(event.data);
  const call = pending.get(response.id);
  if (!call) return;
  pending.delete(response.id);
  clearTimeout(call.timer);
  if (response.error) call.reject(Error(JSON.stringify(response.error)));
  else call.resolve(response.result);
};
const cdp = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++sequence;
  const timer = setTimeout(() => { pending.delete(id); reject(Error(`Timed out: ${method}`)); }, 10_000);
  pending.set(id, { resolve, reject, timer });
  socket.send(JSON.stringify({ id, method, params }));
});
const evaluate = async expression => {
  const result = await cdp("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
};
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const check = (value, label) => { if (!value) throw Error(`FAIL: ${label}`); console.log(`PASS: ${label}`); };
async function until(expression, label) {
  for (let attempt = 0; attempt < 60; attempt++) {
    if (await evaluate(expression)) return;
    await wait(100);
  }
  throw Error(`Timed out: ${label}`);
}
const key = async (name, modifiers = 0) => {
  await cdp("Input.dispatchKeyEvent", { type: "keyDown", key: name, modifiers });
  await cdp("Input.dispatchKeyEvent", { type: "keyUp", key: name });
};

try {
  await cdp("Page.enable");
  await cdp("Page.bringToFront");
  await cdp("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await cdp("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await until("(()=>{const b=document.querySelector('.command-trigger');if(!b)return false;if(!document.querySelector('.command-dialog').open)b.click();return document.querySelector('.command-dialog').open})()", "page hydration");
  await evaluate("document.querySelector('.command-dialog').close()");

  for (const [selector, expected] of [["#work", "#work"], ["#services", "#services"], ["#stack", "#stack"], ["#about", "#about"], ["#process", null], [".faq-section", null], ["#contact", null], ["#about", "#about"], ["#top", null]]) {
    await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({behavior:'instant',block:'start'})`);
    await wait(200);
    check(await evaluate(`(document.querySelector('nav[aria-label="Primary navigation"] a[aria-current]')?.getAttribute('href')??null)===${JSON.stringify(expected)}`), `Active navigation matches ${selector}, including reverse scrolling`);
  }

  await evaluate("history.replaceState(null,'','#about');document.querySelector('#about').scrollIntoView({behavior:'instant'});document.querySelector('.command-trigger').click()");
  const historyLength = await evaluate("history.length");
  await evaluate("document.querySelector('.command-result[href=\"#services\"]').click()");
  await until("location.hash==='#services'&&!document.querySelector('.command-dialog').open", "mouse navigation");
  check(await evaluate(`history.length===${historyLength + 1}`), "Mouse selection updates the fragment and adds a history entry");
  check(await evaluate("Math.abs(document.querySelector('#services').getBoundingClientRect().top-110)<5"), "Reduced-motion navigation respects the sticky header offset");
  await evaluate("history.back()");
  await until("location.hash==='#about'", "Back navigation");
  await evaluate("history.forward()");
  await until("location.hash==='#services'", "Forward navigation");
  check(true, "Browser Back and Forward revisit command destinations");

  await evaluate("document.querySelector('.command-trigger').click()");
  await evaluate("(()=>{const input=document.querySelector('#command-search');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'toolkit');input.dispatchEvent(new Event('input',{bubbles:true}));input.focus()})()");
  await until("document.querySelectorAll('.command-result').length===1", "command search");
  await key("Enter");
  await until("location.hash==='#stack'&&!document.querySelector('.command-dialog').open", "Enter in search");
  check(true, "Enter in search uses the same native fragment navigation");

  await evaluate("document.querySelector('.command-trigger').click();document.querySelector('#command-search').focus()");
  await key("ArrowDown");
  check(await evaluate("document.activeElement.matches('a.command-result')"), "ArrowDown focuses a semantic destination link");
  await key("ArrowUp");
  check(await evaluate("document.activeElement.id==='command-search'"), "ArrowUp returns to search from the first result");
  await key("ArrowDown");
  await key("Enter");
  await until("location.hash==='#work'&&!document.querySelector('.command-dialog').open", "Enter on a result");
  check(true, "Keyboard result selection updates the URL");

  for (const [platform, hint, modifier] of [["MacIntel", "⌘ K", 4], ["Win32", "Ctrl K", 2]]) {
    await cdp("Emulation.setUserAgentOverride", { userAgent: await evaluate("navigator.userAgent"), platform });
    await cdp("Page.navigate", { url: origin });
    await until(`document.querySelector('.command-trigger')?.innerText===${JSON.stringify(hint)}`, `${platform} shortcut hint`);
    await until("(()=>{const button=document.querySelector('.command-trigger');const dialog=document.querySelector('.command-dialog');if(!dialog.open)button.click();return dialog.open})()", `${platform} command menu hydration`);
    await evaluate("document.querySelector('.command-dialog').close()");
    await key("k", modifier);
    await until("document.querySelector('.command-dialog')?.open===true", `${platform} keyboard shortcut`);
    check(true, `${platform} shows ${hint} and the advertised shortcut opens the menu`);
    await key("Escape");
  }

  await cdp("Emulation.setDeviceMetricsOverride", { width: 390, height: 1000, deviceScaleFactor: 1, mobile: false });
  await evaluate("document.querySelector('.command-trigger').click();document.querySelector('.command-result[href=\"#contact\"]').click()");
  await until("location.hash==='#contact'", "phone command navigation");
  check(await evaluate("document.documentElement.scrollWidth<=innerWidth"), "Phone command navigation has no horizontal overflow");
  check(await evaluate("document.querySelector('meta[name=robots]').content.includes('noindex')"), "Search indexing remains disabled");
  console.log("NAVIGATION_QA=PASS (no email submissions)");
} finally {
  for (const call of pending.values()) clearTimeout(call.timer);
  socket.close();
  await fetch(`${browser}/json/close/${tab.id}`).catch(() => {});
}
