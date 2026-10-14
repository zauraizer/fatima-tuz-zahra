import { useRef } from "react";
import { children } from "../content";
import { SectionHeading } from "../components/Bits";
import { Photo } from "../components/Photo";
import { gsap, useGSAP } from "../lib/gsap";
import { useReducedMotion } from "../lib/hooks";

/*
  Smiling portraits in arch frames. The row glides sideways as the section
  scrolls past, tied to the scroll so it only moves when you do, and every
  other portrait drifts at a slightly different speed. With reduced motion
  it's a still row you can swipe.
*/
export function Children() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const t = track.current!;
      const scroll = { trigger: root.current, start: "top bottom", end: "bottom top" };
      gsap.fromTo(
        t,
        { x: () => window.innerWidth * 0.06 },
        { x: () => -Math.max(0, t.scrollWidth - window.innerWidth), ease: "none", scrollTrigger: { ...scroll, scrub: 0.6, invalidateOnRefresh: true } },
      );
      gsap.utils.toArray<HTMLElement>(".face", t).forEach((el, i) => {
        gsap.fromTo(el, { yPercent: i % 2 ? 7 : -3 }, { yPercent: i % 2 ? -7 : 3, ease: "none", scrollTrigger: { ...scroll, scrub: true } });
      });
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  );

  return (
    <section ref={root} aria-label={children.eyebrow} className="relative overflow-hidden py-28 md:py-36">
      <div className="mx-auto max-w-[1240px] px-5">
        <SectionHeading eyebrow={children.eyebrow} title={children.title} lead={children.lead} center />
      </div>

      <div className={reduced ? "no-scrollbar mt-14 snap-x snap-mandatory scroll-px-5 overflow-x-auto" : "mt-16"}>
        <ul ref={track} data-reveal="fade" className="flex w-max gap-4 px-5 pb-12 md:gap-6">
          {children.faces.map((f, i) => (
            <li key={f.name} className={`face shrink-0 snap-start ${i % 2 ? "mt-12" : ""}`}>
              <figure className="arch relative aspect-[4/5] w-[min(58vw,250px)] overflow-hidden bg-sand shadow-lift md:w-[260px]">
                <Photo name={f.name} alt={f.alt} sizes="(min-width: 768px) 260px, 58vw" className="size-full object-cover" />
                <div className="arch pointer-events-none absolute inset-2.5 border-[1.5px] border-white/50" />
              </figure>
            </li>
          ))}
        </ul>
      </div>

      <p data-reveal="fade" className="mx-auto mt-4 max-w-md px-5 text-center text-sm text-ink-soft">
        {children.note}
      </p>
    </section>
  );
}
