import { ToolLabel } from "@/components/ui/tool-label";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
import { portfolio } from "@/data/portfolio";

export function ToolkitSection() {
  return <section id="stack" className="section-space toolkit-section"><Container><div className="section-heading"><p className="eyebrow">The toolkit</p><h2>Thoughtful connections.<br /><span>Practical technology.</span></h2><p>The workflow decides the tools. The goal stays the same: clear data, useful logic, and a system that fits your business.</p></div><div className="toolkit-grid">{portfolio.toolkit.map(group => <article className="toolkit-card" key={group.title}><div><Icon name={group.icon} size={17} /><h3>{group.title}</h3></div><div className="tag-list">{group.tools.map(tool => <span key={tool}><ToolLabel name={tool} /></span>)}</div></article>)}</div></Container></section>;
}

