import type { RefObject } from "react";
import { gsap, SplitText, useGSAP } from "./gsap";

/*
  Declarative entrance animations. Put data-reveal on any element:

    data-reveal          rise out of a soft blur (default)
    data-reveal="lines"  text rises line by line from behind a mask
    data-reveal="words"  text rises word by word
    data-reveal="clip"   wipes open from the bottom; [data-reveal-inner] zooms out inside it
    data-reveal="scale"  pops in
    data-reveal="fade"   opacity only
    data-delay="0.2"     extra delay in seconds

  Any <path pathLength="1" data-draw> inside a revealed element draws itself.

  One-shot reveals use IntersectionObserver rather than ScrollTrigger:
  intersection callbacks fire on layout however the page moved (anchor jumps,
  restored scroll position), so nothing can get stranded invisible.

  Waiting elements are hidden with opacity only, never visibility, so they stay
  in the tab order and are read by screen readers. Tabbing into one reveals it
  at once.
*/

type Kind = "up" | "lines" | "words" | "clip" | "scale" | "fade";
const NAMED: readonly string[] = ["lines", "words", "clip", "scale", "fade"];
// React renders a bare `data-reveal` as "true", so anything unnamed means the default.
const kindOf = (el: HTMLElement): Kind => (NAMED.includes(el.dataset.reveal ?? "") ? (el.dataset.reveal as Kind) : "up");

function prepare(el: HTMLElement) {
  switch (kindOf(el)) {
    case "up":
      gsap.set(el, { opacity: 0, y: 44, scale: 0.965, filter: "blur(10px)" });
      break;
    case "scale":
      gsap.set(el, { opacity: 0, scale: 0.92 });
      break;
    case "clip":
      gsap.set(el, { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(el.querySelectorAll("[data-reveal-inner]"), { scale: 1.25 });
      break;
    default:
      gsap.set(el, { opacity: 0 });
  }
  const paths = el.querySelectorAll("[data-draw]");
  if (paths.length) gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 });
}

/** Split text into masked lines/words and rise them in; the split is reverted afterwards so text reflows normally. */
function splitRise(el: HTMLElement, type: "lines" | "words", delay = 0) {
  const split = SplitText.create(el, {
    type,
    mask: type,
    linesClass: "split-line",
    aria: "auto",
  });
  const targets = type === "lines" ? split.lines : split.words;
  gsap.set(el, { opacity: 1 });
  gsap.from(targets, {
    yPercent: 115,
    duration: type === "lines" ? 1.25 : 1,
    stagger: type === "lines" ? 0.1 : 0.035,
    delay,
    onComplete: () => split.revert(),
  });
}

/** Text is split by line, so it must wait for the web fonts; the rest can start right away. */
function animate(el: HTMLElement, delay: number, later: (fn: () => void) => void) {
  delay += Number(el.dataset.delay || 0);
  switch (kindOf(el)) {
    case "up":
      // Apple-style: rise out of a soft blur, settling with a long ease.
      gsap.to(el, {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: 1.35,
        delay,
        onComplete: () => gsap.set(el, { clearProps: "filter" }),
      });
      break;
    case "scale":
      gsap.to(el, { opacity: 1, scale: 1, duration: 1, ease: "back.out(1.5)", delay });
      break;
    case "fade":
      gsap.to(el, { opacity: 1, duration: 1.4, ease: "power2.out", delay });
      break;
    case "clip":
      gsap.to(el, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut", delay });
      gsap.to(el.querySelectorAll("[data-reveal-inner]"), { scale: 1, duration: 1.9, ease: "expo.out", delay });
      break;
    case "lines":
    case "words":
      later(() => splitRise(el, kindOf(el) as "lines" | "words", delay));
      break;
  }
  const paths = el.querySelectorAll("[data-draw]");
  if (paths.length) {
    gsap.to(paths, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut", stagger: 0.12, delay: delay + 0.25 });
  }
}

export function useReveals(scope: RefObject<HTMLElement | null>, enabled: boolean) {
  useGSAP(
    (_ctx, contextSafe) => {
      const root = scope.current;
      if (!enabled || !root) return;
      const els = gsap.utils.toArray<HTMLElement>("[data-reveal]", root);
      els.forEach(prepare);
      const waiting = new Set(els);

      // Work that waits for the fonts runs later, outside this callback, so it is
      // wrapped to stay revertible and skipped if the page has been torn down.
      let alive = true;
      const runSafe = contextSafe!((fn: () => void) => fn());
      const later = (fn: () => void) => void document.fonts.ready.then(() => alive && runSafe(fn));

      const play = contextSafe!((el: HTMLElement, delay: number) => {
        if (!waiting.delete(el)) return;
        io.unobserve(el);
        animate(el, delay, later);
      });
      const io = new IntersectionObserver(
        (entries) => {
          let i = 0;
          for (const entry of entries) {
            if (entry.isIntersecting) play(entry.target as HTMLElement, i++ * 0.09);
          }
        },
        { rootMargin: "0px 0px -8% 0px" },
      );
      els.forEach((el) => io.observe(el));

      const onFocusIn = (e: FocusEvent) => {
        for (let el = (e.target as Element).closest<HTMLElement>("[data-reveal]"); el; el = el.parentElement?.closest<HTMLElement>("[data-reveal]") ?? null) {
          play(el, 0);
        }
      };
      root.addEventListener("focusin", onFocusIn);

      return () => {
        alive = false;
        io.disconnect();
        root.removeEventListener("focusin", onFocusIn);
      };
    },
    { scope, dependencies: [enabled], revertOnUpdate: true },
  );
}

/** Run `cb` once, the first time `el` scrolls into view. Returns a disconnect function. */
export function onEnterOnce(el: Element, cb: () => void, rootMargin = "0px 0px -10% 0px") {
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        cb();
      }
    },
    { rootMargin },
  );
  io.observe(el);
  return () => io.disconnect();
}
