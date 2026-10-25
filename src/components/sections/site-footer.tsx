import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
import { BrandMark } from "@/components/ui/brand-mark";
import { portfolio } from "@/data/portfolio";

export function SiteFooter() {
  return <footer className="site-footer"><Container><div className="footer-main"><div><a href="#top" className="footer-brand"><BrandMark /><strong>{portfolio.name}</strong></a><p>n8n automation for founders and small teams.<br />Less manual work. Better connected tools.</p></div><div><span className="eyebrow">Explore</span><a href="#work">Automation workflows</a><a href="#services">Services</a><a href="#stack">Toolkit</a></div><div><span className="eyebrow">Connect</span>{portfolio.socialLinks.map(link=><a key={link.label} href={link.href} target="_blank" rel="noreferrer">{link.label} <Icon name="arrow" size={12} /></a>)}<a href="#contact">Start a project</a><a href="#about">About me</a></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} {portfolio.name}.</span><span><span className="signal-dot" />Available for freelance projects</span><a href="#top">Back to top ↑</a></div></Container></footer>;
}

