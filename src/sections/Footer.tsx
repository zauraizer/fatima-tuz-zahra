import { useRef, useState, type FormEvent } from "react";
import { contact, footer, forms, isTaxExempt, links, nav, site, taxExempt } from "../content";
import { Emblem } from "../components/Brand";
import { Icon } from "../components/Icon";
import { useScrollTo } from "../components/SmoothScroll";
import { useToast } from "../components/Toast";
import { isDraft, T, textOf } from "../lib/draft";
import { gsap, prefersReducedMotion, ScrollTrigger, SplitText, useGSAP } from "../lib/gsap";
import { onEnterOnce } from "../lib/reveal";

export function Footer({ openPrivacy }: { openPrivacy: () => void }) {
  const root = useRef<HTMLElement>(null);
  const mark = useRef<HTMLParagraphElement>(null);

  // The giant wordmark rises letter by letter.
  useGSAP(
    (_ctx, contextSafe) => {
      if (prefersReducedMotion()) return;
      gsap.set(mark.current, { autoAlpha: 0 });
      const play = contextSafe!(() =>
        document.fonts.ready.then(() => {
          const split = SplitText.create(mark.current, { type: "chars", mask: "chars" });
          gsap.set(mark.current, { autoAlpha: 1 });
          gsap.from(split.chars, { yPercent: 105, duration: 1.4, stagger: 0.035, ease: "expo.out" });
        }),
      );
      return onEnterOnce(mark.current!, play, "0px 0px -5% 0px");
    },
    { scope: root },
  );

  return (
    <footer ref={root} id="site-footer" className="relative overflow-hidden bg-forest-night text-cream/75">
      <div className="bg-stars-light pointer-events-none absolute inset-0 opacity-[0.035]" />
      <div className="relative mx-auto max-w-[1240px] px-5 pt-24">
        <Newsletter />

        <div className="mt-20 grid gap-12 border-t border-cream/10 pt-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <a href="#top" className="inline-flex items-center gap-3 text-cream">
              <Emblem light className="size-11" />
              <span className="font-display text-xl font-semibold">{site.name}</span>
            </a>
            <p className="mt-5 max-w-xs leading-relaxed">{site.tagline}</p>
            {isTaxExempt && <p className="mt-4 text-sm text-cream/55">501(c)(3) nonprofit, EIN {taxExempt.ein}</p>}
          </div>

          <nav aria-label="Footer">
            <FooterCol title="Explore">
              {nav.map((n) => (
                <li key={n.id}>
                  <a href={`#${n.id}`} data-pop="1.06" data-pop-lift="0" className="inline-block transition-colors hover:text-gold-soft">
                    {n.label}
                  </a>
                </li>
              ))}
            </FooterCol>
          </nav>

          <FooterCol title="Contact">
            <li><T v={contact.email} /></li>
            <li><T v={contact.phone} /></li>
            <li><T v={contact.address} /></li>
          </FooterCol>

          <div>
            <h3 className="font-sans text-[0.75rem] font-bold tracking-[0.16em] text-gold uppercase">Protecting our children</h3>
            <p className="mt-4 text-sm leading-relaxed">{footer.privacy}</p>
            <div className="mt-6 flex gap-2">
              {/* Unset profiles are hidden on the live site (shown highlighted in draft mode). */}
              {(["instagram", "facebook", "youtube"] as const).filter((s) => site.draftMode || !isDraft(links[s])).map((s) => (
                <a
                  key={s}
                  href={textOf(links[s])}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${s} (opens in a new tab)`}
                  data-todo={site.draftMode && isDraft(links[s]) ? "" : undefined}
                  data-pop="1.15"
                  className="grid size-11 place-items-center rounded-full border border-cream/15 transition-colors duration-300 hover:border-gold-bright hover:bg-gold-bright hover:text-forest-deep"
                >
                  <Icon name={s} className="size-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p
        ref={mark}
        aria-hidden="true"
        className="pointer-events-none relative mt-16 text-center font-display text-[12.6vw] leading-[0.82] font-semibold tracking-[-0.04em] whitespace-nowrap text-cream/[0.07] select-none"
      >
        {site.name}
      </p>

      <div className="relative border-t border-cream/10">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-3 px-5 py-6 text-sm text-cream/55">
          <p>
            © {new Date().getFullYear()} {site.name} {site.kind}. All rights reserved.
            <button type="button" onClick={openPrivacy} className="ml-4 underline-offset-4 transition-colors hover:text-gold-soft hover:underline">
              Privacy
            </button>
          </p>
          <a href="#top" className="inline-flex items-center gap-1.5 transition-colors hover:text-gold-soft">
            Back to top <Icon name="arrowUp" className="size-4" strokeWidth={2} />
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-sans text-[0.75rem] font-bold tracking-[0.16em] text-gold uppercase">{title}</h3>
      <ul className="mt-4 space-y-2.5">{children}</ul>
    </div>
  );
}

function Newsletter() {
  const toast = useToast();
  const [done, setDone] = useState(false);
  if (!forms.newsletterEndpoint && !site.draftMode) return null;

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email")?.toString().trim();
    if (!email) return toast("Add your email first");
    if (!forms.newsletterEndpoint) return toast("Newsletter not connected yet. Add forms.newsletterEndpoint in src/content.ts");
    try {
      const res = await fetch(forms.newsletterEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setDone(true);
    } catch {
      toast("Couldn't subscribe right now. Please try again later");
    }
  };

  return (
    <div className="grid items-end gap-8 lg:grid-cols-2">
      <div>
        <p className="eyebrow eyebrow-dark">Stay close</p>
        <h2 className="mt-4 text-[clamp(2rem,2.4vw+1rem,3.2rem)] text-cream">News from the home, a few times a year.</h2>
      </div>
      {done ? (
        <p className="flex items-center gap-3 text-lg text-cream">
          <Icon name="check" className="size-6 text-gold" strokeWidth={2.4} /> You're on the list. Thank you!
        </p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-3 rounded-full sm:flex-row sm:border sm:border-cream/15 sm:bg-cream/5 sm:p-1.5">
          <label htmlFor="nl-email" className="sr-only">
            Email address
          </label>
          <input
            id="nl-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="min-h-13 flex-1 rounded-full border border-cream/15 bg-cream/5 px-6 text-cream outline-none placeholder:text-cream/40 focus:border-gold sm:border-0 sm:bg-transparent"
          />
          <button type="submit" className="btn btn-gold min-h-13">
            Subscribe
          </button>
        </form>
      )}
    </div>
  );
}

/** Floating back-to-top button whose ring fills with scroll progress. */
export function BackToTop() {
  const btn = useRef<HTMLButtonElement>(null);
  const ring = useRef<SVGCircleElement>(null);
  const scrollTo = useScrollTo();

  useGSAP(() => {
    gsap.set(btn.current, { autoAlpha: 0, scale: 0.6 });
    let shown = false;
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        ring.current!.style.strokeDashoffset = String(1 - self.progress);
        const show = self.scroll() > window.innerHeight * 1.2;
        if (show !== shown) {
          shown = show;
          gsap.to(btn.current, { autoAlpha: show ? 1 : 0, scale: show ? 1 : 0.6, duration: 0.5, ease: show ? "back.out(2)" : "power2.in" });
        }
      },
    });
  });

  return (
    <button
      ref={btn}
      type="button"
      onClick={() => scrollTo("top")}
      aria-label="Back to top"
      data-pop="1.1"
      className="fixed right-4 bottom-4 z-[80] grid size-14 place-items-center rounded-full bg-cream text-forest-deep shadow-lift transition-colors hover:bg-white"
    >
      <svg viewBox="0 0 56 56" className="absolute inset-0 size-full -rotate-90" aria-hidden="true">
        <circle cx="28" cy="28" r="26" fill="none" stroke="var(--color-line)" strokeWidth="2" />
        <circle ref={ring} cx="28" cy="28" r="26" fill="none" stroke="var(--color-gold)" strokeWidth="2.5" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
      </svg>
      <Icon name="arrowUp" className="relative size-5" strokeWidth={2.2} />
    </button>
  );
}
