"use client";

import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/container";
import { BrandMark } from "@/components/ui/brand-mark";
import { portfolio } from "@/data/portfolio";
import { CommandMenu } from "@/components/ui/command-menu";

const links = [["Systems", "#work"], ["Capabilities", "#services"], ["Toolkit", "#stack"], ["Profile", "#about"]] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function dismiss(event: KeyboardEvent) {
      if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); }
    }
    const desktop = matchMedia("(min-width: 1024px)");
    function resize() { if (desktop.matches) setOpen(false); }
    document.addEventListener("keydown", dismiss);
    desktop.addEventListener("change", resize);
    return () => {
      document.removeEventListener("keydown", dismiss);
      desktop.removeEventListener("change", resize);
    };
  }, [open]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id === "top" ? "" : "#" + entry.target.id);
    }, { rootMargin: "-20% 0px -55% 0px" });
    links.forEach(([, href]) => { const node = document.querySelector(href); if (node) observer.observe(node); });
    const hero = document.querySelector("#top");
    if (hero) observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <header className="site-navigation">
      <div className="reading-progress" aria-hidden="true" />
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Container className="flex min-h-20 items-center justify-between gap-4">
        <a className="flex min-w-0 items-center gap-3" href="#top" aria-label={portfolio.name + ", home"} onClick={() => setOpen(false)}>
          <BrandMark />
          <span className="min-w-0"><strong className="block text-sm leading-tight tracking-tight">{portfolio.name}</strong><span className="block text-[10px] text-foreground-muted">n8n automation specialist</span></span>
        </a>
        <nav aria-label="Primary navigation" className="hidden lg:block">
          <ul className="flex items-center gap-1">{links.map(([label, href]) => <li key={href}><a className="nav-link" aria-current={active === href ? "location" : undefined} href={href}>{label}</a></li>)}</ul>
        </nav>
        <div className="flex items-center gap-2">
          <CommandMenu />
          <a className="button button-small hidden sm:inline-flex" href="#contact">Build with me <span aria-hidden="true">↗</span></a>
          <button ref={toggle} type="button" className="menu-toggle lg:hidden" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>{open ? "Close" : "Menu"}<span aria-hidden="true">{open ? "−" : "+"}</span></button>
        </div>
      </Container>
      {open && <nav id="mobile-navigation" aria-label="Mobile navigation" className="mobile-navigation lg:hidden" onKeyDown={(event) => { if (event.key === "Escape") { setOpen(false); toggle.current?.focus(); } }}>
        {links.map(([label, href], index) => <a href={href} key={href} onClick={() => setOpen(false)}><span>0{index + 1}</span>{label}<span aria-hidden="true">↗</span></a>)}
        <a href="#contact" onClick={() => setOpen(false)}><span>05</span>Start a conversation<span aria-hidden="true">↗</span></a>
      </nav>}
    </header>
  );
}

