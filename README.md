# Fatima tuz Zahra Orphanage — website

Vite + React 19 + TypeScript + **Tailwind CSS v4**, with **GSAP** (ScrollTrigger,
SplitText) and **Lenis** smooth scrolling. Fonts are self-hosted (Lora, Plus
Jakarta Sans, Amiri), so no visitor data goes to Google Fonts.

## Running it

Node lives in `../.tooling/node` (this Mac has no system Node), so use the script:

```sh
./dev.sh          # dev server → http://localhost:5190
./dev.sh build    # production build → dist/
./dev.sh preview  # serve the built dist/ locally
```

`dist/` is a plain static site: drag it into Netlify, or deploy it to
Cloudflare Pages, Vercel or GitHub Pages. It includes `404.html`, the page these
hosts show for any address that doesn't exist (preview it at `/404.html`).

## Editing the content

**All copy, numbers, links and settings live in [`src/content.ts`](src/content.ts).**
You don't need to touch any component to change what the site says.

- `draft("…")` marks a placeholder. Replace `draft("[year]")` with `"2011"`.
- Numbers use `{ value: 40, draft: true }`. Delete `draft: true` once the number is real.
- While `site.draftMode` is `true`, placeholders are highlighted and a badge
  (bottom left) counts them. **Next** jumps to each one, opening collapsed
  panels when needed, and **Preview** hides the highlights.
- Before launch: fill every draft, then set `draftMode: false`.

### Photos

1. Drop the original pictures into the `photos/` folder (any JPG, PNG, WebP or HEIC).
   Give each a short name, like `computer-room.jpg`.
2. Run `./dev.sh photos`. It makes two web-sized copies of each one in
   `src/assets/photos/`, strips all hidden data (camera, date, GPS location),
   trims black bars off video stills, and adds a blurred preview for loading.
3. Use the name (without `.jpg`) in `src/content.ts`: `gallery.photos` for the
   gallery, `story.photo` for the About section. Give each an `alt` description.

The originals in `photos/` are never committed; only the cleaned copies are.

### Things to connect

| Setting | What it's for |
| --- | --- |
| `links.donate` | Your online donation page (Givebutter, Donorbox, Zeffy…). The big **Give** button opens it. |
| `links.amazonWishlist`, `links.fundraiser` | Wish list and peer-to-peer fundraiser pages. |
| `forms.contactEndpoint` | A Formspree/Basin URL. If it's empty, the form opens the visitor's email app. |
| `forms.newsletterEndpoint` | Mailchimp/Buttondown etc. If it's empty, the newsletter form is hidden once draft mode is off. |
| `contact.mapEmbed` | Google Maps → Share → Embed → copy just the `src` URL. |
| `give.impact` | What each donation amount provides. Replace with your real costs. |
| `taxExempt.ein` | **Leave empty until registration is complete.** Once it's filled in, the EIN and the tax-deductible wording appear in the donate panel, footer and FAQ. |
| `privacy` | The plain-language privacy notice (footer → Privacy). Have it reviewed. |

## Layout

```
src/
  content.ts        every word on the site
  App.tsx           page order + providers
  index.css         Tailwind theme tokens (colours, fonts, keyframes)
  lib/              gsap setup, reveal system, donation state, draft helpers
  components/       header, smooth scroll, cursor, marquee, lanterns…
  sections/         Splash, Hero, Stats, Story, WindowReveal, Care, DayCycle, Verse, Give, Involved, Faq, Contact, Footer
```

## The motion, briefly

- **Opening splash**: the first full screen of the site. The emblem draws
  itself and the name rises, then it waits until you scroll out of it. As you
  scroll, the name drifts up and fades, the green panel curves into an arch,
  and the hero animates in. The header stays hidden until you're past it, and
  "Back to top" returns to the hero rather than the splash.
- **Hero**: the headline rises out of a blur; the arch wipes open with gold
  lanterns drifting up inside it (canvas). Layers parallax with the pointer and
  on scroll.
- **Reveals**: add `data-reveal` (or `="lines"`, `"words"`, `"clip"`, `"scale"`,
  `"fade"`) to any element. They use IntersectionObserver, so anchor jumps
  can't leave anything stuck invisible.
- **Values marquee**: two rows that speed up with scroll velocity and reverse
  when you scroll back up.
- **Statement**: words light up as you scroll through it.
- **A day at Fatima tuz Zahra**: a pinned, scroll-scrubbed scene. The sun
  crosses the sky, dawn turns to night, the windows light up, and stars and the
  crescent come out.
- **Giving**: the sponsorship line draws on scroll, and the sponsor button
  pre-fills the donate form and flies you to it.
- **Hover pop** (`src/lib/pop.ts`): every button, and anything with `data-pop`,
  springs up slightly under the mouse and squashes when pressed. Icons marked
  `data-pop-icon` wiggle. Use `data-pop="1.08"` for a custom scale, or
  `data-pop-lift="0"` for no lift.
- **Window reveal**: a small arched window grows to fill the screen as you
  scroll, then the promise lights up word by word.
- **Gallery**: the "What we provide" cards glide past on their own in an
  endless loop. They ease to a stop while hovered or focused, there's a
  Pause/Play button, they speed up slightly with page scroll, and they can
  still be dragged or swiped.
- Aurora colour fields behind the hero, shimmering gradient text, film grain,
  cursor-following spotlight cards with 3D tilt, magnetic buttons, a scroll
  progress bar, a hide-on-scroll header with a sliding active-section pill, and
  a full-screen mobile menu that grows out of the menu button.

All motion is skipped when the visitor has **reduced motion** turned on (the day
scene becomes a plain list). To preview that version, add `?reduced-motion` to
the URL. The custom cursor and hover pop only appear with a mouse.

Pinned sections are each wrapped in a plain `<div>`. GSAP moves a pinned
element into a "pin-spacer", so the wrapper keeps React from touching a node
GSAP has moved. Keep that pattern for any new pinned section.

See [AUDIT.md](AUDIT.md) for the latest review and what's still outstanding.

## Before going live

- **Children's photos:** use photos where children can't be identified, or
  only with a guardian's consent.
- Check that the program, sponsorship and safeguarding wording matches what
  the home actually does.
