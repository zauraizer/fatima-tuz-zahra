import { Fragment, useRef } from "react";
import { verse } from "../content";
import { StarGlyph } from "../components/Bits";
import { gsap, prefersReducedMotion, useGSAP } from "../lib/gsap";
import { onEnterOnce } from "../lib/reveal";

/*
  The Arabic is revealed word by word (never letter by letter — splitting
  Arabic into characters breaks the joined script), each word resolving
  out of a soft blur. The pattern behind drifts and parallaxes.
*/
export function Verse() {
  const root = useRef<HTMLElement>(null);
  const words = verse.arabic.split(" ");

  useGSAP(
    (_ctx, contextSafe) => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      gsap.set(q(".verse-word"), { autoAlpha: 0, y: 24, filter: "blur(10px)" });
      gsap.set(q(".verse-star"), { autoAlpha: 0, scale: 0.4, rotate: -90 });

      const play = contextSafe!(() => {
        gsap
          .timeline()
          .to(q(".verse-star"), { autoAlpha: 1, scale: 1, rotate: 0, duration: 1.4 })
          .to(q(".verse-word"), { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1.3, stagger: 0.14, ease: "power3.out" }, 0.2);
      });
      const stop = onEnterOnce(q(".verse-ar")[0], play, "0px 0px -15% 0px");

      gsap.fromTo(
        q(".verse-bg"),
        { yPercent: -8 },
        { yPercent: 8, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } },
      );
      gsap.fromTo(
        q(".verse-light"),
        { xPercent: -30 },
        { xPercent: 30, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } },
      );
      return stop;
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-label="Quranic verse" className="relative overflow-hidden bg-forest py-32 text-center text-cream md:py-44">
      <div className="verse-bg absolute -inset-y-[15%] inset-x-0">
        <div className="bg-stars size-full animate-drift opacity-[0.13]" />
      </div>
      <div className="verse-light pointer-events-none absolute top-1/2 left-1/2 aspect-square w-[70vw] -translate-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(246_231_200/0.16),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgb(13_42_33/0.75)_100%)]" />

      <div className="relative mx-auto max-w-4xl px-5">
        <StarGlyph className="verse-star mx-auto size-8 text-gold" />
        <p lang="ar" dir="rtl" className="verse-ar mt-10 text-[clamp(2rem,3.8vw+0.6rem,3.7rem)] leading-[1.9] text-gold-soft">
          {words.map((w, i) => (
            <Fragment key={i}>
              <span className="verse-word inline-block">{w}</span>
              {i < words.length - 1 && " "}
            </Fragment>
          ))}
        </p>
        <blockquote data-reveal="words" data-delay="0.6" className="mt-8 font-display text-[clamp(1.35rem,1.5vw+1rem,2.1rem)] leading-snug font-normal italic">
          “{verse.translation}”
        </blockquote>
        <p data-reveal="fade" data-delay="0.9" className="mt-7 text-[0.92rem] text-cream/70">
          {verse.reference}
        </p>
      </div>
    </section>
  );
}
