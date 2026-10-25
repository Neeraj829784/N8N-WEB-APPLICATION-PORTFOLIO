import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
import { portfolio } from "@/data/portfolio";
export function ServicesSection() {
  return <section id="services" className="section-space services-section"><Container><div className="service-layout">
    <div className="service-intro"><p className="eyebrow">HOW I CAN HELP</p><h2>Automation that fits<br /><span>your business.</span></h2><p>Start with the task that takes up too much of your day. I can help you connect the tools and take the repeated steps off your plate.</p><a className="text-link" href="#contact">Tell me what slows you down <Icon name="arrow" size={14} /></a><div className="service-annotation"><span>↳</span><p>Your tools stay.<br />The busywork goes.</p></div></div>
    <div className="service-grid">{portfolio.services.map(service=><article className="service-card" key={service.number}><span className="icon-tile"><Icon name={service.icon} /></span><h3>{service.title}</h3><p>{service.description}</p></article>)}</div>
  </div></Container></section>;
}

