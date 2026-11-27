# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static site, no server: plain HTML/CSS/JS, no build step, deployed as a Render Static Site. User chose "no server" over Node+Postgres and Node+SQLite+Disk after being told Render Free wipes files on restart and paid disks cost money. Framework choice delegated: vanilla JS, because the app is one screen of state and a framework adds a build step for nothing.

## Users

A group of friends (often ~6) right after an outing or a meal in Vietnam. One person holds the phone and enters what was bought while everyone sits together; then the result goes into the group chat (Zalo, Messenger, Discord). Most people see it on a phone.

## Product Purpose

Split a group bill where different people paid for different items up front and each item may be shared by only some of the group. Output: per person paid / owed / net, and the fewest transfers that settle everyone. Success: the table agrees on who sends whom how much without arguing, and the summary is pasted into chat in one tap.

## Positioning

Each item carries its own payer and its own subset of sharers, and the settlement is reduced to the minimum number of transfers, with rounding shown openly so nobody disputes a few đồng.

## Operating Context

- Entered live at the table, quickly, often one-handed on a phone.
- Data lives in the browser (localStorage) and inside the share link itself; whoever edits re-shares the link. No accounts, no realtime co-editing.
- Currency is VNĐ only. Amounts are typed as `120000` or `120.000`.

## Capabilities and Constraints

- Sessions (outings): name, date, members; add/remove members quickly.
- Expenses: name (required), amount, payer (one member), sharers (subset, select all / none), optional note; edit and delete with instant recalculation.
- Summary: paid | owed | net per person; minimum transfer list `A → B : amount`; copy a transfer, mark transfers done; copy a plain-text summary for group chat.
- Rounding (confirmed): shares computed exactly to the đồng so totals always match; transfer amounts rounded to 1.000đ, with the rounding difference stated explicitly.
- Interface language: Vietnamese.

## Evidence on Hand

None. No logo, brand, users or testimonials exist; do not invent any.

## Product Principles

1. Fast at the table beats feature-rich: fewest taps from "we bought X" to the answer.
2. The math must be checkable: every number on screen traces to items anyone can read.
3. Never hide a đồng: rounding is shown, not swallowed.
4. Phone first; the copied text must read cleanly in a chat app.

## Accessibility & Inclusion

No product-specific requirement established beyond WCAG AA basics; outdoor/restaurant lighting on phones makes contrast matter.
