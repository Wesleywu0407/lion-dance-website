# Design Overhaul Plan (2026-11-08)

Status: **IN PROGRESS.**

## Progress log

**2026-11-08: decisions received.**
- Main action colour: red.
- Text changes: allowed.
- Start with: landing pages.
- SEO must be protected.

**Done in this round:**
1. **Main action is cinnabar red site-wide.** `button-line`, the header LINE button, the menu LINE button, the contact-page LINE button and the phone bottom bar now use `--cta`.
   - On the bottom bar, only the LINE button is red; 撥打電話 and 預約演出 are dark with hairline dividers.
   - Home process CTA: phone is now secondary, so one red button per group.
   - Green remains only for "sent successfully" status messages.
2. **New shared landing template** (`src/_includes/landing-body.njk` + `css/pages/landing.css`) for all 6 landing pages. The old about-page `.ctb-phrase` headline borrowing is gone. Order, as a buyer decides:
   - **Hero:** breadcrumb, H1, intro, red LINE button + form button, phone and LINE ID, 3 facts already stated on the home page, and a photo (the LCP image, loaded eagerly). The red button is on the first screen at 360 / 390 / 820 / 1440px.
   - **Questions:** ruled list of the CMS `blocks` (H2s).
   - **Photos:** "實況" band with 2 large photos and captions underneath, plus case and price-guide links as plain text links.
   - **Quote prep:** "詢價前準備這 6 項資料" on every page. It reduces back-and-forth on LINE.
   - **Price FAQ:** price guide only. Visible text still matches the FAQ structured data.
   - **Closing band:** dark band with one red LINE button, the form and the phone number.
3. **SEO copy:** the vague block titles (相關案例 / 常見問題 / 建議流程…) were rewritten as the questions buyers search for, e.g. 「哪些開幕活動適合舞獅？」「場地太小也能安排開幕舞獅嗎？」. Each title answers the paragraph already under it; no new claims. CTA titles were made page-specific.
4. **SEO unchanged and still protected:** title, meta description, canonical, URLs, JSON-LD and H1 text. Internal links to `/gallery/*` and the price guide are kept. Ad-source tracking (`?source=landing-…`) is kept on every form link. Added a visible breadcrumb that matches `BreadcrumbList`. `check-seo-content.mjs` now looks for `.landing-point-title`.

**Verified:**
- `npm test` all green.
- No horizontal overflow at 4 widths.
- One H1 per page.
- Tap targets 40px or more.
- Contrast: white on red 6.7:1, smallest text 4.56:1.
- Menu and Esc still work; no JS errors.

**2026-11-08 (round 2): home page rebuilt.**
- **Hero:** kept. The red LINE button gets a paper-white ring so it reads on red lions. Phone gutter is 20px (was 12px). The separate 4-up trust strip is replaced by one quiet line under the buttons (2012 年創立・全台皆可出團・LINE 快速回覆).
- **Scenarios:** ruled rows with arrows (no table grid, no 01–06). The sticky heading sits on the left. 廟會／祝壽 now goes to `/pages/temple-festival-planning` (a real sales page) instead of the gallery.
- **Shows:** 3×2 photo grid (2 columns on phone) with names under the photos; the gradient veils are gone. Both SEO paragraphs are kept.
- **About:** moved after the shows as a full-bleed dark photo band (尾牙 8 獅跳樁). Phone shows the photo on top and text below. Added a new internal link, 「認識南仙 →」 to `/pages/about`.
- **Cases:** one large + two small, captions under the photos. The relative `gallery/` link is fixed to `/gallery/`.
- **Process:** CTA sits beside the numbered steps (LINE red, form secondary with `?source=home-process`, phone as a text link). The numbers are now red, because gold text failed contrast.
- **Removed:** every eyebrow label except one (關於臺灣南仙 on the dark band), including the phone-only English ones (ABOUT / SERVICES / PROCESS).
- **Footer:** home now uses `footer.njk` (no more duplicate); its gallery link is now root-absolute.
- **CSS:** dead home-only rules pruned. `sections/home.css` went from 1270 to 343 lines, and 7 rules were removed from `responsive.css`. New page-scoped file: `css/pages/home.css`.
- **SEO:** same H1, same 5 H2 texts, same JSON-LD and meta. Anchors `#about` / `#process` kept.
- **Verified:**
  - `npm test` green.
  - No overflow at 360 / 390 / 820 / 1440.
  - No hidden `.reveal` with reduced motion.
  - No small tap targets.
  - No JS errors.
  - Services / about / contact visually unchanged.

**Next:**
- Phase 1 token cleanup. This includes removing the now-unused `.quote-prep`, `.landing-photo-grid` and `.cta-band` landing rules in `components.css` / `responsive.css`.
- Then home → services → gallery.

How this audit was done:
- Built the site (`npx @11ty/eleventy`) and served `_site/`.
- Captured 10 key pages at 1440px desktop and 390px phone, scrolling one screen at a time (full-page captures hide lazy images and `content-visibility` sections, so they are not reliable here).
- Measured the CSS (colours, font sizes, shadows, radii, `!important`).
- Ran WCAG contrast maths on the design tokens.
- Clicked through the interactive parts on a phone viewport: menu, Esc to close, FAQ, empty form submit, lightbox, bottom bar, tap targets.
- Evidence screenshots: `docs/design-audit-2026-11/`.
- Caveat: Google Fonts is blocked in the audit sandbox, so headings rendered in a fallback font. Proportions and layout are accurate; the exact Noto Serif TC look is not.

---

## 1. The honest verdict

The site is **not broken**. It has no JS errors, the menu, FAQ, lightbox and form validation all work, there is no horizontal scroll, and the photos are strong. It feels "AI-made" for one reason: **every section is built from the same template block, decorated the same way, at the same rhythm.** Your eye learns the pattern by section 2 and stops reading.

The newest page, `廟會策劃活動` (`/pages/temple-festival-planning`), is already the best page on the site: it uses hairlines instead of boxes, captions under photos, and varied layouts. It is the reference for everything else (`05-temple-page-reference.jpg`).

### The 7 "AI tells" found

| # | Tell | Where | Why it reads as generated |
|---|---|---|---|
| 1 | **Same section opener everywhere**: tiny red eyebrow with a gold left bar, then a serif H2, then a grey paragraph pushed to the right | Home ×5 in a row, about, services, landing, temple | Same shape repeated identically; no section feels written for its content |
| 2 | **Numbering on everything** | Home scenarios 01–06, home process 01–04, services 01–07, services process 01–04, contact 壹–肆, temple 壹–陸 | Numbers only mean something when order matters; here they are decoration |
| 3 | **Dark gradient veil + white text over photos** | Home service tiles, gallery index | The most common template card on the web; it also hides the photos you paid to take |
| 4 | **Box-in-box** | Services: tinted card, shadow, corner bracket, framed photo with its own shadow. Services process: card with an inner border. Home scenarios: bordered table grid. CTA panel: red left rule plus pill chips | Three or four frames around one idea (your own brief already calls this out) |
| 5 | **Three colours of button side by side** | Home process CTA (green / red / outline), phone bottom bar (black / green / red) | No single "main action", so nothing feels important |
| 6 | **English eyebrows on phone only** ("ABOUT ·", "SERVICES ·", "PROCESS ·") | Home on phone | Inconsistent with desktop; reads as template filler |
| 7 | **Identical 4-up trust strip** (2012 年創立 / 一站式演出規劃 / 全台皆可出團 / LINE 快速回覆) | Home and about | Repeated stat blocks are a landing-page cliché |

### System sprawl (root cause of the inconsistency)

| Measure | Now | Target |
|---|---|---|
| Distinct colour values in CSS | **276** | ~12 tokens |
| `font-size` declarations (distinct) | **117** | 7-step scale |
| Distinct `box-shadow`s | **38** | 1 (or 0) |
| Border-radius values | **15** (0, 1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 24, 999px, 50%…) | 3 (0 / 4px / pill) |
| `!important` | **132** | <20 |
| Mobile breakpoints | 760 **and** 768 (plus 480, 1100) | 1 phone + 1 tablet |

---

## 2. Bugs and P0 problems (fix first, regardless of the redesign)

| P | Problem | Evidence | Fix |
|---|---|---|---|
| **P0** | **All 6 landing pages use the about page's `.ctb-phrase` "cinematic headline" component.** Each small info card gets an ~80px title, bigger than the page H1, which wraps to 2 lines ("適合的活/動類型"). No photo or CTA appears until far down. These are the SEO entry pages. | `01-landing-giant-titles.jpg`; `src/landing/*.html` uses `.about-cinematic .ctb .ctb-phrase` from `css/sections/about.css:93` | Give the landing pages their own layout (see §4.3) and stop borrowing about-page CSS |
| **P0** | **Gold text fails contrast**: `--gold #b9925e` on `--bg #f5efe6` is **2.5:1** (needs 4.5:1). Used for "洽詢此項目 ›" on services, the 01–04 numerals on home, and 壹–肆 on contact. | Measured | Gold becomes decoration only (rules, marks); text uses `--accent` (6.5:1) or `--ink` |
| **P0** | **Gallery index is cramped**: on a 1440px screen the photos sit in a ~360px-wide two-column strip in the middle, in front of an odd vertical tinted band. Category labels are small white text on bright photos and hard to read. | `02-gallery-index.jpg` | Full-width editorial grid; captions under photos |
| **P1** | **Phone gutters are inconsistent**: hero text sits ~8–10px from the screen edge, while body content uses ~20px. On home, the H2 under "ABOUT · 關於臺灣南仙" is indented differently from its eyebrow. | `04-mobile-home.jpg` | One `--gutter` token used everywhere |
| **P1** | **Home page has its own copy of the footer** (`src/index.html` ~L690–710) instead of `_includes/footer.njk`. It has already drifted: the home footer has 隱私政策; other pages' footers don't. | Code | Home uses the include |
| **P1** | **舞龍舞獅介紹 hero**: the iframe uses a clean URL `/pages/ink-dragon-scroll?embedded=1`, which only works on Netlify. If it ever fails, visitors see two screens of blank space. | 404 in the local preview | Verify on production; add a static poster fallback |
| **P2** | Footer is very tall: three link columns with "演出方案" wrapping under, and lots of empty dark space. | All pages | Compact 4-column footer; 2 columns on phone |
| **P2** | Footer and menu links are 38px tall on phone (the comfortable minimum is 44px). | Tap-target scan | Increase row height |
| **P2** | Home scenario cards lead to three kinds of destination (landing / gallery / contact) without explanation. | Link scan | Decide one destination type (ask) |

**Verified working:** menu open and close (Esc works, body scroll locks), FAQ `<details>`, required-field validation on empty submit, gallery lightbox, `tel:` and LINE links, no console errors, no horizontal overflow on any audited page.

---

## 3. Creative direction: "廟埕戲單" (the temple-square programme)

One idea to hold everything together: **the site is a printed performance programme handed out in a temple square.** That means real paper, ink, one red seal, and photographs that are allowed to be big. It is not a SaaS landing page.

Six rules every page must pass:

1. **Photos do the talking.** Photos run large and edge-to-edge or at a strong crop. Captions go *under* photos in small ink text. No gradient veils.
2. **Ink, paper, one cinnabar.** Text is ink black, the ground is rice paper, and **one red is reserved for the booking action** (like a seal 印 on a document). Gold is used only for hairlines and small marks, never for text.
3. **Lines, not boxes.** Group content with whitespace and 1px hairlines. At most one frame per element, aiming for zero.
4. **Vary the rhythm.** No two neighbouring sections share a layout. Rotate between a full-bleed photo band, an asymmetric text/photo split, a ruled list, a quiet text-only section, and a dark ink band.
5. **Few, loud headings.** Use one serif display size for 1–2 moments per page; everything else is calm. Seven type steps in total.
6. **Numbers only when order is real.** Booking steps: yes. Service list: no.

**Signature element:** the red seal. The primary CTA everywhere ("預約演出" / "LINE 洽詢") becomes one consistent cinnabar button with a small square seal mark. It replaces the corner brackets and gold eyebrow bars that were removed or overused before. This is the one memorable brand detail; everything else stays quiet.

---

## 4. The plan in phases

Each phase is its own commit, previewed before moving on. Copy text is **not** changed unless you approve it (per `設計升級-prompt.md`).

### Phase 1: Foundation (tokens only; visual change is subtle)
- `css/base.css`: collapse colours to tokens (`--ink`, `--ink-soft`, `--paper`, `--paper-deep`, `--rule`, `--cinnabar`, `--cinnabar-deep`, `--gold-mark`, `--line-green`, and a dark-band set).
- Type scale of 7 steps: display / h1 / h2 / h3 / body / small / micro, using `clamp()` for fluid sizes.
- Spacing scale (`--space-1` … `--space-8`), with a large step reserved for gaps between sections and a small step for heading-to-text.
- Radii: 0 / 4px / pill. Shadow: 1 (or none).
- One phone breakpoint (760px) and one tablet breakpoint (1100px); remove the 768 duplicates in `css/responsive.css`.
- Done when the site looks the same or slightly cleaner, the colour count drops below about 40, and `npm test` passes.

### Phase 2: Components (shared building blocks)
- **Button**: primary (cinnabar seal), secondary (ink outline), text link. Remove the three-colour CTA rows: each CTA group gets one primary, one secondary and an optional link.
- **Phone bottom bar**: phone and booking in ink, with one cinnabar primary; the LINE logo keeps green only inside its icon.
- **Section header**: two variants instead of one. (a) Large serif headline on the left with no eyebrow; (b) a quiet inline label followed by text. Eyebrows used on at most 1 in 3 sections. Remove the English phone eyebrows.
- **Photo card**: image, then caption below. No veil, no shadow, 4px radius.
- **Ruled list**: replaces bordered grids (home scenarios, services process, CTA chips).
- **Footer**: rebuild once in `footer.njk`; home uses the include.

### Phase 3: Pages (in order of business impact)
1. **Landing template, used by all 6 pages** (SEO entry, highest impact). Hero has the H1, one line of text, a photo beside it (desktop) or below it (phone), and the primary CTA visible on the first screen. Then come facts as a calm two-column ruled list (normal h3 size), a photo strip, a price note or link, FAQ, related links, and a final CTA.
2. **Home**:
   - Hero stays.
   - The trust strip becomes one quiet line, or is removed (copy decision).
   - Scenarios become a ruled list with no table borders.
   - About becomes a full-bleed photo band with the statement on top of it.
   - Services become a 3×2 grid of photo cards with captions underneath.
   - Cases get one large photo plus two smaller ones (asymmetric layout).
   - Process keeps its numbers (order is real) and gets a single CTA group.
3. **Services**:
   - Remove the card tint, shadows and corner brackets.
   - Lay out each item as an alternating full-width photo and text row divided by hairlines; the photos grow about 30%.
   - The process 01–04 section becomes a ruled list.
   - The CTA panel becomes a dark ink band with one CTA.
4. **Gallery index and 9 albums**:
   - Index: full-width grid of categories, captions under photos, no vertical band.
   - Albums: the info box becomes a hairline-ruled intro and the photos grow.
5. **About**: already close. Remove the duplicate trust strip and vary the photo sizes so the page stops alternating between the same two half-width layouts.
6. **Contact**: already good. Gold numerals become accent, there is a single primary CTA, and the form gets light polish.
7. **舞龍舞獅介紹**: production check of the hero, a poster fallback, and a check of the right-aligned text block on desktop.
8. **Temple page**: reference page; only token alignment.

### Phase 4: QA (before reporting each phase done)
- Screenshot matrix at 390 / 768 / 1440 for every changed page, captured one screen at a time.
- Contrast: all body text 4.5:1 or better, large text 3:1 or better (automated script).
- Tap targets 44px or more on phone; keyboard focus visible; reduced-motion pass.
- `npm test` (unit, build, link check, backend contract, SEO check).
- Bump the shared `?v=` token in `css/style.css` and every `src/**/*.html` after CSS changes.
- A fresh-context reviewer looks at the screenshots before merging (per `CLAUDE.md`).

---

## 5. What will not change
- Brand name, logo, colours' identity (ink, paper, cinnabar, gold), Noto Serif TC / Noto Sans TC.
- Desktop hero of home and the ink-scroll experience on 舞龍舞獅介紹.
- Any Chinese copy, prices, contact details, or claims, unless approved in §6.
- URLs and SEO metadata.

---

## 6. Decisions (answered 2026-11-08: red · text changes yes · landing pages first)

1. **Main action colour.** Should the main button be cinnabar red ("預約演出" / "LINE 洽詢") with LINE green only on the LINE logo? *(Recommended.)* Or should LINE green stay the main button colour?
2. **Copy edits allowed?** Some fixes need small text changes:
   - removing 01–07 numbering on services;
   - removing the repeated trust strip;
   - adding a short line under photos on landing pages.

   Yes / no / show me each one first?
3. **Order.** Start with *Phase 1 + 2 + landing template* (biggest fix, SEO pages)? *(Recommended.)* Or start with the home page so you can see the new direction first?
4. **Photos.** Are there more or higher-resolution event photos (especially wide, horizontal ones) for the full-bleed bands? The redesign leans on photos; nothing will be invented or generated.
