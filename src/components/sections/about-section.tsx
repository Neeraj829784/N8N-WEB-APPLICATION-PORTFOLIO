import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
import { BrandMark } from "@/components/ui/brand-mark";
import { portfolio } from "@/data/portfolio";

export function AboutSection() {
  return <section id="about" className="section-space about-section"><Container><div className="about-layout"><div className="about-note"><BrandMark className="large-monogram" /><p className="eyebrow">How I work</p><h3>Clear logic.<br />Useful systems.<br /><span>Human ownership.</span></h3><ul><li><Icon name="check" size={15} /> Direct communication</li><li><Icon name="check" size={15} /> Agreed scope and deliverables</li><li><Icon name="check" size={15} /> Documentation you can use</li></ul></div><div><p className="eyebrow">The person behind the workflows</p><h2>Your automation partner,<br /><span>from first map to handover.</span></h2><p className="about-copy">{portfolio.about}</p><p className="about-copy">Good automation starts by understanding the people using it. I work with you to identify the repetitive steps, define the exceptions, and build something that fits the tools you already have.</p><div className="about-facts"><span><span className="signal-dot" />{portfolio.location}</span><span>Independent · Hands-on · Remote</span></div></div></div></Container></section>;
}

