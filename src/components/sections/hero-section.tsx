import Image from "next/image";
import { ToolLabel } from "@/components/ui/tool-label";
import { Container } from "@/components/ui/container";
import { Icon } from "@/components/ui/icon";
import { portfolio } from "@/data/portfolio";
import { MotionControl } from "@/components/ui/motion-control";

export function HeroSection() {
  return <section id="top" className="technical-hero"><Container>
    <div className="hero-intro">
      <p className="hero-kicker"><span className="signal-dot" /> Independent n8n specialist <span className="kicker-divider">/</span><span>{portfolio.location}</span></p>
      <p className="personal-intro">Hey, I’m <strong className="font-semibold text-foreground">{portfolio.name}</strong> <span aria-hidden="true">↗</span></p>
      <h1>I connect apps.<br /><span>You get<br />your time back.</span></h1>
      <p className="hero-description">I build n8n automations for founders and small teams. Lead routing, client onboarding, connected tools, and recurring reports—built around the way you work.</p>
      <div className="hero-actions"><a className="button" href="#contact">Plan my automation <Icon name="arrow" size={17} /></a><a className="text-link" href="#work">Explore example projects <span aria-hidden="true">↓</span></a></div>
      <div className="hero-assurance"><span><Icon name="user" size={14} /> Work directly with me</span><span><Icon name="code" size={14} /> Your tools, connected</span></div>
    </div>
    <div className="hero-visual"><div className="connection-atlas" aria-label="Illustrative automation: business inputs connect through n8n to organised outcomes">
      <div className="atlas-label"><span className="eyebrow">THE CONNECTION LAYER</span><span>Illustrative system / 001</span></div>
      <div className="atlas-grid">
        <svg className="atlas-lines" viewBox="0 0 1000 280" preserveAspectRatio="none" aria-hidden="true"><g fill="none"><path d="M220 48H320Q390 48 390 140H465M220 140H465M220 232H320Q390 232 390 140" /><path d="M535 140H610Q610 48 680 48H780M535 140H780M610 140Q610 232 680 232H780" />
          {["M220 48H320Q390 48 390 140H465","M220 140H465","M220 232H320Q390 232 390 140H465","M535 140H610Q610 48 680 48H780","M535 140H780","M535 140H610Q610 232 680 232H780"].map((path,index)=><path key={path} className={"packet-signal packet-" + index} d={path} pathLength="1" />)}
        </g></svg>
        <div className="atlas-sources">{[["inbox","New enquiries","Form submissions"],["database","Scattered data","Sheets & business tools"],["user","Client handoffs","People & processes"]].map(([icon,title,subtitle])=><div className="atlas-endpoint" key={title}><span><Icon name={icon} size={18} /></span><div><strong>{title}</strong><small>{subtitle}</small></div></div>)}</div>
        <div className="atlas-core"><div className="core-orbit" aria-hidden="true" /><span className="core-badge"><Image className="n8n-platform-logo" src="/brand/n8n-connected-nodes.svg" alt="n8n" width={66} height={35} unoptimized /></span><span className="core-caption">Workflow orchestration</span></div>
        <div className="atlas-outcomes">{[["check","Clean records","Validated & organised"],["mail","The right notification","Context delivered"],["chart","A clear next step","Less manual coordination"]].map(([icon,title,subtitle])=><div className="atlas-endpoint" key={title}><span><Icon name={icon} size={18} /></span><div><strong>{title}</strong><small>{subtitle}</small></div></div>)}</div>
      </div>
      <div className="atlas-footer"><span>INPUTS</span><span>CONNECT · DECIDE · ACT</span><MotionControl /><span>OUTCOMES</span></div>
    </div></div>
    <div className="hero-bottom"><span>YOUR TOOLS. ONE CONNECTED SYSTEM.</span><div className="hero-tool-list"><span><ToolLabel name="n8n" /></span><span>Webhooks</span><span>Google Sheets</span><span>Notion</span><span>APIs</span></div><a href="#services">Explore services <Icon name="arrow" size={13} /></a></div>
  </Container></section>;
}

