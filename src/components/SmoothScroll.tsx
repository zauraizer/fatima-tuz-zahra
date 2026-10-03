import Lenis from "lenis";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { gsap, prefersReducedMotion, ScrollTrigger } from "../lib/gsap";

/*
  One Lenis instance drives the page, ticked from GSAP's ticker so
  ScrollTrigger and the eased scroll position never disagree by a frame.
  Every in-page anchor (#about, #give…) is routed through it.
*/

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

// The header clearance comes from CSS (scroll-padding-top on <html>), which Lenis
// and scrollIntoView both honour — so no offset is added here.
export function scrollToTarget(lenis: Lenis | null, target: HTMLElement | number, onDone?: () => void) {
  const immediate = prefersReducedMotion();
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.5, immediate, onComplete: onDone });
  } else if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: immediate ? "auto" : "smooth" });
    onDone?.();
  } else {
    target.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
    onDone?.();
  }
}

/** Scroll to an element id (or "top") and move keyboard focus there. */
export const useScrollTo = () => useScrollToWith(useLenis());

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const instance = new Lenis({ lerp: prefersReducedMotion() ? 1 : 0.095, autoRaf: false });
    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);
    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  const scrollTo = useScrollToWith(lenis);

  // Route every same-page anchor through Lenis.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href")!.slice(1) || "top";
      if (id !== "top" && !document.getElementById(id)) return;
      e.preventDefault();
      scrollTo(id);
      history.replaceState(null, "", id === "top" ? location.pathname : `#${id}`);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [scrollTo]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

function useScrollToWith(lenis: Lenis | null) {
  return useCallback(
    (id: string) => {
      const focus = (el: HTMLElement | null) => {
        if (!el) return;
        if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
        el.focus({ preventScroll: true });
      };
      // "Top" is the start of the homepage, just past the opening splash.
      if (id === "top") {
        return scrollToTarget(lenis, document.getElementById("splash")?.offsetHeight ?? 0, () => focus(document.getElementById("main")));
      }
      const el = document.getElementById(id);
      if (!el) return;
      scrollToTarget(lenis, el, () => focus(el));
    },
    [lenis],
  );
}
