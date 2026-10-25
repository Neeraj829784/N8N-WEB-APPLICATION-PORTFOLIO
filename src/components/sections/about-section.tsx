import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
import { BrandMark } from "@/components/ui/brand-mark";
import { portfolio } from "@/data/portfolio";

export function AboutSection() {
  return <section id="about" className="section-space about-section"><Container><div className="about-layout"><div className="about-note"><BrandMark className="large-monogram" /><p className="eyebrow">How I work</p><h3>Direct contact.<br />Clear scope.<br /><span>Your workflow.</span></h3><ul><li><Icon name="check" size={15} /> Direct communication</li><li><Icon name="check" size={15} /> Agreed scope and deliverables</li><li><Icon name="check" size={15} /> Documentation you can use</li></ul></div><div><p className="eyebrow">Hi, I&apos;m {portfolio.name}</p><h2>Your automation specialist,<br /><span>from first call to handover.</span></h2><p className="about-copy">{portfolio.about}</p><p className="about-copy">You work directly with me to agree on the scope, review the workflow, and understand how to run it after handover.</p><div className="about-facts"><span><span className="signal-dot" />{portfolio.location}</span><span>Independent · Hands-on · Remote</span></div></div></div></Container></section>;
}

