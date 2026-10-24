// Server-side delivery only. Import this module from routes/server components,
// never from a client component. No credentials are returned by the status API.
import { portfolio } from "../data/portfolio.ts";
import { formatBrief, isEmailAddress, type ContactDetails } from "./contact-validation.ts";

type WebhookConfig = { provider: "webhook"; url: string; token?: string };
type EmailConfig = { provider: "resend"; apiKey: string; from: string; to: string };
export type ContactDeliveryConfig = WebhookConfig | EmailConfig;

export function getContactWebhookConfig(env: NodeJS.ProcessEnv = process.env): WebhookConfig | null {
  if (!env.CONTACT_WEBHOOK_URL?.trim()) return null;
  try {
    const url = new URL(env.CONTACT_WEBHOOK_URL.trim());
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return { provider: "webhook", url: url.href, token: env.CONTACT_WEBHOOK_TOKEN?.trim() || undefined };
  } catch {
    return null;
  }
}

export function getContactDeliveryConfig(env: NodeJS.ProcessEnv = process.env): ContactDeliveryConfig | null {
  const apiKey = env.RESEND_API_KEY?.trim() || "";
  const from = env.CONTACT_FROM_EMAIL?.trim() || "";
  if (apiKey || from) {
    const to = env.CONTACT_TO_EMAIL?.trim() || portfolio.email;
    // Partial email setup fails closed, never silently falling back to a
    // different service. The visitor cannot choose the recipient or sender.
    if (!apiKey || /\s/.test(apiKey) || !isEmailAddress(from) || !isEmailAddress(to)) return null;
    return { provider: "resend", apiKey, from, to };
  }
  return getContactWebhookConfig(env);
}

export function getContactDeliveryStatus(config = getContactDeliveryConfig()) {
  return { deliveryEnabled: config !== null, deliveryProvider: config?.provider ?? null };
}

function escapeHtml(value: string): string {
  const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return value.replace(/[&<>"']/g, character => entities[character]);
}

export function createEnquiryEmail(data: ContactDetails, enquiryId: string) {
  const text = `${formatBrief(data)}\nEnquiry reference: ${enquiryId}\nSent from the portfolio contact form.\n`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>New automation enquiry</title></head><body style="margin:0;padding:24px;background:#0c0e12;color:#f5f5f7;font-family:Arial,sans-serif"><main style="max-width:600px;margin:auto;padding:28px;background:#181a1f;border-top:3px solid #ff9b6a"><p style="color:#ff9b6a;font-size:12px;letter-spacing:1px">PORTFOLIO ENQUIRY</p><h1 style="font-size:24px">A new workflow to map.</h1><p>Reply to this email to contact the person below.</p><pre style="white-space:pre-wrap;overflow-wrap:anywhere;font-family:Arial,sans-serif;font-size:15px;line-height:1.7">${escapeHtml(text)}</pre></main></body></html>`;
  return { subject: `New automation enquiry: ${data.service}`, text, html };
}

export async function deliverContact(
  config: ContactDeliveryConfig,
  data: ContactDetails,
  enquiryId: string,
  submittedAt: string,
  fetcher: typeof fetch = fetch,
): Promise<boolean> {
  const email = config.provider === "resend";
  const response = await fetcher(email ? "https://api.resend.com/emails" : config.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(email
        ? { Authorization: `Bearer ${config.apiKey}`, "Idempotency-Key": `portfolio-enquiry/${enquiryId}` }
        : config.token ? { Authorization: `Bearer ${config.token}` } : {}),
    },
    // The email payload deliberately excludes changing timestamps so a retry
    // with the same ID has exactly the same payload for Resend's deduplication.
    body: JSON.stringify(email
      ? { from: `${portfolio.name} <${config.from}>`, to: [config.to], reply_to: data.email, ...createEnquiryEmail(data, enquiryId) }
      : { ...data, enquiryId, source: "portfolio", submittedAt }),
    signal: AbortSignal.timeout(8000),
    redirect: "error",
    cache: "no-store",
  });
  if (!response.ok || !email) {
    await response.body?.cancel();
    return response.ok;
  }
  // Success means provider acceptance, not guaranteed inbox delivery. Never
  // expose provider responses or account details to the visitor.
  const receipt: unknown = await response.json();
  return !!receipt && typeof receipt === "object" && "id" in receipt && typeof receipt.id === "string" && receipt.id.trim().length > 0 && !("error" in receipt);
}
