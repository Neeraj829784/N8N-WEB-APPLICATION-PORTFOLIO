# Discovery call booking

The portfolio links directly to **Automation Discovery Call** at
https://cal.com/neeraj-vasupalli/30min. The public booking configuration is in
`src/data/portfolio.ts`; the hero and contact section use that same URL.

- Duration: 30 minutes, using Cal Video.
- Availability: Monday–Saturday, 9 AM–6 PM India Standard Time
  (`Asia/Kolkata`). Sunday is unavailable. The final start time is 5:30 PM.
- Cal.com account and booking notifications: `neerajautomations@zohomail.in`.
- Plan verified in the account: Individual / Free.
- No external calendar is connected, as requested by the owner. Manage
  bookings in Cal.com and use availability date overrides for holidays,
  time off, and commitments made outside Cal.com. Those outside commitments
  do not automatically block booking times.
- Zoho Bookings remains unused and its inactive event is not linked here.

## Verification — 25 October 2026

Saved and reloaded the availability and event title in Cal.com. Verified the
public page shows the new title, 30-minute duration, Cal Video, Saturday
availability through 5:30 PM, and disabled Sundays.

Created one owner-only test appointment for 31 October, 5:30–6 PM IST.
The confirmation and calendar invitation arrived in the owner's Zoho inbox
with the correct date, duration, participants, and Cal Video link. Both host
and attendee used the same owner-controlled Zoho address. No other calendar
was connected. The test appointment was cancelled and its slot became
available again. A live video call was not joined.

The website opens Cal.com in a new tab without an embedded widget or new
runtime dependency. Its project enquiry form continues to use Resend and
the same Zoho recipient; booking notifications are sent by Cal.com.

To change the schedule later, update the default Working hours schedule in
Cal.com and the displayed availability in `src/data/portfolio.ts` together,
then verify the public booking page before publishing the website change.
