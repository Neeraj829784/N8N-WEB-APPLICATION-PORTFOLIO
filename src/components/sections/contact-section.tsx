"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Container } from "@/components/ui/container";
import { BrandMark } from "@/components/ui/brand-mark";
import { portfolio } from "@/data/portfolio";
import { contactServices, formatBrief, validateContact, type ContactErrors, type ContactField } from "@/lib/contact-validation";

export function ContactSection({ deliveryEnabled: initialDeliveryEnabled = false, deliveryProvider: initialDeliveryProvider = null }: { deliveryEnabled?: boolean; deliveryProvider?: "resend" | "webhook" | null }) {
  const [deliveryEnabled, setDeliveryEnabled] = useState(initialDeliveryEnabled);
  const [deliveryProvider, setDeliveryProvider] = useState(initialDeliveryProvider);
  const [service, setService] = useState<string>(contactServices[0]);
  const [description, setDescription] = useState("");
  const [tools, setTools] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [ready, setReady] = useState(false);
  const sending = useRef(false);
  const enquiryId = useRef<string | null>(null);
  const configuredEmail = portfolio.email.trim() !== "hello@example.com" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(portfolio.email);
  const values = { service, description: description.trim(), tools: tools.trim(), name: name.trim(), email: email.trim() };
  const brief = formatBrief(values);
  const emailHref = "mailto:" + portfolio.email + "?subject=" + encodeURIComponent("Automation project: " + service) + "&body=" + encodeURIComponent(brief);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/contact", { cache: "no-store", signal: controller.signal })
      .then(response => response.ok ? response.json() : null)
      .then(config => {
        if (config && !controller.signal.aborted) {
          setDeliveryEnabled(config.deliveryEnabled === true);
          setDeliveryProvider(config.deliveryProvider === "resend" || config.deliveryProvider === "webhook" ? config.deliveryProvider : null);
        }
      })
      .catch(() => { /* The local brief remains usable if delivery status is unavailable. */ });
    return () => controller.abort();
  }, []);

  function edited() {
    enquiryId.current = null;
    setReady(false);
    setErrors({});
    setMessage("");
    setStatus("idle");
  }

  function focusError(fields: ContactErrors) {
    const ids: Record<ContactField, string> = { name: "enquiry-name", email: "enquiry-email", service: "service-first", description: "process-description", tools: "project-tools" };
    const field = (["name", "email", "service", "description", "tools"] as ContactField[]).find(key => fields[key]);
    if (field) requestAnimationFrame(() => document.getElementById(ids[field])?.focus());
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current || status === "success") return;
    const result = validateContact(values, deliveryEnabled);
    if (!result.success) {
      setErrors(result.errors);
      setStatus("error");
      setMessage("Please check the highlighted fields.");
      setReady(false);
      focusError(result.errors);
      return;
    }
    setErrors({});
    setReady(true);
    if (!deliveryEnabled) {
      setMessage("Your project brief is ready to review.");
      return;
    }

    sending.current = true;
    enquiryId.current ??= crypto.randomUUID();
    setStatus("sending");
    setMessage("Sending your enquiry…");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...result.data, website, enquiryId: enquiryId.current }),
        signal: AbortSignal.timeout(12000),
      });
      const payload = await response.json() as { message?: string; errors?: ContactErrors };
      if (!response.ok) {
        setStatus("error");
        setMessage(payload.message || "Your enquiry could not be sent. Please try again or save your brief.");
        if (payload.errors) { setErrors(payload.errors); focusError(payload.errors); }
      } else {
        setStatus("success");
        setMessage(payload.message || "Your enquiry has been received.");
      }
    } catch {
      setStatus("error");
      setMessage("The connection could not be confirmed. Please try again later, or save your brief below.");
    } finally {
      sending.current = false;
    }
  }

  function download() {
    const url = URL.createObjectURL(new Blob([brief], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "automation-project-brief.txt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    if (status !== "success" && status !== "sending") setMessage("Your brief has been downloaded.");
  }

  function fieldError(field: ContactField) {
    return errors[field] ? <span className="field-error" id={field + "-error"}>{errors[field]}</span> : null;
  }

  return (
    <section id="contact" className="contact-studio section-space">
      <Container>
        <div className="contact-layout">
          <div>
            <p className="eyebrow">Let&apos;s build something useful</p>
            <h2>A better workflow<br /><span>starts with a<br />conversation.</span></h2>
            <p className="contact-description">Have a repetitive process you would like to simplify? Tell me what happens today, and we can map a useful place to start.</p>
            <div className="contact-booking">
              <a className="button" href={portfolio.booking.url} target="_blank" rel="noopener noreferrer" aria-describedby="booking-details">Book a discovery call <span aria-hidden="true">↗</span><span className="sr-only"> (opens Cal.com in a new tab)</span></a>
              <p className="field-hint" id="booking-details">{portfolio.booking.details}<br />{portfolio.booking.availability}<br />Choose your time on Cal.com, or send a project brief here.</p>
            </div>
            {configuredEmail && <a className="text-link contact-email" href={"mailto:" + portfolio.email}>{portfolio.email} <span aria-hidden="true">↗</span></a>}
            <div className="contact-signature"><BrandMark /><div><strong>{portfolio.name}</strong><small>Independent specialist · Working remotely</small></div></div>
          </div>
          <form className="brief-form" onSubmit={submit} noValidate aria-busy={status === "sending"}>
            <div className="brief-header"><span>LET’S MAP THE FIRST STEP</span><span aria-hidden="true">↗</span></div>
            <fieldset disabled={status === "sending"} className="brief-fields">
              <legend className="sr-only">Automation project details</legend>
              {deliveryEnabled && (
                <div className="reply-fields">
                  <div>
                    <label htmlFor="enquiry-name">Your name</label>
                    <input id="enquiry-name" name="name" autoComplete="name" required maxLength={100} value={name} onChange={event => { setName(event.target.value); edited(); }} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-error" : undefined} />
                    {fieldError("name")}
                  </div>
                  <div>
                    <label htmlFor="enquiry-email">Email for your reply</label>
                    <input id="enquiry-email" name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => { setEmail(event.target.value); edited(); }} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} />
                    {fieldError("email")}
                  </div>
                </div>
              )}
              <fieldset>
                <legend>01 / What would you like to improve?</legend>
                <div className="service-choices">{contactServices.map((item, index) => (
                  <button key={item} id={index === 0 ? "service-first" : undefined} type="button" aria-pressed={service === item} onClick={() => { setService(item); edited(); }}>{item}</button>
                ))}</div>
                {fieldError("service")}
              </fieldset>
              <label htmlFor="process-description">02 / What happens today?</label>
              <textarea id="process-description" name="description" required minLength={15} maxLength={2000} rows={4} placeholder="We receive enquiries by email, then copy each one into a spreadsheet…" value={description} onChange={event => { setDescription(event.target.value); edited(); }} aria-invalid={!!errors.description} aria-describedby={"description-hint" + (errors.description ? " description-error" : "")} />
              <span id="description-hint" className="field-hint">A few sentences are enough. Please leave out private customer data.</span>
              {fieldError("description")}
              <label htmlFor="project-tools">03 / Which tools are involved? <span>(optional)</span></label>
              <input id="project-tools" name="tools" maxLength={300} placeholder="e.g. Gmail, Google Sheets, HubSpot" value={tools} onChange={event => { setTools(event.target.value); edited(); }} aria-invalid={!!errors.tools} aria-describedby={errors.tools ? "tools-error" : undefined} />
              {fieldError("tools")}
              <div hidden aria-hidden="true">
                <label htmlFor="company-website">Company website</label>
                <input id="company-website" name="website" autoComplete="off" tabIndex={-1} value={website} onChange={event => setWebsite(event.target.value)} />
              </div>
              <button type="submit" className="button brief-submit" disabled={status === "sending" || status === "success"}>
                {status === "sending" ? "Sending enquiry…" : status === "success" ? "Enquiry submitted" : deliveryEnabled ? "Send my enquiry" : "Prepare my project brief"}
                <span aria-hidden="true">{status === "success" ? "✓" : "↗"}</span>
              </button>
            </fieldset>
            <p className="form-feedback" role={status === "error" ? "alert" : "status"}>{message}</p>
            {ready && (
              <div className="brief-preview">
                <p className="eyebrow">Your project brief</p><pre>{brief}</pre>
                <div className="flex flex-wrap gap-3">
                  {configuredEmail && <a className="button" href={emailHref}>Open email draft ↗</a>}
                  <button type="button" className="text-link" onClick={download}>Download brief ↓</button>
                </div>
                {!deliveryEnabled && configuredEmail && <p className="field-hint">Open the email draft, review your brief, and press Send in your email app.</p>}
                {!deliveryEnabled && !configuredEmail && <p className="field-hint">Online enquiries are not available yet. You can save this brief and return when contact opens.</p>}
              </div>
            )}
            <p className="privacy-note">{deliveryEnabled ? deliveryProvider === "resend" ? "When you submit, your name, email, and project details are processed by Resend and emailed to Neeraj so he can reply. Please do not include sensitive information." : "Your name, email, and project details are sent only when you submit, so I can respond to your enquiry." : "Your answers stay in this browser page. Nothing is submitted automatically."}</p>
          </form>
        </div>
      </Container>
    </section>
  );
}

