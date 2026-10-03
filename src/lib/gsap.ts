import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
gsap.defaults({ ease: "expo.out", duration: 1 });

export { gsap, ScrollTrigger, SplitText, useGSAP };

export const REDUCED = "(prefers-reduced-motion: reduce)";
/** QA switch: add ?reduced-motion to the URL to preview the reduced-motion version. */
export const FORCE_REDUCED = new URLSearchParams(window.location.search).has("reduced-motion");
if (FORCE_REDUCED) document.documentElement.setAttribute("data-reduced-motion", "");
export const prefersReducedMotion = () => FORCE_REDUCED || window.matchMedia(REDUCED).matches;
export const isFinePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;
