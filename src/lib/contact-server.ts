import { validateContact } from "./contact-validation.ts";
import { getSiteConfiguration } from "./site.ts";
import { deliverContact, getContactDeliveryConfig, type ContactDeliveryConfig } from "./contact-delivery.ts";

const maxBodyBytes = 16_384;
const windowMs = 60_000;
const maxRequests = 5;

function json(body: object, status: number, headers: Record<string, string> = {}) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

async function readBody(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new SyntaxError("Missing body");
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBodyBytes) {
        await reader.cancel();
        throw new RangeError("Request too large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = new Uint8Array(bytes);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  return JSON.parse(new TextDecoder().decode(body));
}

/** No enquiry data is stored here. Rate limiting is per running server instance. */
export function createContactHandler({
  fetcher = fetch,
  now = Date.now,
  getConfig = getContactDeliveryConfig,
  getSiteOrigin = () => getSiteConfiguration().url?.origin,
}: {
  fetcher?: typeof fetch;
  now?: () => number;
  getConfig?: () => ContactDeliveryConfig | null;
  getSiteOrigin?: () => string | undefined;
} = {}) {
  const attempts = new Map<string, { count: number; expires: number }>();
  return async function handleContact(request: Request): Promise<Response> {
    const origin = request.headers.get("origin");
    const requestUrl = new URL(request.url);
    let hostOrigin: string | undefined;
    const host = request.headers.get("host");
    if (host) {
      try {
        const address = new URL(`${requestUrl.protocol}//${host}`);
        if (!address.username && !address.password && address.pathname === "/" && !address.search && !address.hash) hostOrigin = address.origin;
      } catch { /* Invalid Host headers never create an allowed origin. */ }
    }
    if (!origin || ![requestUrl.origin, hostOrigin, getSiteOrigin()].includes(origin)) {
      return json({ message: "Please send your enquiry from this website." }, 403);
    }
    if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
      return json({ message: "Send the enquiry as JSON." }, 415);
    }

    const time = now();
    for (const [key, value] of attempts) if (value.expires <= time) attempts.delete(key);
    const key = (request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "anonymous").slice(0, 128);
    const previous = attempts.get(key);
    if (previous && previous.count >= maxRequests) {
      return json({ message: "Too many attempts. Please wait a minute and try again." }, 429, { "Retry-After": String(Math.max(1, Math.ceil((previous.expires - time) / 1000))) });
    }
    if (!previous && attempts.size >= 4096) return json({ message: "Please wait a moment and try again." }, 429, { "Retry-After": "60" });
    attempts.set(key, { count: (previous?.count ?? 0) + 1, expires: previous?.expires ?? time + windowMs });

    let input: unknown;
    try { input = await readBody(request); }
    catch (error) {
      return json({ message: error instanceof RangeError ? "The enquiry is too large." : "The enquiry could not be read. Please try again." }, error instanceof RangeError ? 413 : 400);
    }
    if (input && typeof input === "object" && "website" in input && input.website) {
      return json({ message: "The enquiry could not be submitted." }, 400);
    }
    const enquiryId = input && typeof input === "object" && "enquiryId" in input ? input.enquiryId : undefined;
    if (enquiryId !== undefined && (typeof enquiryId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(enquiryId))) {
      return json({ message: "Please refresh the page and try again." }, 400);
    }
    const result = validateContact(input);
    if (!result.success) return json({ message: "Please check the highlighted fields.", errors: result.errors }, 400);
    const config = getConfig();
    if (!config) return json({ message: "Online enquiries are not available yet. You can still save your project brief." }, 503);

    try {
      const accepted = await deliverContact(config, result.data, enquiryId ?? crypto.randomUUID(), new Date(time).toISOString(), fetcher);
      if (!accepted) return json({ message: "Your enquiry could not be sent. Please try again, or save your brief below." }, 502);
      return json({ message: config.provider === "resend" ? "Your enquiry has been accepted for email delivery. Thank you for getting in touch." : "Your enquiry has been received. Thank you for getting in touch." }, 200);
    } catch {
      return json({ message: "The connection could not be confirmed. Please try again later, or save your brief below." }, 502);
    }
  };
}
