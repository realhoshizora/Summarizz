---
name: Chia tiền · Hội nghị bàn tròn
description: Splitting the bill as a round-table meeting chaired by a lucky cat, seen from above.
colors:
  aluminium-ground: "#EEF0F3"
  panel-white: "#FFFFFF"
  ink: "#15171B"
  ink-muted: "#4C535D"
  hairline: "#D3D8DE"
  ink-faint: "#6B727C"
  control-track: "#DDE2E7"
  control-hover: "#E2E6EA"
  chip-fill: "#E9ECEF"
  lacquer-crimson: "#A8162B"
  rim-gold: "#D9A928"
  settled-green: "#0E6E3F"
  owed-red: "#B4232F"
  cat-porcelain: "#FFFDF7"
  cat-outline: "#2B1D16"
  coin-gold: "#F5C518"
  coin-shade: "#9A6B00"
  seat-blue: "#1F5FD6"
  seat-yellow: "#F5B700"
  seat-green: "#13773C"
  seat-raspberry: "#D6336C"
  seat-orange: "#C8470A"
  seat-violet: "#7048E8"
  seat-teal: "#0B7285"
  seat-lime: "#82C91E"
  seat-brown: "#8D5524"
  seat-sky: "#4DABF7"
  seat-charcoal: "#343A40"
  seat-pink: "#F783AC"
typography:
  display:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "clamp(34px, 10.5vw, 46px)"
    fontWeight: 900
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 900
    letterSpacing: "-0.02em"
  amount:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 800
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  title:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 800
  body:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.45
  label:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 800
    letterSpacing: "0.06em"
rounded:
  check: "7px"
  inner: "10px"
  field: "12px"
  card: "14px"
  sheet: "22px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  gutter: "20px"
  section: "28px"
  column-gap: "56px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.panel-white}"
    rounded: "{rounded.card}"
    padding: "0 18px"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.panel-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "0 18px"
    height: "48px"
  button-danger:
    backgroundColor: "{colors.panel-white}"
    textColor: "{colors.owed-red}"
    rounded: "{rounded.card}"
    padding: "0 18px"
    height: "48px"
  button-mini:
    backgroundColor: "{colors.aluminium-ground}"
    textColor: "{colors.ink}"
    rounded: "{rounded.inner}"
    padding: "0 9px"
    height: "40px"
  transfer-ticket:
    backgroundColor: "{colors.panel-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "14px 16px 12px"
  seat-chip:
    backgroundColor: "{colors.panel-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 14px 0 10px"
    height: "42px"
  tab-track:
    backgroundColor: "{colors.control-track}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.card}"
    padding: "4px"
  tab-selected:
    backgroundColor: "{colors.panel-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.inner}"
    height: "40px"
  input-field:
    backgroundColor: "{colors.panel-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "0 14px"
    height: "50px"
  sheet:
    backgroundColor: "{colors.panel-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sheet}"
    padding: "22px 20px 18px"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.panel-white}"
    rounded: "{rounded.field}"
    padding: "12px 18px"
---

# Design System: Chia tiền · Hội nghị bàn tròn

## Overview

**Creative North Star: "The Round-Table Meeting"**

Settling the bill is a meeting at a round table, seen from directly above and chaired by a white-and-gold mèo thần tài. The table is the hero of the screen: a crimson lacquer disc with a gold rim, members sitting around it as saturated plastic stools, and white threads running from whoever pays to whoever receives, each carrying its amount. Everything else (the transfer tickets, the per-person table, the item list) is the minutes of that meeting, set quietly on cool aluminium.

The world is loud in exactly three places, the cat's one-line verdict at poster scale, the lacquer table, and the stool colours, and plain everywhere else. Surfaces are white cards on a pale grey ground, type is one family in heavy weights, and controls are large and thumb-sized because the screen is used one-handed at a restaurant table. Money is always set in tabular figures so columns line up and nobody argues about a đồng.

**Key Characteristics:**
- One face (Be Vietnam Pro) from 500 to 900; black weight for the cat's line, heavy 800 for money.
- A cool aluminium ground with white panels; crimson and gold live only on the table and the cat.
- Each member owns one stool colour for the whole session, used on their seat, avatar, chip, dot and thread label.
- Light only (`color-scheme: light`); no dark theme exists.
- Motion is small and functional: a waving paw, a rising sheet, numbers that glide to their new value.

## Colors

A neutral aluminium room, one ceremonial crimson-and-gold object in the middle, and twelve plastic-stool colours that identify people.

### Primary
- **Lacquer Crimson** (lacquer-crimson): the round tabletop and the favicon disc. Also the text caret. Never a button, never a background for text blocks.
- **Rim Gold** (rim-gold): the 6px rim around the tabletop. Brighter **Coin Gold** (coin-gold) with **Coin Shade** (coin-shade) is reserved for the cat's coin, bell and "Chủ toạ" plaque, and for text selection at 40% alpha.

### Secondary
- **Seat palette** (seat-blue through seat-pink): twelve saturated stool colours, each paired with a fixed on-colour (white, or a near-black of the same hue for the light ones: yellow, lime, sky, pink). A member gets a fixed index into this palette when added, and keeps it when others are removed.

### Tertiary
- **Settled Green** (settled-green): positive net balances and the checked state of a "done" transfer.
- **Owed Red** (owed-red): negative net balances, danger buttons, invalid fields and error text.

### Neutral
- **Aluminium Ground** (aluminium-ground): page, top bar and bottom bar background; also the fill of mini buttons and the perforation notches cut into tickets.
- **Panel White** (panel-white): tickets, sheets, inputs, secondary buttons, the selected tab.
- **Ink** (ink): all primary text, the primary button fill, the toast, focus rings.
- **Ink Muted** (ink-muted): meta text, section labels, unselected tabs, arrows and chevrons.
- **Ink Faint** (ink-faint): input placeholders and the struck-through amount on a settled ticket (4.8:1 on white).
- **Hairline** (hairline): row dividers, input borders, the dashed ticket perforation, the bottom bar edge.
- **Control Track / Control Hover / Chip Fill** (control-track, control-hover, chip-fill): the tab track, hover fills on grey controls, and quiet pill buttons.
- **Cat Porcelain / Cat Outline** (cat-porcelain, cat-outline): the lucky cat's body and its 2.5px brown-black line.

### Named Rules
**The One Stool Rule.** A member's seat colour is their identity. Wherever that person appears (seat, avatar chip, colour dot, selected seat chip, thread label outline) it is the same colour, and no other element may borrow a seat colour for decoration.

**The Lacquer Is Furniture Rule.** Crimson and gold belong to the table and the cat. Interface chrome stays ink, white and aluminium; the primary action is black, not red.

## Typography

**Display Font:** Be Vietnam Pro (with system-ui, sans-serif)
**Body Font:** Be Vietnam Pro
**Label/Mono Font:** none; tabular figures (`font-variant-numeric: tabular-nums`) stand in for mono on every amount.

**Character:** A single Vietnamese-native sans used at heavy weights. The cat speaks in a black, tightly tracked poster line; everything else is calm 500 to 800.

### Hierarchy
- **Display** (900, clamp 34 to 46px, line-height 1.02, -0.03em, balanced wrap): the cat's single sentence above the table. One per screen.
- **Headline** (900, 24px, -0.02em): sheet titles.
- **Amount** (800, 24px, -0.02em, tabular): the transfer amount on each ticket; the items total uses 800 at 22px.
- **Title** (800, 17px): session name in the top bar; item names use 700 at 17px.
- **Body** (500, 16px, 1.45): base text; field labels and notes at 14px, meta at 13 to 13.5px.
- **Label** (800, 13px, 0.06em, uppercase, muted): section headings such as "Chuyển khoản" and "Từng người", and the people-table header (700, 12px, 0.04em).

### Named Rules
**The Tabular Money Rule.** Every amount (tickets, thread labels, table cells, totals, previews, counts) is set with tabular figures. No proportional digits next to money.

**The Cat Speaks Once Rule.** Weight 900 at display size is the cat's voice only. It is one sentence, it lives above the table, and nothing else on the screen competes with it.

## Layout

Phone first: a single column, max 560px, with a 20px side gutter. A sticky top bar holds the session name; a fixed bottom bar holds the Bàn / Món tab switch and the black "Thêm món" action, each up to 260px wide, with the body padded 92px plus the safe-area inset so content never hides under it.

The table SVG (380 by 380 viewBox) bleeds 8px past the gutter on each side. Seats sit on a 160-unit ring around a 132-unit tabletop; seat radius shrinks with the head count (max 23). Threads are quadratic curves that bend outward when they would cross the centre, so they never run through the cat, and each label sits at 30% along the curve on the payer's side.

Vertical rhythm: 28px above each section label, 12px between tickets, 16px before row actions. At 640px and up, sheets centre as dialogs instead of rising from the bottom. At 1024px and up, the container widens to 1080px and the table view becomes two equal columns with a 56px gap: the cat's line and the table on the left (the table sticky at 70px from the top), the transfers and per-person table on the right. The item view caps at 640px and centres.

## Elevation & Depth

Mostly flat, with soft ambient shadows only where a piece of paper sits on the ground. Tickets float slightly, the selected tab lifts out of its track, and sheets cast a strong upward shadow over a dimmed ink backdrop (50%). The only "real" depth is inside the illustration: the cat's soft ground shadow on the tabletop.

### Shadow Vocabulary
- **Ticket rest** (`box-shadow: 0 1px 2px #0000000f, 0 4px 14px #0000000a`): transfer tickets.
- **Tab lift** (`box-shadow: 0 1px 3px #0000001f`): the selected tab in the bottom bar.
- **Sheet** (`box-shadow: 0 -8px 40px #0000002e`): bottom sheets and dialogs, over `#15171B80` backdrop.
- **Field focus** (`box-shadow: 0 0 0 3px #15171B26`): input focus halo alongside an ink border.

### Named Rules
**The Paper On Metal Rule.** Only white panels cast shadows, and only soft ambient ones. Grey controls on the aluminium ground stay flat and change fill on hover instead.

## Shapes

Round is the world's geometry: a round table, round seats, round avatars, round colour dots, pill chips. Rectangles are softened: 14px on cards, buttons and the tab track; 10px on inner controls (tabs, mini buttons, list rows, the done toggle); 12px on inputs and the toast; 22px on sheet tops; 7px on the checkbox. The transfer ticket carries a perforation: a 2px dashed hairline with two 16px semicircular notches cut in the ground colour at each end.

## Components

### Buttons
Tactile, heavy-labelled, and always at least 48px tall.
- **Shape:** gently rounded (14px) with a 1.5px ink outline.
- **Primary:** ink fill, white 700 label; hover deepens to #2A2E35. Used for "Thêm món", "Lưu", "Xong" and the empty-table invite.
- **Secondary:** white fill, ink outline; hover #F6F7F9.
- **Danger:** white fill, owed-red outline and label, for deletes.
- **Press:** scales to 0.98 over 0.1s; fills transition over 0.15s ease-out.
- **Mini:** borderless 40px aluminium pill-rectangle (10px) with a 16px stroke icon, used for per-ticket copy actions; presses to 0.97.

### Chips
- **Seat chip:** a 42px pill with a 2px hairline border and a 14px dot in the member's colour. Checked, the whole chip fills with the member's colour and its on-colour text. Used for payer and sharer pickers.
- **Member chip:** a filled pill in the member's colour with a 40px round remove button.
- **Quiet pill:** chip-fill background, 700 14px label, for "Cả bàn" and "Bỏ chọn hết".

### Cards / Containers
- **Corner Style:** 14px.
- **Background:** panel white on the aluminium ground.
- **Shadow Strategy:** ticket rest (see Elevation).
- **Internal Padding:** 14px 16px 12px on the ticket top, 6px 8px 8px on its stub.

### Inputs / Fields
- **Style:** 50px tall, white, 1.5px hairline border, 12px radius, 600 17px text, muted 500 placeholder (#6B727C).
- **Focus:** border turns ink with a 3px ink halo at 15%.
- **Error:** border turns owed-red; error text 700 14px owed-red below.

### Navigation
- **Top bar:** sticky on the ground; the session name (800 17px, ellipsised) over a muted meta line, with a chevron, all one button that opens the session sheet.
- **Bottom bar:** fixed; a segmented tab switch (control-track, 4px inset, selected segment white with tab lift) beside the primary "Thêm món" button.

### Round Table (signature)
The full-width SVG table: lacquer disc with gold rim and a faint white inlay ring, seats as stool-colour circles with a 4px ground-colour ring and an 800 short name, and white 3.5px threads with arrowheads. Each thread carries a white pill label (22px tall, 11px radius) outlined 2.5px in the payer's colour, with the amount in 800 13px tabular ink. A done transfer drops to 45% opacity with a dotted thread.

### Lucky Cat (signature)
A white-and-gold maneki-neko at the table's centre, drawn in porcelain with a 2.5px brown-black line, a gold ₫ coin, a red collar with a gold bell, and a gold "Chủ toạ" plaque. Its raised paw waves every 2.6s (cubic-bezier(.45,0,.2,1)); the wave stops under reduced motion. The favicon is the cat's head on a crimson disc.

### Transfer Ticket (signature)
A payment ticket per transfer: payer avatar and name, a muted arrow, receiver avatar and name, and the amount right-aligned at Amount scale. Below a perforated stub sits a 44px "done" toggle (22px ink-outlined checkbox that fills settled-green when checked) and mini copy buttons. A done ticket drops to 62% opacity with the amount struck through.

### Number Glide
Every on-screen amount glides from its previous value to the new one over 450ms with an exponential ease-out, after each change. Under reduced motion values jump.

## Do's and Don'ts

### Do:
- **Do** give every member one seat colour from the twelve-colour palette and use it in every place that person appears (The One Stool Rule).
- **Do** set every amount in tabular figures at 800 weight.
- **Do** keep the primary action ink black (#15171B fill, white label) and at least 48px tall.
- **Do** keep crimson (#A8162B) and gold (#D9A928) on the table, the cat and the favicon only.
- **Do** let only white panels cast the soft ticket shadow; grey controls change fill on hover.
- **Do** stop the paw, the sheet rise and the number glide under `prefers-reduced-motion`.

### Don't:
- **Don't** turn the table view into a list of cards or a ledger; the table seen from above stays the hero of the first viewport.
- **Don't** use a seat colour for decoration, status, or any element not tied to that member.
- **Don't** set anything but the cat's one sentence at 900 display size.
- **Don't** add a second typeface; Be Vietnam Pro carries every role.
- **Don't** make the primary button crimson or gold.
