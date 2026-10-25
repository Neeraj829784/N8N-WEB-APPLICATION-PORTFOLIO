# Enquiry webhook contract

The website can optionally post to a server-only HTTPS webhook. It can be connected to an n8n workflow later without changing the form UI. This is an alternative to [direct Resend email delivery](email-delivery.md), not a requirement. Setting a URL enables webhook submission only when `RESEND_API_KEY` and `CONTACT_FROM_EMAIL` are both blank. Partial email setup disables delivery instead of silently selecting the webhook. Without either mode configured, the brief builder remains local.

## Request

Method: `POST`. Content type: `application/json`.

If `CONTACT_WEBHOOK_TOKEN` is set, the server adds `Authorization: Bearer <configured token>`. The browser never receives this URL or token.

Example payload (fictional test data):

```json
{
  "enquiryId": "59db8379-a78b-49dd-8a77-4e116e9a8d9b",
  "name": "Test Visitor",
  "email": "visitor@example.org",
  "service": "Lead operations",
  "description": "We copy new enquiries into a spreadsheet every morning.",
  "tools": "Email, Google Sheets",
  "source": "portfolio",
  "submittedAt": "2026-10-24T10:00:00.000Z"
}
```

The application validates service selection, a trimmed 15–2,000 character description, name, reply email, and a tools list up to 300 characters. It rejects non-JSON, cross-origin, oversized, and honeypot submissions. The body limit is 16KB and the in-memory limit is five attempts per minute per client key, per server instance.

The existing Vercel project additionally has a [shared regional firewall rate limit](contact-rate-limiting.md) for contact POSTs. It runs before this route regardless of whether Resend or a webhook is configured; GET status checks are not counted.

## Receiver behavior

1. Authenticate the request if a token is configured.
2. Use `enquiryId` to recognise retries and avoid duplicate downstream actions.
3. Store or queue the enquiry, then notify the agreed owner/reply destination.
4. Return a 2xx response only when the enquiry has been accepted. Return a non-2xx response on failure.

The website waits up to eight seconds for the receiver. Failed or unconfirmed delivery does not show success, and the visitor can retain/download the brief. Retries of an unchanged form preserve the enquiry ID. Editing the form creates a new ID on its next submission.

No live webhook is configured yet. Unit tests substitute the receiver, and browser tests mock the API responses. A real end-to-end delivery test is still required when credentials and the reply destination arrive.
