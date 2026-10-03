import { useRef } from "react";
import { statement } from "../content";
import { Lanterns } from "../components/Effects";
import { gsap, useGSAP } from "../lib/gsap";
import { useMedia, useReducedMotion } from "../lib/hooks";

/*
  Apple-style "step inside" moment. A small arched window sits in the page;
  as you scroll it grows until it fills the screen (the arch dissolves into
  the edges), the scene inside settles from a zoom, and then the promise
  lights up word by word. Reduced motion: a calm, fully-open dark band.
*/
export function WindowReveal() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const mobile = useMedia("(max-width: 767px)");
  const words = statement.text.split(" ");

  useGSAP(
    () => {
      if (reduced) return;
      const q = gsap.utils.selector(root);
      const win = q(".wr-window")[0] as HTMLElement;

      // The arch shape is computed by hand from one progress value. (Tweening
      // clip-path strings directly breaks: the browser shortens "inset(15% 35% 9% 35%)"
      // to three values, so the numbers no longer line up.)
      const from = mobile ? { top: 25, side: 9, bottom: 12 } : { top: 21, side: 35, bottom: 6 };
      const shape = { p: 0 };
      const applyShape = () => {
        const k = shape.p;
        const top = from.top * (1 - k);
        const side = from.side * (1 - k);
        const bottom = from.bottom * (1 - k);
        const width = window.innerWidth * (1 - (2 * side) / 100);
        const arch = (width / 2) * (1 - k); // full half-circle top, flattening as it fills the screen
        const foot = 28 * (1 - k);
        win.style.clipPath = `inset(${top}% ${side}% ${bottom}% ${side}% round ${arch}px ${arch}px ${foot}px ${foot}px)`;
      };
      applyShape();
      gsap.set(q(".wr-word"), { opacity: 0.12 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${window.innerHeight * 2.4}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onRefresh: applyShape,
          },
        })
        .to(shape, { p: 1, duration: 1, ease: "power2.inOut", onUpdate: applyShape }, 0)
        .fromTo(q(".wr-inner"), { scale: 1.35 }, { scale: 1, duration: 1, ease: "power2.inOut" }, 0)
        .to(q(".wr-outer"), { autoAlpha: 0, y: -50, scale: 0.94, duration: 0.45, ease: "power2.in" }, 0)
        .fromTo(q(".wr-text"), { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, 0.62)
        .to(q(".wr-word"), { opacity: 1, duration: 0.25, stagger: 0.045, ease: "none" }, 0.75)
        .to({}, { duration: 0.35 });

      return () => {
        win.style.clipPath = "";
      };
    },
    { scope: root, dependencies: [reduced, mobile], revertOnUpdate: true },
  );

  return (
    // Stable wrapper: GSAP moves the pinned <section> into a pin-spacer, so React only ever touches this div.
    <div>
      <section ref={root} aria-label="Our promise" className="relative h-svh overflow-hidden bg-cream">
        {/* Before stepping in */}
        <div className="wr-outer absolute inset-x-0 top-[12%] z-10 px-5 text-center">
          <p className="eyebrow">Our promise</p>
          <p className="mt-3 text-sm font-medium text-ink-soft">Scroll to step inside</p>
        </div>

        <div className="wr-window absolute inset-0 overflow-hidden bg-forest-deep">
          <div className="wr-inner absolute inset-0">
            <div className="bg-stars-light absolute inset-0 opacity-[0.07]" />
            <div className="absolute top-1/2 left-1/2 aspect-square w-[110vmax] -translate-1/2 bg-[radial-gradient(closest-side,rgb(232_176_74/0.32),rgb(31_90_70/0.25)_45%,transparent_70%)]" />
            <Lanterns className="absolute inset-0 size-full" count={44} />
          </div>

          <div className="wr-text relative grid h-full place-items-center px-5">
            <p className="mx-auto max-w-5xl text-center font-display text-[clamp(2rem,4vw+0.6rem,4.6rem)] leading-[1.14] font-medium tracking-[-0.015em] text-cream">
              {words.map((w, i) => (
                <span key={i}>
                  <span className={`wr-word ${statement.accent.includes(w) ? "text-gold-gradient italic" : ""}`}>{w}</span>{" "}
                </span>
              ))}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
