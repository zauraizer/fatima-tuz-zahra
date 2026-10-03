import { useRef } from "react";
import { story } from "../content";
import { SectionHeading } from "../components/Bits";
import { Emblem } from "../components/Brand";
import { Icon } from "../components/Icon";
import { RichText } from "../lib/draft";
import { gsap, prefersReducedMotion, useGSAP } from "../lib/gsap";

export function Story() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.to(".story-pattern", {
        yPercent: -12,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
      });
      gsap.to(".story-badge", {
        y: -60,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="about" className="relative overflow-x-clip py-28 outline-none md:py-36">
      <div className="mx-auto grid max-w-[1240px] items-center gap-20 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
        <div className="relative mx-auto w-full max-w-[420px]">
          <figure data-reveal="clip" className="arch relative aspect-[4/5] overflow-hidden border-2 border-dashed border-line bg-sand">
            <div data-reveal-inner className="absolute inset-0">
              <div className="story-pattern bg-stars absolute -inset-[15%] opacity-25" />
            </div>
            <div className="relative grid h-full place-content-center justify-items-center gap-4 p-10 text-center text-ink-soft">
              <Icon name="camera" className="size-12 text-gold" draw />
              <figcaption className="text-[0.95rem]">
                Add a photo of the home — the entrance, courtyard or a classroom.
                <small className="mt-2 block opacity-80">Avoid showing children's faces unless you have consent.</small>
              </figcaption>
            </div>
          </figure>

          {/* Rotating circular badge */}
          <div className="story-badge absolute -right-1 -bottom-8 size-32 md:-right-10 md:size-36" data-reveal="scale" data-delay="0.4">
            <svg viewBox="0 0 120 120" className="size-full animate-spin-slower">
              <defs>
                <path id="badge-circle" d="M60,60 m-47,0 a47,47 0 1,1 94,0 a47,47 0 1,1 -94,0" />
              </defs>
              <circle cx="60" cy="60" r="59" className="fill-cream" />
              <text className="fill-forest text-[8.6px] font-bold uppercase">
                <textPath href="#badge-circle" textLength="292" lengthAdjust="spacing">
                  {story.badge}
                </textPath>
              </text>
            </svg>
            <div className="absolute inset-0 m-auto grid size-15 place-items-center rounded-full bg-forest md:size-16">
              <Emblem light className="size-9" />
            </div>
          </div>
        </div>

        <div>
          <SectionHeading eyebrow={story.eyebrow} title={story.title} />
          <div className="mt-6 space-y-5 text-[1.07rem] leading-relaxed text-ink-soft">
            {story.paragraphs.map((p, i) => (
              <p key={i} data-reveal>
                <RichText parts={p} />
              </p>
            ))}
          </div>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {story.values.map((v, i) => (
              <li key={v.title} data-reveal data-pop className="group relative overflow-hidden rounded-2xl border border-line bg-white p-5 pt-6 transition-shadow duration-500 hover:shadow-pop">
                <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-[0.18] bg-gold transition-transform duration-700 ease-out-expo group-hover:scale-x-100" />
                <span className="font-display text-sm font-semibold text-gold-ink">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-1 text-lg">{v.title}</h3>
                <p className="mt-1 text-[0.93rem] leading-relaxed text-ink-soft">{v.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
