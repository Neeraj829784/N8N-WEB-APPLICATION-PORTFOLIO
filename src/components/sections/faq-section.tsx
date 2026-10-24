import { Container } from "@/components/ui/container";

const questions = [
  ["What can you automate for my business?", "Start with work that repeats: copying enquiries into a CRM, moving data between tools, preparing reports, or setting up a new client. We review the inputs, rules, and exceptions together to decide what is a good fit."],
  ["Do I need to know how n8n works?", "No. Describe the process in everyday language and show the tools you use. I handle the workflow mapping and technical implementation, then walk you through how to use and understand the result."],
  ["How are scope and pricing decided?", "The scope depends on the tools involved, the data, the business rules, and the testing required. We agree on deliverables and a quote before a build begins."],
  ["What happens when something goes wrong?", "We plan for missing inputs, unavailable services, and unexpected responses during design. Appropriate checks and alerts are included in the agreed scope so failures are visible and the next action is clear."],
  ["Will I own and understand the workflow?", "The handover includes the workflow, a walkthrough, and practical operating notes. Hosting, service accounts, and ongoing support requirements are agreed as part of the project."],
];

export function FaqSection() {
  return <section className="faq-section section-space"><Container><div className="faq-layout"><div><p className="eyebrow">Before we start</p><h2>Good questions.<br /><em>Clear answers.</em></h2><p className="mt-6 max-w-sm leading-7 text-foreground-muted">A little clarity now makes for a better working relationship later.</p></div><div className="faq-list">{questions.map(([title, answer]) => <details key={title}><summary>{title}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></div></Container></section>;
}

