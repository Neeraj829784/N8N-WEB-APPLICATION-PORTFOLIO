"use client";
import { useState } from "react";
import { ToolLabel } from "@/components/ui/tool-label";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
import { portfolio } from "@/data/portfolio";
const filters = ["All projects", ...new Set(portfolio.projects.map(project => project.category))];

export function WorkSection() {
  const [filter, setFilter] = useState("All projects");
  const projects = portfolio.projects.filter(project => filter === "All projects" || project.category === filter);
  return <section id="work" className="section-space work-section"><Container>
    <div className="work-introduction"><div><p className="eyebrow">SELECTED AUTOMATION CONCEPTS</p><h2>The work behind<br /><span>less busywork.</span></h2></div><p>Three example systems for everyday business problems. Explore the trigger, the decisions, and the handoff. These are illustrative designs, not client case studies.</p></div>
    <div className="project-filters" role="group" aria-label="Filter example projects">{filters.map(item=><button type="button" key={item} aria-pressed={filter===item} onClick={()=>setFilter(item)}>{item}</button>)}</div>
    <p className="sr-only" role="status">{projects.length} example projects shown</p>
    <div className="project-list">{projects.map(project=><article className="project-card" key={project.id}>
      <div className="project-identity"><span className="project-sequence">0{portfolio.projects.indexOf(project)+1}<span> / SYSTEM BRIEF</span></span><span className="example-label">Example project</span></div>
      <div className="project-preview" aria-label={project.title + " illustrative workflow preview"}><span className="preview-caption">WORKFLOW / {project.category.toUpperCase()}</span><div className="project-screen-stage"><div className="project-screen screen-input" aria-hidden="true"><span className="screen-bar"><i /><i /><i /></span><span className="screen-kicker">01 / INCOMING</span><Icon name={project.icon} size={28} /><strong>{project.flow[0]}</strong><small>Input received</small></div><div className="project-screen screen-output" aria-hidden="true"><span className="screen-bar"><i /><i /><i /></span><span className="screen-kicker">03 / HANDOFF</span><Icon name="check" size={28} /><strong>{project.flow[project.flow.length-1]}</strong><small>Next step ready</small></div><div className="project-screen screen-main"><span className="screen-bar"><i /><i /><i /><span>n8n / EXAMPLE WORKFLOW</span></span><div className="screen-flow"><span><Icon name={project.icon} size={20} /><small>Trigger</small></span><b aria-hidden="true">→</b><span className="screen-n8n"><ToolLabel name="n8n" /><small>{project.flow[1]}</small></span><b aria-hidden="true">→</b><span><Icon name="check" size={20} /><small>Action</small></span></div><div className="screen-status"><span className="signal-dot" />{project.title} / illustrative sequence</div></div></div><div className="preview-result"><span>DESIGNED FOR</span><strong>{project.subtitle}</strong></div></div>
      <div className="brief-grid">
        <div className="project-title-block"><span className="project-category"><Icon name={project.icon} size={17} />{project.category}</span><h3>{project.title}</h3><p>{project.subtitle}</p><div className="tag-list">{project.tools.map(tool=><span key={tool}><ToolLabel name={tool} /></span>)}</div><a className="text-link" href="#contact">Map a similar system <Icon name="arrow" size={14} /></a></div>
        <div className="project-narrative"><div className="story-row"><span className="eyebrow">01 / The friction</span><p>{project.problem}</p></div><div className="story-row"><span className="eyebrow">02 / The connection</span><p>{project.solution}</p></div><div className="project-outcome"><span className="eyebrow">03 / Intended outcome</span><p>{project.outcome}</p></div></div>
      </div>
      <div className="project-route"><div className="route-title"><span className="eyebrow">THE PATH THROUGH THE SYSTEM</span><span>Illustrative architecture</span></div><ol>{project.flow.map((step,index)=><li key={step}><span className="route-node">{String(index+1).padStart(2,"0")}</span><p>{step}</p>{index<project.flow.length-1&&<span className="route-arrow" aria-hidden="true">→</span>}</li>)}</ol></div>
      <details className="project-notes"><summary>Implementation notes <span aria-hidden="true">+</span></summary><ul>{project.features.map(feature=><li key={feature}><Icon name="check" size={14} />{feature}</li>)}</ul></details>
    </article>)}</div>
  </Container></section>;
}

