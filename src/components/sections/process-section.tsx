import { Container } from "@/components/ui/container";
import { portfolio } from "@/data/portfolio";

export function ProcessSection() {
  return <section id="process" className="section-space process-section"><Container><div className="section-heading"><p className="eyebrow">WORKING WITH ME</p><h2>From our first call<br /><span>to your working workflow.</span></h2><p>A clear plan, direct communication, and a handover that leaves you in control.</p></div><ol className="process-grid">{portfolio.process.map(([title,description],index) => <li key={title}><span className="phase-number" aria-hidden="true">0{index+1}</span><span className="phase-line" aria-hidden="true" /><h3>{title}</h3><p>{description}</p></li>)}</ol></Container></section>;
}

