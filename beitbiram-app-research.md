# Research report: "המערכת שלי" (beitbiram.adidi.shop)

## What it is

"המערכת שלי" ("My Schedule"/"My System") is a free, ad-free, installable web app (PWA — "add to home screen," no app store) built and run by students as an independent side project for **בית בירם (Beit Biram / HaReali)**, a specific high school in Haifa. It is explicitly **not** the school's official system — it's a volunteer-run layer on top of the school's public schedule site.

The core idea: the school publishes schedule changes (cancellations, room swaps, substitute teachers) for the *entire grade* as one big table. Reading your own 1–2 relevant rows out of dozens every day is tedious and easy to miss. This app polls the school's site every few minutes, filters it down to **only the lessons that apply to you**, and pushes a phone notification the moment something changes.

Reported traction on the landing page: 900+ registered students, 59 classes, 20,900+ notifications sent.

## Core features

1. **Personal schedule view** — day/week timetable showing only the student's own class, electives ("מגמות"), and streaming/ability groups ("קבוצות הקבצה"), pulled from the school's master schedule.
2. **Real-time change detection + push notifications** — cancellations, room changes, substitute-teacher assignments ("מילוי מקום"), auto-refreshed from the school site every few minutes. Notifications only for lessons relevant to the logged-in student; optional "starts in N minutes" reminder.
3. **Exams & calendar** — class-level exam list plus a grade-wide calendar (sourced from a public Google Sheet), plus a "days until vacation" countdown widget.
4. **Free-room finder** — shows which rooms are empty right now/in a given time window, by building.
5. **Campus map** — shows which building/floor your next lesson is in (uses Esri satellite tiles, pure client-side, no location sent to server — it only reads device GPS locally to draw a dot).
6. **Teacher & room search** — look up where a given teacher is currently teaching, or what's scheduled in a given room.
7. **Homework/notes** — attach a free-text note/task to a specific lesson; it resurfaces on the day it's due.
8. **Social layer** — add friends from your class/grade, view their schedules (subject to a visibility setting: friends-only or public), block users, report abuse.
9. **Separate teacher accounts** — teachers see their own cross-class schedule and get notified when they're assigned as a substitute or when one of their own lessons moves. Teacher accounts are manually approved by the site's student-run staff, have no social features, and are not searchable by students.
10. **Account & settings** — profile photo/bio/color (optional), visibility control, notification toggles, one name change per 30 days, self-serve account deletion, in-app "support" chat to the student staff.

## Business/trust model worth noting

- **Free, no ads, no subscription** — funded/run purely by volunteer students.
- **Transparent "who we are" page** — lists the founders/developers, a lead advisor, a site admin, and a maintenance person by name and role, which builds trust for something handling real names/emails of minors.
- **Explicit non-affiliation disclaimer** in the FAQ, privacy policy, and terms: not the school's official system, not its responsibility; school's own site is the source of truth if there's a discrepancy.
- **Minors-aware privacy policy**: only stores what's functionally necessary (name, email hash/scrypt password, class/group selection, optional profile fields, friends/blocks, push subscription + device type, support chat log, last-seen timestamp, abuse reports/restrictions). Explicitly does **not** store location, IP, or tracking/ad cookies, and does not read contacts/photos beyond an uploaded avatar.
- **Tiered moderation**: content removal → "restricted until fixed" (soft lock tied to a specific required fix) → account lock → account deletion, all logged to an internal action log.
- **Security practices stated plainly**: scrypt-hashed passwords, HttpOnly session cookie, rate limiting on login/register/password-reset, HTTPS, permission checks per action.
- **Honest limitations**: "best effort" notifications (don't rely on them exclusively), "as-is" availability, no uptime SLA, data accuracy tied to the school's own site.

## Technical shape (inferred from the outside)

- Single-page app (hash-based routing, `/app#/...`), installable as a PWA with Web Push (works via "Add to Home Screen" on iOS Safari; works directly from Chrome on Android — this asymmetry is called out explicitly in their own FAQ/onboarding).
- A backend scraper/sync job polls the school's existing (separate, official) schedule system on an interval and diffs it to detect cancellations/room-changes/substitutions, then fans out push notifications only to affected students.
- Calendar data sourced from a public Google Sheet rather than a custom CMS — a pragmatic shortcut.
- Map uses Esri tile imagery loaded client-side; no server-side location storage.
- Registration is two-step: create account (name + email + password) → then pick class/electives/groups, which is what actually personalizes the filtered schedule and notifications.

## Implications if you build something similar

If your goal is a **personal-schedule-notifier app** (for a school, university, or any institution that already publishes a master timetable/changes somewhere), the reusable pattern is:

1. **Ingestion**: a scheduled job that reads the source-of-truth schedule (scrape, API, or shared spreadsheet) and diffs it against the last known state.
2. **Personalization**: let each user pick the subset of streams/groups/sections that are theirs, once, editable later — this is what turns "everyone's changes" into "my changes."
3. **Notification**: push only the diffs relevant to each user's selection, fast (minutes-level latency, not real-time websockets necessarily — polling was enough here).
4. **Trust/privacy posture**: for anything involving minors or an institution you're not officially affiliated with, a clear non-affiliation disclaimer and a minimal-data privacy policy go a long way, and cost little to build.
5. **Nice-to-have layers** (add after the core notifier works): exam/calendar view, room/teacher lookup, free-room finder, campus map, homework notes, lightweight social (friends + shared view of schedules).
6. **PWA over native app**: avoids app-store friction entirely; the main cost is educating iOS users to "Add to Home Screen" since iOS Safari only supports Web Push for installed PWAs.

## Open questions for you

- Do you have a specific school/institution in mind, or is this meant to be generic/multi-tenant?
- Is the source schedule something you can scrape, or does it expose an API/export you could use instead (more reliable than scraping)?
- Do you want the social/friends layer, or just the core notifier + exams/calendar/room-finder utility features?
