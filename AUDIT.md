# Website audit — Fatima tuz Zahra Orphanage

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

The draft badge (bottom left of the site) currently counts **38** items to fill in. Click **Next** to step through them.
