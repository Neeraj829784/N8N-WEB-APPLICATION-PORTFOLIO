import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
import { portfolio } from "@/data/portfolio";
export function ServicesSection() {
  return <section id="services" className="section-space services-section"><Container><div className="service-layout">
    <div className="service-intro"><p className="eyebrow">WHERE I CAN HELP</p><h2>Find the repeat.<br /><span>Design the relief.</span></h2><p>The best starting point is one recurring process with a clear owner and a useful outcome.</p><a className="text-link" href="#contact">Tell me what slows you down <Icon name="arrow" size={14} /></a><div className="service-annotation"><span>↳</span><p>Your tools stay.<br />The busywork goes.</p></div></div>
    <div className="service-grid">{portfolio.services.map(service=><article className="service-card" key={service.number}><span className="icon-tile"><Icon name={service.icon} /></span><span className="card-index">/{service.number}</span><h3>{service.title}</h3><p>{service.description}</p></article>)}</div>
  </div></Container></section>;
}

