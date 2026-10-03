import { useEffect, useState } from "react";
import { FORCE_REDUCED, REDUCED } from "./gsap";

/** Live-updating media query match. */
export function useMedia(query: string) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatch(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return match;
}

export function useReducedMotion() {
  const media = useMedia(REDUCED);
  return FORCE_REDUCED || media;
}
export const useFinePointer = () => useMedia("(hover: hover) and (pointer: fine)");
