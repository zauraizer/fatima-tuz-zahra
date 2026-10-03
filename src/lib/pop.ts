import { useEffect } from "react";
import { gsap } from "./gsap";

/*
  Apple-style hover "pop", site-wide, from one set of delegated listeners.

  Every .btn pops automatically. Anything else opts in with data-pop:
    data-pop             scale 1.035 and lift 4px
    data-pop="1.08"      custom scale
    data-pop-lift="0"    scale only, no lift
  Children marked data-pop-icon give a springy wiggle when their parent pops.
  Pressing squashes slightly, like a physical button.

  Nested targets (a button inside a card) pop together: the card stays lifted
  while you hover the button inside it.
  Mouse/trackpad only; touch and reduced-motion get nothing.
*/

const SELECTOR = "[data-pop], .btn";
const scaleOf = (el: HTMLElement) => Number(el.dataset.pop) || (el.classList.contains("btn") ? 1.05 : 1.035);
const liftOf = (el: HTMLElement) => (el.dataset.popLift === "0" ? 0 : el.classList.contains("btn") ? -2 : -4);

function enter(el: HTMLElement) {
  if (el.matches(":disabled, [aria-disabled='true']")) return;
  gsap.to(el, { scale: scaleOf(el), y: liftOf(el), duration: 0.55, ease: "back.out(2.4)", overwrite: "auto" });
  const icons = el.querySelectorAll("[data-pop-icon]");
  if (icons.length) {
    gsap.fromTo(
      icons,
      { rotate: 0, scale: 1 },
      {
        keyframes: { rotate: [0, -12, 9, -4, 0], scale: [1, 1.18, 1.12, 1.14, 1.12] },
        duration: 0.7,
        ease: "power2.out",
        overwrite: "auto",
      },
    );
  }
}

function leave(el: HTMLElement) {
  gsap.to(el, { scale: 1, y: 0, duration: 0.6, ease: "power3.out", overwrite: "auto" });
  const icons = el.querySelectorAll("[data-pop-icon]");
  if (icons.length) gsap.to(icons, { rotate: 0, scale: 1, duration: 0.5, ease: "power3.out", overwrite: "auto" });
}

export function usePopHover(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let active = new Set<HTMLElement>();

    const chainFor = (target: EventTarget | null) => {
      const chain = new Set<HTMLElement>();
      let el = target instanceof Element ? target.closest<HTMLElement>(SELECTOR) : null;
      while (el) {
        chain.add(el);
        el = el.parentElement?.closest<HTMLElement>(SELECTOR) ?? null;
      }
      return chain;
    };

    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const chain = chainFor(e.target);
      active.forEach((el) => !chain.has(el) && leave(el));
      chain.forEach((el) => !active.has(el) && enter(el));
      active = chain;
    };
    const onLeaveDoc = () => {
      active.forEach(leave);
      active.clear();
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const el = e.target instanceof Element ? e.target.closest<HTMLElement>(SELECTOR) : null;
      if (el) gsap.to(el, { scale: scaleOf(el) * 0.95, duration: 0.15, ease: "power2.out", overwrite: "auto" });
    };
    const onUp = (e: PointerEvent) => {
      const el = e.target instanceof Element ? e.target.closest<HTMLElement>(SELECTOR) : null;
      if (el && active.has(el)) gsap.to(el, { scale: scaleOf(el), duration: 0.5, ease: "back.out(3)", overwrite: "auto" });
    };

    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeaveDoc);
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeaveDoc);
      onLeaveDoc();
    };
  }, [enabled]);
}
