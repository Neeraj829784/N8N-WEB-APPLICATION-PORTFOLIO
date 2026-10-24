"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";

const commands = [
  ["Explore example projects", "#work", "nodes"],
  ["View automation services", "#services", "settings"],
  ["Explore the toolkit", "#stack", "code"],
  ["Meet your automation partner", "#about", "user"],
  ["Start a project brief", "#contact", "mail"],
] as const;

export function CommandMenu() {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const search = query.trim().toLowerCase();
  const filtered = commands.filter(([title, href]) => `${title} ${href}`.toLowerCase().includes(search));
  function open() { setQuery(""); dialog.current?.showModal(); }
  function close() { dialog.current?.close(); }
  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (dialog.current?.open) dialog.current.close();
        else { setQuery(""); dialog.current?.showModal(); }
      }
    };
    document.addEventListener("keydown", keyboard);
    return () => document.removeEventListener("keydown", keyboard);
  }, []);
  return <>
    <button className="command-trigger" type="button" onClick={open} aria-label="Open command menu" aria-haspopup="dialog"><Icon name="search" size={15} /><span>Ctrl K</span></button>
    <dialog ref={dialog} className="command-dialog" aria-labelledby="command-title" onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div className="command-shell">
        <div className="command-search"><Icon name="search" /><label id="command-title" htmlFor="command-search" className="sr-only">Search site navigation</label><input ref={input} id="command-search" autoComplete="off" placeholder="Where would you like to go?" value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => {
          if(event.key === "ArrowDown") { event.preventDefault(); dialog.current?.querySelector<HTMLButtonElement>(".command-result")?.focus(); }
          if(event.key === "Enter" && filtered[0]) { event.preventDefault(); close(); document.querySelector(filtered[0][1])?.scrollIntoView({behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"}); }
        }} /><button type="button" onClick={close} aria-label="Close command menu">Esc</button></div>
        <div className="command-results">{filtered.length ? filtered.map(([title, href, icon]) => <button className="command-result" key={href} type="button" onClick={() => { close(); document.querySelector(href)?.scrollIntoView({behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth"}); }} onKeyDown={event => {
          const buttons = [...(dialog.current?.querySelectorAll<HTMLButtonElement>(".command-result") ?? [])]; const index = buttons.indexOf(event.currentTarget);
          if(event.key === "Enter") { event.preventDefault(); event.currentTarget.click(); }
          if(event.key === "ArrowDown") { event.preventDefault(); buttons[(index+1)%buttons.length]?.focus(); }
          if(event.key === "ArrowUp") { event.preventDefault(); if(index === 0) input.current?.focus(); else buttons[index-1]?.focus(); }
        }}><Icon name={icon} size={17} /><span>{title}</span><span>↗</span></button>) : <p className="command-empty" role="status">No matching destinations. Try “projects” or “contact”.</p>}</div>
        <div className="command-hint"><span>↑ ↓ to navigate</span><span>Enter to select · Esc to close</span></div>
      </div>
    </dialog>
  </>;
}
