"use client";

import { useState } from "react";
import { ToolLabel } from "@/components/ui/tool-label";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
import { portfolio } from "@/data/portfolio";

const allWorkflows = "All workflows";
const filters = [allWorkflows, ...new Set(portfolio.projects.map(project => project.category))];

export function WorkSection() {
  const [filter, setFilter] = useState(allWorkflows);
  const projects = portfolio.projects.filter(project => filter === allWorkflows || project.category === filter);

  return (
    <section id="work" className="section-space work-section" aria-labelledby="work-heading">
      <Container>
        <div className="work-introduction">
          <div>
            <p className="eyebrow">WHAT I CAN AUTOMATE</p>
            <h2 id="work-heading">Less manual work.<br /><span>More room to grow.</span></h2>
          </div>
          <p>Lead follow-up, client onboarding, and regular reporting. These are workflows I can build around your tools, your team, and the way you work.</p>
        </div>
        <div className="project-filters" role="group" aria-label="Filter automation workflows">
          {filters.map(item => <button type="button" key={item} aria-pressed={filter === item} onClick={() => setFilter(item)}>{item}</button>)}
        </div>
        <p className="sr-only" role="status">{projects.length} automation workflows shown</p>
        <div className="project-list">
          {projects.map(project => (
            <article className="project-card" key={project.id} aria-labelledby={project.id + "-title"}>
              <div className="project-identity">
                <div>
                  <span className="project-category"><Icon name={project.icon} size={17} />{project.category}</span>
                  <h3 id={project.id + "-title"}>{project.title}</h3>
                  <p>{project.subtitle}</p>
                </div>
              </div>
              <div className="project-preview" aria-hidden="true">
                <div className="project-screen-stage">
                  <div className="project-screen screen-input">
                    <span className="screen-bar"><i /><i /><i /></span>
                    <span className="screen-kicker">Incoming</span>
                    <Icon name={project.icon} size={28} />
                    <strong>{project.flow[0]}</strong>
                  </div>
                  <div className="project-screen screen-output">
                    <span className="screen-bar"><i /><i /><i /></span>
                    <span className="screen-kicker">Handoff</span>
                    <Icon name="check" size={28} />
                    <strong>{project.flow[project.flow.length - 1]}</strong>
                  </div>
                  <div className="project-screen screen-main">
                    <span className="screen-bar"><i /><i /><i /><span>n8n workflow</span></span>
                    <div className="screen-flow">
                      <span><Icon name={project.icon} size={20} /><small>Trigger</small></span>
                      <b>→</b>
                      <span className="screen-n8n"><ToolLabel name="n8n" /><small>{project.flow[1]}</small></span>
                      <b>→</b>
                      <span><Icon name="check" size={20} /><small>Action</small></span>
                    </div>
                    <div className="screen-status">{project.preview}</div>
                  </div>
                </div>
              </div>
              <div className="brief-grid">
                <div className="project-title-block">
                  <p>{project.description}</p>
                  <div className="tag-list">{project.tools.map(tool => <span key={tool}><ToolLabel name={tool} /></span>)}</div>
                  <a className="text-link" href="#contact">Discuss this workflow <Icon name="arrow" size={14} /></a>
                </div>
                <div className="project-narrative">
                  <div className="story-row"><span className="eyebrow">The challenge</span><p>{project.problem}</p></div>
                  <div className="story-row"><span className="eyebrow">What I can build</span><p>{project.solution}</p></div>
                  <div className="project-outcome"><span className="eyebrow">The goal</span><p>{project.outcome}</p></div>
                </div>
              </div>
              <details className="project-notes">
                <summary>How it works <span aria-hidden="true">+</span></summary>
                <div className="project-route">
                  <div className="route-title"><h4 className="eyebrow">Workflow steps</h4></div>
                  <ol>{project.flow.map((step, index) => (
                    <li key={step}>
                      <span className="route-node" aria-hidden="true">{index + 1}</span><p>{step}</p>
                      {index < project.flow.length - 1 && <span className="route-arrow" aria-hidden="true">→</span>}
                    </li>
                  ))}</ol>
                </div>
                <p className="eyebrow workflow-features-heading">What we can include</p>
                <ul>{project.features.map(feature => <li key={feature}><Icon name="check" size={14} />{feature}</li>)}</ul>
              </details>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

