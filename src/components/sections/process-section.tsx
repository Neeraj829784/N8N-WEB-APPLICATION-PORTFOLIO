import { Container } from "@/components/ui/container";
import { portfolio } from "@/data/portfolio";

export function ProcessSection() {
  return <section id="process" className="section-space process-section"><Container><div className="section-heading"><p className="eyebrow">From idea to operating workflow</p><h2>A clear process.<br /><span>At every connection.</span></h2><p>Know what is being built, why it matters, and what happens next.</p></div><ol className="process-grid">{portfolio.process.map(([title,description],index) => <li key={title}><span className="phase-number">0{index+1}</span><span className="phase-line" aria-hidden="true" /><h3>{title}</h3><p>{description}</p></li>)}</ol></Container></section>;
}

