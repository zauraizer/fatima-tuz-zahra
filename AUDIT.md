# Website audit — Fatima tuz Zahra Orphanage

## Second pass: leaks, security and errors (2 October 2026)

**Scope:** everything ever committed, the built site visitors download, the GitHub repo, and the running site (desktop, tablet, phone, reduced motion, keyboard only). Two independent code reviews (memory and lifecycle; bugs, accessibility and security), with every finding re-checked before fixing.

### Leak checks: all clean

| Check | Result |
| --- | --- |
| API keys, tokens, passwords, private keys (17 key formats plus random-looking strings) in every version of every committed file, all commit messages, the current files and the built site | **None found.** The scanner was tested on fake keys first. |
| Personal info in commits | Commits use the private GitHub noreply address. No local paths or emails in the site. |
| GitHub repo | Private, one collaborator, no forks, deploy keys, webhooks, Actions secrets or extra branches. |
| Image metadata | Only pixel dimensions (no GPS, device or author). |
| Built site | No source maps, no cookies or browser storage, no requests to any other website (fonts are self-hosted). |
| Dependencies | `npm audit`: 0 vulnerabilities. |

### Fixed in this pass

| # | Severity | Finding | What changed |
| --- | --- | --- | --- |
| 1 | High | Content that fades in on scroll was hidden from keyboard and screen-reader users until scrolled to (48 controls and 7 of 8 section headings at page load). | Hidden with opacity only, so it stays reachable and readable. Tabbing into a section reveals it at once. |
| 2 | High | Opening the phone menu and then widening the window (e.g. rotating a tablet) locked the whole page. | The menu closes itself at desktop width. The page lock is always undone. |
| 3 | High | The header could take keyboard focus while off screen. | It slides into view while it has focus. |
| 4 | Medium | "Other" amount accepted junk: "Give $∞", huge numbers, "1.2.3" and comma decimals read wrongly. | Accepts $1 to $100,000 with up to two decimals, reads "25,50" as $25.50, and explains any problem. |
| 5 | Medium | Contact form: any text passed as an email; with no form service set, it showed "Thank you" and threw the message away even if no email app opened. | Emails are checked and the fields are marked for screen readers. The message stays on screen with the address to email if nothing opened. |
| 6 | Medium | Hero "Give once" opened the donate box on Monthly. | It switches to One time. |
| 7 | Medium | The values ticker moved forever with no way to stop it (WCAG 2.2.2). | Pause button, and it stops under the mouse. |
| 8 | Medium | Gallery cards were one big button, so screen readers heard only "Open A safe home" and the six headings were missing. | Each card has a real "Read more about…" button and its heading and text are read normally. Focus returns to the right card after closing. |
| 9 | Medium | "Double your gift" (employer matching) implies registered charity status. Matching programs only accept 501(c)(3) organisations. | Hidden until the EIN is set, like the other tax wording. The grid adjusts so it stays even. |
| 10 | Medium | Photo placeholder instructions ("Add a photo of the home…") would show to real visitors. | Shown only in draft mode. |
| 11 | Medium | Three controls had no visible focus outline. Success messages weren't announced and lost keyboard focus. | Focus outlines added. Focus moves to the thank-you messages. |
| 12 | Medium | Background animations kept running after a visitor switched on Reduce Motion, and the hero's drifting colours ran even off screen. | All motion follows the setting live. The hero pauses off screen. Lanterns run at the same speed on 120 Hz screens. |
| 13 | Low | Several animations weren't cleaned up when they re-ran, so they piled up in memory over a long visit. | Cleaned up on every change. Verified: the page's element count stays flat over repeated scrolls and pop-ups. |
| 14 | Low | Small things: "Link copied" shown even when copying failed; Back to top didn't move focus; invalid HTML in the nav and bank details; an empty link would open the page itself in a new tab; two small footer tap targets on phones. | All fixed. |
| 15 | Low | Leftovers from removed features: the "Donate supplies" contact topic, "supplies" in Get involved, three unused icons. | Removed. |

### New safeguards

- **Launch guard:** with `draftMode: false`, the build refuses to finish while any placeholder is left, so unfinished text can't reach visitors. A draft build tells search engines not to index it.
- **Content Security Policy** on the built site: only the site's own scripts can run.
- **`.gitignore`** blocks `.env` and key files. A note in `src/content.ts` says never to put API keys or passwords there (everything in it is public).
- **Donation link hook** (`donateUrl` in `src/content.ts`): the place to pass the donor's amount, frequency and designation to your donation platform once it's chosen.

### Needs you (added in this pass)

| Priority | Item | Why |
| --- | --- | --- |
| **High** | **Make Zakat reach a separate fund.** The donate box lets people choose Zakat, but the choice isn't passed to a platform yet. When you connect one, fill in `donateUrl` or use a separate campaign link per designation. | The site promises "Zakat directed to eligible children". |
| **High** | **Think twice before publishing bank account and routing numbers.** Many charities say "email us for wire details" instead, or use a deposit-only account with an ACH debit block. | Published numbers can be used for check fraud and unauthorized debits. |
| Medium | **The "100% goes to the children" FAQ.** Card processors take a fee from each gift. Pick a platform that lets donors cover fees, or say "100% of what we receive". | Keeps the promise exactly true. |
| Medium | **Host security headers** when you deploy: `frame-ancestors 'none'` (or `X-Frame-Options: DENY`), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`. | These can only be set by the host, not the page. |
| Medium | **Don't deploy a draft build publicly.** It shows the draft badge and setup messages, though search engines are told to skip it. | |
| Low | **If you add a Google map**, it sets Google cookies. Update the privacy notice, or use a click-to-load map. For a children's home, also consider whether to show the exact location at all. | Privacy and safeguarding. |

---

## First pass (1 October 2026)

**Date:** 1 October 2026 **Scope:** the whole one-page site (desktop 1280×800, phone 375×812, reduced motion)
**Method:** contrast measured against WCAG 2.2 AA; Core Web Vitals measured in the browser on the production build; DOM checks for headings, landmarks, labels and links; hands-on testing of every interactive part.

## Measurements

| Check | Before | After |
| --- | --- | --- |
| Largest Contentful Paint (first visit, with intro) | 5.9 s (poor) | **1.5 s** (good)¹ |
| Largest Contentful Paint (repeat visit) | 2.8 s | **0.16 s** |
| Cumulative Layout Shift | 0.075 | **0** |
| Long tasks during load | 0 | 0 |
| Small gold text contrast | 2.6 : 1 (fail) | **5.5 : 1** |
| Gold button text contrast | 2.7 : 1 (fail) | **6.2 : 1** |
| Horizontal overflow on phones | none | none |
| JavaScript / CSS (gzipped) | 153 KB / 16 KB | 156 KB / 18 KB |

Timings were measured on localhost, so a real connection adds network time. The improvements carry over.

¹ Measured with the earlier timed intro. The opening screen is now a full-screen splash that waits for the visitor to scroll, and its own name text paints within the first second.

---

## Fixed in this pass

| # | Severity | Finding | What changed |
| --- | --- | --- | --- |
| 1 | High · legal | EIN and "tax-deductible" wording shown before registration is complete. | Removed everywhere. They return automatically once `taxExempt.ein` is filled in. The FAQ answer is now a placeholder to confirm. |
| 2 | High · accessibility | Small gold labels (2.6:1) and white text on gold buttons (2.7:1) fail WCAG AA (needs 4.5:1). The form error colour was 3.5:1. | New label gold `#7a5414`; gold buttons now use dark green text; error colour `#a8432c`. Every new colour pair was checked. |
| 3 | High · performance | The headline appeared at 5.9 s on a first visit. The intro ran about 2.6 s, then the text-splitting animation repainted the headline at the end. | Intro shortened. The headline animates as one element, so it starts painting on the first frame. |
| 4 | Medium · performance | Layout shift of 0.075 when the intro unlocked scrolling, because the scrollbar reappeared. | `scrollbar-gutter: stable` reserves its space. |
| 5 | Medium · accessibility | No skip-to-content link. | Added; tested with a real Tab press. |
| 6 | Medium · accessibility | With the mobile menu open, the page behind it was still reachable by keyboard. | The page is made `inert` while the menu is open. |
| 7 | Medium · accessibility | The Monthly/One-time switch used radio roles without arrow-key support. | Now toggle buttons with `aria-pressed`. |
| 8 | Medium · trust | Social icons linked to the facebook.com / instagram.com home pages. | Hidden on the live site until real profile links are set. |
| 9 | Medium · sharing/SEO | No share image, home-screen icon or web manifest. | Added a 1200×630 share image, Apple touch icon, 192/512 icons, manifest and `robots.txt`. |
| 10 | Medium · privacy | The site collects names and emails but had no privacy notice. | Plain-language notice added (footer → Privacy), marked as a draft to review. |
| 11 | Low · spam | The contact form had no bot protection. | Added a hidden honeypot field. |
| 12 | Low · accessibility | The footer links had no landmark. | Wrapped in a labelled `<nav>`. |
| 13 | Low · stability | React threw an error during hot reload when re-rendering next to a GSAP-pinned section. | Pinned sections now sit in stable wrapper elements (GSAP's recommended pattern). |
| 14 | Low · QA | The reduced-motion version couldn't be previewed. | Add `?reduced-motion` to the URL. Verified: no pinning, no hidden content, and the day scene becomes a list. |

---

## Needs you (can't be solved in code)

| # | Priority | Item | Why it matters |
| --- | --- | --- | --- |
| A | **Critical** | **Say where the home is.** The site never names the city or country the children live in. | US donors will look for this first. If the home is abroad, it also affects how funds can be sent (international transfers, sanctions screening). |
| B | **Critical** | **Registration and solicitation rules.** Until the IRS recognises the organisation, don't promise deductibility. Many US states also require charitable-solicitation registration before asking for donations online. | Legal exposure. Check with a nonprofit accountant or attorney. A **fiscal sponsor** can accept tax-deductible gifts for you in the meantime. |
| C | **High** | **Connect a donation platform** (`links.donate`). The main Give button currently goes nowhere. | Some platforms require 501(c)(3) status; check before signing up (see B). |
| D | **High** | **Real photographs.** This is the biggest remaining reason the site can feel less alive. | Use consented, non-identifying shots: hands, backs, the building, meals, classrooms, the playground. |
| E | **High** | **Replace the example figures:** the four stats, the $250 sponsorship amount, and the "what $X provides" lines. | They're highlighted placeholders today. Unverified numbers on a charity site damage trust. |
| F | **High** | **Contact form service** (`forms.contactEndpoint`, e.g. Formspree). | The email-app fallback fails silently for many visitors. |
| G | Medium | **Financial transparency:** how money is split between care and running costs, plus an annual report. | Donors and charity evaluators look for it. |
| H | Medium | **Written safeguarding policy.** The site promises background checks and photo consent. | Have the policy to back those promises; link it when ready. |
| I | Medium | **Have the privacy notice reviewed**, along with the sponsorship, Zakat-handling and "Zakat eligible" wording. | These are commitments made to donors. |
| J | Medium | **Once the domain is live:** canonical URL, absolute share-image URLs, a sitemap, and Google Search Console. | Placeholders are noted in `index.html`. |
| K | Low | **Privacy-friendly analytics** (e.g. Plausible). | No tracking exists today, which is good for privacy, but you can't see what's working. |
| L | Low | **Pre-rendering.** The page is built by JavaScript. Google handles that, but some link-preview bots and older crawlers don't. | Worth doing once the content settles. |

---

## Placeholder count

The draft badge (bottom left of the site) currently counts **36** items to fill in. Click **Next** to step through them.
