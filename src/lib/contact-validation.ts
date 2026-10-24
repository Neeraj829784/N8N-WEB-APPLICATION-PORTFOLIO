export const contactServices = ["Lead operations", "Data sync", "Onboarding", "Reporting", "Something else"] as const;
export type ContactField = "service" | "description" | "tools" | "name" | "email";
export type ContactErrors = Partial<Record<ContactField, string>>;
export type ContactDetails = {
  service: string;
  description: string;
  tools: string;
  name: string;
  email: string;
};

/** One bare email address, never a recipient list or an injected mail header. */
export function isEmailAddress(value: string): boolean {
  return value.length <= 254
    && /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(value)
    && Array.from(value).every(character => character.charCodeAt(0) > 31 && character.charCodeAt(0) !== 127);
}

export function validateContact(input: unknown, requireReplyDetails = true):
  | { success: true; data: ContactDetails }
  | { success: false; errors: ContactErrors } {
  const record = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const text = (key: string) => typeof record[key] === "string" ? record[key].trim() : "";
  const data = { service: text("service"), description: text("description"), tools: text("tools"), name: text("name"), email: text("email") };
  const errors: ContactErrors = {};
  if (!contactServices.some(service => service === data.service)) errors.service = "Choose an automation service.";
  if (data.description.length < 15 || data.description.length > 2000) errors.description = "Describe your process in 15–2,000 characters, excluding surrounding spaces.";
  if (data.tools.length > 300) errors.tools = "Keep the tools list within 300 characters.";
  if (requireReplyDetails) {
    if (data.name.length < 2 || data.name.length > 100) errors.name = "Enter your name using 2–100 characters.";
    if (!isEmailAddress(data.email)) errors.email = "Enter a valid email address so I can reply.";
  }
  return Object.keys(errors).length ? { success: false, errors } : { success: true, data };
}

export function formatBrief(data: ContactDetails): string {
  const reply = data.name || data.email ? `\nFrom: ${data.name}\nReply to: ${data.email}\n` : "";
  return `Automation project: ${data.service}\n${reply}\nCurrent process:\n${data.description}\n\nTools involved:\n${data.tools || "To discuss"}\n`;
}
