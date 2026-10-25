import { ToolLabel } from "@/components/ui/tool-label";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
import { portfolio } from "@/data/portfolio";

export function ToolkitSection() {
  return <section id="stack" className="section-space toolkit-section"><Container><div className="section-heading"><p className="eyebrow">TOOLS I WORK WITH</p><h2>Your tools.<br /><span>Working together.</span></h2><p>n8n connects the apps you already use. I handle the APIs, data mapping, and checks that keep the workflow understandable.</p></div><div className="toolkit-grid">{portfolio.toolkit.map(group => <article className="toolkit-card" key={group.title}><div><Icon name={group.icon} size={17} /><h3>{group.title}</h3></div><div className="tag-list">{group.tools.map(tool => <span key={tool}><ToolLabel name={tool} /></span>)}</div></article>)}</div></Container></section>;
}

