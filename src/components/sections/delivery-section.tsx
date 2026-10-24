import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";

const deliverables = [
  ["nodes", "A workflow you own", "An n8n workflow built around the agreed process and connected to your accounts."],
  ["shield", "The exceptions covered", "Validation, error paths, and testing for the situations your team actually encounters."],
  ["code", "A clear handover", "A walkthrough and practical notes so you understand what runs, when, and why."],
];
export function DeliverySection() {
  return <section className="delivery-section" aria-labelledby="delivery-heading"><Container>
    <div className="delivery-heading"><p className="eyebrow">WORKING TOGETHER</p><h2 id="delivery-heading">Built for your business.<br /><span>Ready for your team.</span></h2><p>Start with one clearly defined process. We agree on the scope, tools, and expected outcome before the build begins.</p><a className="text-link" href="#contact">Describe your first workflow <Icon name="arrow" size={15} /></a></div>
    <div className="delivery-grid">{deliverables.map(([icon,title,description],index)=><article key={title}><span className="delivery-number">0{index+1}</span><Icon name={icon} size={26}/><h3>{title}</h3><p>{description}</p></article>)}</div>
  </Container></section>;
}
