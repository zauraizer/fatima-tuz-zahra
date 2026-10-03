import { useRef } from "react";
import { site } from "../content";
import { Lanterns } from "../components/Effects";
import { Icon } from "../components/Icon";
import { scrollToTarget, useLenis } from "../components/SmoothScroll";
import { gsap, prefersReducedMotion, useGSAP } from "../lib/gsap";
import { finishIntro } from "../lib/intro";

/*
  The opening screen — the first full screen of the site, not a timed overlay.
  The emblem draws itself and the name rises, then it simply waits: it stays
  until you scroll out of it. As you scroll, the name drifts up and fades, the
  bottom edge curves into an arch, and the hero animates in beneath it.
*/
export function Splash() {
  const root = useRef<HTMLElement>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      if (prefersReducedMotion()) {
        finishIntro();
        return;
      }

      // Entrance (plays on every load)
      gsap
        .timeline({ delay: 0.15 })
        .fromTo(q(".splash-stroke"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut", stagger: 0.08 })
        .to(q(".splash-fill"), { opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.35")
        .to(q(".splash-spin"), { rotate: 45, duration: 1.3, ease: "expo.inOut" }, "<")
        .from(q(".splash-word"), { yPercent: 120, duration: 1, stagger: 0.06 }, 0.3)
        .from(q(".splash-ar"), { autoAlpha: 0, y: 14, filter: "blur(6px)", duration: 0.9 }, 0.6)
        .from(q(".splash-tag"), { autoAlpha: 0, y: 12, duration: 0.8 }, 0.9)
        .from(q(".splash-cue"), { autoAlpha: 0, y: 18, duration: 0.9 }, 1.3);

      // Scrolling out. The hero starts animating once the splash is ~40% gone.
      const curve = { r: 0 };
      const applyCurve = () => {
        root.current!.style.borderRadius = `0 0 ${curve.r * 50}% ${curve.r * 50}% / 0 0 ${curve.r * 16}vh ${curve.r * 16}vh`;
      };
      const reveal = (p: number) => p > 0.4 && finishIntro();

      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
            onUpdate: (self) => reveal(self.progress),
            onRefresh: (self) => reveal(self.progress),
          },
        })
        .to(q(".splash-inner"), { yPercent: 45, scale: 0.86, opacity: 0 }, 0)
        .to(q(".splash-cue-wrap"), { opacity: 0, y: -30, duration: 0.3 }, 0)
        .to(q(".splash-pattern"), { yPercent: 25 }, 0)
        .to(curve, { r: 1, onUpdate: applyCurve }, 0);

      return () => {
        root.current?.style.removeProperty("border-radius");
      };
    },
    { scope: root },
  );

  const words = site.name.split(" ");
  return (
    <section ref={root} id="splash" aria-label={`${site.name} ${site.kind}`} className="relative isolate h-svh overflow-hidden bg-forest-deep text-cream">
      <div className="splash-pattern bg-stars-light absolute -inset-y-[15%] inset-x-0 opacity-[0.07]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 aspect-square w-[90vmax] -translate-1/2 bg-[radial-gradient(closest-side,rgb(232_176_74/0.16),transparent_70%)]" />
      <Lanterns className="absolute inset-0 size-full opacity-70" count={30} />

      <div className="splash-inner absolute inset-0 grid place-items-center px-5">
        <div className="flex flex-col items-center text-center">
          <svg viewBox="0 0 120 120" className="splash-spin size-28 md:size-36" aria-hidden="true">
            <g fill="none" stroke="var(--color-gold)" strokeWidth="2">
              <rect className="splash-stroke" pathLength={1} strokeDasharray="1" x="27" y="27" width="66" height="66" rx="8" />
              <rect className="splash-stroke" pathLength={1} strokeDasharray="1" x="27" y="27" width="66" height="66" rx="8" transform="rotate(45 60 60)" />
              <circle className="splash-stroke" pathLength={1} strokeDasharray="1" cx="60" cy="60" r="22" />
            </g>
            <circle className="splash-fill" cx="60" cy="60" r="10" fill="var(--color-gold)" opacity="0" />
          </svg>
          <p className="mt-8 flex flex-wrap justify-center gap-x-[0.3em] overflow-hidden font-display text-[clamp(2.6rem,6vw+1rem,5.5rem)] leading-[1.1] font-semibold">
            {words.map((w) => (
              <span key={w} className="splash-word inline-block">
                {w}
              </span>
            ))}
          </p>
          <p className="splash-ar mt-3 text-[clamp(1.9rem,3vw+1rem,3rem)] text-gold-soft" lang="ar" dir="rtl">
            {site.nameArabic}
          </p>
          <p className="splash-tag mt-6 max-w-sm text-[0.95rem] text-cream/70">{site.tagline}</p>
        </div>
      </div>

      <div className="splash-cue-wrap absolute inset-x-0 bottom-[6%] flex justify-center">
        <button
          type="button"
          onClick={() => scrollToTarget(lenis, root.current!.offsetHeight)}
          className="splash-cue flex flex-col items-center gap-2.5 text-[0.72rem] font-bold tracking-[0.22em] text-cream/75 uppercase transition-colors hover:text-gold-soft"
          data-pop="1.08"
        >
          <span className="relative flex h-10 w-6 justify-center rounded-full border-[1.5px] border-current pt-2">
            <span className="block size-1.5 animate-scroll-dot rounded-full bg-gold-bright" />
          </span>
          Scroll to enter
          <Icon name="chevronDown" className="size-4 animate-bounce" strokeWidth={2.2} />
        </button>
      </div>
    </section>
  );
}
