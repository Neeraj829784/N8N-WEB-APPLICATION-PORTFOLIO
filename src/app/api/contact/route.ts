import { createContactHandler } from "@/lib/contact-server";
import { getContactDeliveryStatus } from "@/lib/contact-delivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export function GET() {
  return Response.json(getContactDeliveryStatus(), { headers: { "Cache-Control": "no-store" } });
}
export const POST = createContactHandler();
