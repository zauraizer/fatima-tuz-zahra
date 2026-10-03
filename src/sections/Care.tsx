import { useRef, useState, type ReactNode } from "react";
import { care } from "../content";
import { SectionHeading } from "../components/Bits";
import { Icon } from "../components/Icon";
import { gsap, isFinePointer, prefersReducedMotion, useGSAP } from "../lib/gsap";
import { useReducedMotion } from "../lib/hooks";
import { useLenis } from "../components/SmoothScroll";

/** Card with a cursor-following glow and a gentle 3D tilt. */
export function SpotlightCard({ children, className = "", ...rest }: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current!;
      if (!isFinePointer()) return;
      const reduced = prefersReducedMotion();
      gsap.set(el, { transformPerspective: 900 });
      const rx = gsap.quickTo(el, "rotationX", { duration: 0.8, ease: "power3" });
      const ry = gsap.quickTo(el, "rotationY", { duration: 0.8, ease: "power3" });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const px = e.clientX - r.left;
        const py = e.clientY - r.top;
        el.style.setProperty("--mx", `${px}px`);
        el.style.setProperty("--my", `${py}px`);
        if (reduced) return;
        ry((px / r.width - 0.5) * 7);
        rx(-(py / r.height - 0.5) * 7);
      };
      const leave = () => {
        rx(0);
        ry(0);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      };
    },
    { scope: ref },
  );

  return (
    <article ref={ref} className={`group relative overflow-hidden ${className}`} {...rest}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(380px circle at var(--mx, 50%) var(--my, 50%), rgb(200 147 58 / 0.17), transparent 65%)" }}
      />
      {children}
    </article>
  );
}

/* Each card gets its own colour world — contrast checked for every pair. */
const THEMES = [
  { card: "bg-[linear-gradient(160deg,#2a7a5d,#143d30)]", title: "text-cream", body: "text-cream", icon: "bg-cream/12 text-gold-soft", num: "text-cream/[0.08]", stars: true },
  { card: "bg-[linear-gradient(160deg,#f6cf74,#e2a93b)]", title: "text-forest-deep", body: "text-forest-deep/85", icon: "bg-forest-deep/10 text-forest-deep", num: "text-forest-deep/[0.09]", stars: false },
  { card: "bg-[linear-gradient(160deg,#b5543a,#8a3223)]", title: "text-white", body: "text-white", icon: "bg-white/15 text-white", num: "text-white/[0.1]", stars: true },
  { card: "bg-[linear-gradient(160deg,#1d5566,#0d2a35)]", title: "text-cream", body: "text-cream/85", icon: "bg-cream/12 text-sky", num: "text-cream/[0.08]", stars: true },
  { card: "bg-[linear-gradient(160deg,#cfe8f3,#9fcbe0)]", title: "text-ink", body: "text-ink/80", icon: "bg-white/60 text-teal", num: "text-ink/[0.07]", stars: false },
  { card: "bg-[linear-gradient(160deg,#fffaf0,#f3ead8)] border border-line", title: "text-ink", body: "text-ink-soft", icon: "bg-forest text-gold-soft", num: "text-ink/[0.06]", stars: false },
];

/*
  Self-running gallery: the cards glide past on their own in an endless loop
  (two copies of the set, wrapped seamlessly). It eases to a stop while you
  hover a card or tab into it, can be paused with the button (WCAG 2.2.2),
  speeds up a little with page scroll, and can still be dragged or swiped.
  Reduced motion: a still, swipeable row.
*/
export function Care() {
  const root = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const lenis = useLenis();
  const [playing, setPlaying] = useState(true);
  const playingRef = useRef(playing);
  playingRef.current = playing;

  const count = care.items.length;
  const cards = reduced ? care.items : [...care.items, ...care.items];

  useGSAP(
    () => {
      if (reduced) return;
      const vp = viewport.current!;
      const t = track.current!;
      const setX = gsap.quickSetter(t, "x", "px");
      const BASE = 1.5; // px per frame at 60fps ≈ 90px/s

      // One loop = distance from the first card to its copy.
      let loop = 0;
      const measure = () => {
        const items = t.children;
        loop = (items[count] as HTMLElement).offsetLeft - (items[0] as HTMLElement).offsetLeft;
      };
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(t);

      let pos = 0;
      let speed = 0;
      let visible = false;
      let hovering = false;
      let focused = false;
      let dragging = false;
      let touchHold = false;
      let holdTimer = 0;
      let lastX = 0;

      const tick = () => {
        if (!visible || !loop) return;
        const paused = !playingRef.current || hovering || focused || dragging || touchHold;
        const boost = 1 + Math.min(Math.abs(lenis?.velocity ?? 0) * 0.08, 4);
        speed += ((paused ? 0 : BASE * boost) - speed) * 0.06;
        pos = (((pos + speed * gsap.ticker.deltaRatio()) % loop) + loop) % loop;
        setX(-pos);
        if (bar.current) bar.current.style.transform = `scaleX(${pos / loop})`;
      };
      gsap.ticker.add(tick);

      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(vp);

      const onEnter = (e: PointerEvent) => e.pointerType === "mouse" && (hovering = true);
      const onLeave = (e: PointerEvent) => e.pointerType === "mouse" && (hovering = false);
      const onDown = (e: PointerEvent) => {
        dragging = true;
        lastX = e.clientX;
        try {
          vp.setPointerCapture(e.pointerId);
        } catch {
          /* pointer already gone — dragging still works without capture */
        }
      };
      const onMove = (e: PointerEvent) => {
        if (!dragging) return;
        pos -= e.clientX - lastX;
        lastX = e.clientX;
      };
      const onUp = (e: PointerEvent) => {
        if (!dragging) return;
        dragging = false;
        if (vp.hasPointerCapture(e.pointerId)) vp.releasePointerCapture(e.pointerId);
        // After a swipe on a phone, give people a moment to read before it moves on.
        if (e.pointerType !== "mouse") {
          touchHold = true;
          window.clearTimeout(holdTimer);
          holdTimer = window.setTimeout(() => (touchHold = false), 2500);
        }
      };
      const onFocusIn = () => (focused = true);
      const onFocusOut = () => (focused = false);

      vp.addEventListener("pointerenter", onEnter);
      vp.addEventListener("pointerleave", onLeave);
      vp.addEventListener("pointerdown", onDown);
      vp.addEventListener("pointermove", onMove);
      vp.addEventListener("pointerup", onUp);
      vp.addEventListener("pointercancel", onUp);
      vp.addEventListener("focusin", onFocusIn);
      vp.addEventListener("focusout", onFocusOut);

      return () => {
        gsap.ticker.remove(tick);
        ro.disconnect();
        io.disconnect();
        window.clearTimeout(holdTimer);
        vp.removeEventListener("pointerenter", onEnter);
        vp.removeEventListener("pointerleave", onLeave);
        vp.removeEventListener("pointerdown", onDown);
        vp.removeEventListener("pointermove", onMove);
        vp.removeEventListener("pointerup", onUp);
        vp.removeEventListener("pointercancel", onUp);
        vp.removeEventListener("focusin", onFocusIn);
        vp.removeEventListener("focusout", onFocusOut);
      };
    },
    { scope: root, dependencies: [reduced, lenis, count], revertOnUpdate: true },
  );

  return (
    <section ref={root} id="care" className="relative overflow-hidden bg-sand py-28 outline-none md:py-36">
      <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-end justify-between gap-x-10 gap-y-6 px-5">
        <SectionHeading eyebrow={care.eyebrow} title={care.title} lead={care.lead} />
        {!reduced && (
          <div className="flex items-center gap-4 pb-2">
            <span className="relative h-[3px] w-28 overflow-hidden rounded-full bg-line" aria-hidden="true">
              <span ref={bar} className="absolute inset-0 origin-left scale-x-0 rounded-full bg-forest" />
            </span>
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-pressed={!playing}
              data-pop="1.08"
              className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-line bg-cream px-4 py-2 text-sm font-semibold text-forest transition-colors duration-300 hover:border-forest"
            >
              <Icon name={playing ? "pause" : "play"} className="size-4" strokeWidth={2.2} />
              {playing ? "Pause" : "Play"}
              <span className="sr-only"> the moving gallery</span>
            </button>
          </div>
        )}
      </div>

      <div
        ref={viewport}
        className={
          reduced
            ? "no-scrollbar mt-12 snap-x snap-mandatory scroll-px-5 overflow-x-auto"
            : "mt-12 cursor-grab touch-pan-y select-none active:cursor-grabbing [mask-image:linear-gradient(to_right,transparent,#000_4%,#000_96%,transparent)]"
        }
      >
        <ul ref={track} className="flex w-max gap-5 px-[max(1.25rem,calc((100vw-1240px)/2+1.25rem))] will-change-transform">
          {cards.map((item, i) => {
            const n = i % count;
            const t = THEMES[n % THEMES.length];
            const copy = i >= count; // second set exists only to make the loop seamless
            return (
              <li
                key={`${item.title}-${i}`}
                data-reveal
                aria-hidden={copy || undefined}
                inert={copy || undefined}
                className="shrink-0 snap-start py-3"
              >
                <SpotlightCard
                  data-pop="1.03"
                  className={`flex h-[400px] w-[min(80vw,360px)] flex-col rounded-[2rem] p-8 shadow-lift transition-shadow duration-500 hover:shadow-pop md:h-[440px] md:w-[380px] ${t.card}`}
                >
                  {t.stars && <div className="bg-stars-light pointer-events-none absolute inset-0 opacity-[0.06]" />}
                  <span
                    className={`pointer-events-none absolute -right-3 -bottom-12 font-display text-[11rem] leading-none font-semibold select-none ${t.num}`}
                    aria-hidden="true"
                  >
                    {String(n + 1).padStart(2, "0")}
                  </span>
                  <span data-pop-icon className={`relative grid size-16 place-items-center rounded-2xl backdrop-blur-sm ${t.icon}`}>
                    <Icon name={item.icon} className="size-8" draw />
                  </span>
                  <div className="relative mt-auto">
                    <h3 className={`text-[1.9rem] leading-tight ${t.title}`}>{item.title}</h3>
                    <p className={`mt-3 text-[1.03rem] leading-relaxed ${t.body}`}>{item.body}</p>
                  </div>
                </SpotlightCard>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
