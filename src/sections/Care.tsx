import { useRef, useState, type ReactNode } from "react";
import { care } from "../content";
import { SectionHeading } from "../components/Bits";
import { Icon } from "../components/Icon";
import { gsap, isFinePointer, prefersReducedMotion, useGSAP } from "../lib/gsap";
import { useReducedMotion } from "../lib/hooks";
import { useLenis, useScrollTo } from "../components/SmoothScroll";

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
  { card: "bg-[linear-gradient(160deg,#f6cf74,#e2a93b)]", title: "text-forest-deep", body: "text-forest-deep/85", icon: "bg-forest-deep/10 text-forest-deep", num: "text-forest-deep/[0.09]", stars: false, cta: "btn-primary" },
  { card: "bg-[linear-gradient(160deg,#b5543a,#8a3223)]", title: "text-white", body: "text-white", icon: "bg-white/15 text-white", num: "text-white/[0.1]", stars: true },
  { card: "bg-[linear-gradient(160deg,#1d5566,#0d2a35)]", title: "text-cream", body: "text-cream/85", icon: "bg-cream/12 text-sky", num: "text-cream/[0.08]", stars: true },
  { card: "bg-[linear-gradient(160deg,#cfe8f3,#9fcbe0)]", title: "text-ink", body: "text-ink/80", icon: "bg-white/60 text-teal", num: "text-ink/[0.07]", stars: false },
  { card: "bg-[linear-gradient(160deg,#fffaf0,#f3ead8)] border border-line", title: "text-ink", body: "text-ink-soft", icon: "bg-forest text-gold-soft", num: "text-ink/[0.06]", stars: false },
];

/*
  Self-running gallery: the cards glide past on their own in an endless loop
  (two copies of the set, wrapped seamlessly) and keep moving under the mouse.
  Click or tap a card and it pops out: the row stops and the card expands out
  of its spot into a large centred panel over a dimmed page. Close it (✕, the
  dimmed background, or Esc) and it shrinks back into place; the row carries on.
  Also: a Pause button (WCAG 2.2.2), a little speed-up with page scroll,
  drag/swipe, and keyboard support (Tab to a card, Enter to pop it).
  Reduced motion: a still, swipeable row.
*/
type Engine = { centerOn: (el: HTMLElement) => void; justDragged: () => boolean };

export function Care() {
  const root = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const engine = useRef<Engine | null>(null);
  const reduced = useReducedMotion();
  const lenis = useLenis();
  const [playing, setPlaying] = useState(true);
  const [open, setOpen] = useState<{ n: number; source: HTMLElement } | null>(null);
  const playingRef = useRef(playing);
  const selectedRef = useRef<number | null>(null);
  playingRef.current = playing;
  selectedRef.current = open ? open.n : null;

  const count = care.items.length;
  const cards = reduced ? care.items : [...care.items, ...care.items];

  // ---- The moving row ----
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

      const s = { pos: 0, speed: 0 };
      let steering = false; // a tween is gliding a popped card to the centre
      let visible = false;
      let down = false;
      let dragging = false;
      let keyboardFocus = false;
      let touchHold = false;
      let holdTimer = 0;
      let startX = 0;
      let lastX = 0;
      let dragEndedAt = 0;

      const tick = () => {
        if (!visible || !loop) return;
        if (!steering) {
          const paused = !playingRef.current || selectedRef.current !== null || dragging || touchHold || keyboardFocus;
          const boost = 1 + Math.min(Math.abs(lenis?.velocity ?? 0) * 0.08, 4);
          s.speed += ((paused ? 0 : BASE * boost) - s.speed) * 0.06;
          s.pos += s.speed * gsap.ticker.deltaRatio();
        }
        const x = ((s.pos % loop) + loop) % loop;
        setX(-x);
        if (bar.current) bar.current.style.transform = `scaleX(${x / loop})`;
      };
      gsap.ticker.add(tick);

      const centerOn = (el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        const v = vp.getBoundingClientRect();
        steering = true;
        s.speed = 0;
        gsap.to(s, {
          pos: s.pos + (r.left + r.width / 2 - (v.left + v.width / 2)),
          duration: 0.9,
          ease: "power3.inOut",
          overwrite: true,
          onComplete: () => (steering = false),
        });
      };
      engine.current = { centerOn, justDragged: () => performance.now() - dragEndedAt < 250 };

      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(vp);

      // Drag only starts after a few pixels, so a plain click still pops a card.
      const onDown = (e: PointerEvent) => {
        down = true;
        startX = lastX = e.clientX;
      };
      const onMove = (e: PointerEvent) => {
        if (!down) return;
        if (!dragging && Math.abs(e.clientX - startX) > 6) {
          dragging = true;
          steering = false;
          gsap.killTweensOf(s);
          try {
            vp.setPointerCapture(e.pointerId);
          } catch {
            /* pointer already gone — dragging still works without capture */
          }
        }
        if (dragging) s.pos -= e.clientX - lastX;
        lastX = e.clientX;
      };
      const onUp = (e: PointerEvent) => {
        down = false;
        if (!dragging) return;
        dragging = false;
        dragEndedAt = performance.now();
        if (vp.hasPointerCapture(e.pointerId)) vp.releasePointerCapture(e.pointerId);
        // After a swipe on a phone, give people a moment to read before it moves on.
        if (e.pointerType !== "mouse") {
          touchHold = true;
          window.clearTimeout(holdTimer);
          holdTimer = window.setTimeout(() => (touchHold = false), 2500);
        }
      };
      // Keyboard users: hold still and bring the focused card into view.
      const onFocusIn = (e: FocusEvent) => {
        const el = e.target as HTMLElement;
        if (!el.matches(":focus-visible")) return;
        keyboardFocus = true;
        const li = el.closest("li");
        if (li) centerOn(li);
      };
      const onFocusOut = () => (keyboardFocus = false);

      vp.addEventListener("pointerdown", onDown);
      vp.addEventListener("pointermove", onMove);
      vp.addEventListener("pointerup", onUp);
      vp.addEventListener("pointercancel", onUp);
      vp.addEventListener("focusin", onFocusIn);
      vp.addEventListener("focusout", onFocusOut);

      return () => {
        engine.current = null;
        gsap.ticker.remove(tick);
        gsap.killTweensOf(s);
        ro.disconnect();
        io.disconnect();
        window.clearTimeout(holdTimer);
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

  // ---- Popping a card out ----
  const openCard = (n: number, source: HTMLElement) => {
    if (engine.current?.justDragged()) return;
    setOpen({ n, source });
  };

  return (
    <section ref={root} id="care" className="relative overflow-clip bg-sand py-28 outline-none md:py-36">
      <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-end justify-between gap-x-10 gap-y-6 px-5">
        <SectionHeading eyebrow={care.eyebrow} title={care.title} lead={care.lead} />
        {!reduced && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3 pb-2">
            <span className="text-sm text-ink-soft">Tap a card for a closer look</span>
            <span className="relative h-[3px] w-24 overflow-hidden rounded-full bg-line" aria-hidden="true">
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
            : "mt-6 cursor-grab touch-pan-y select-none active:cursor-grabbing [mask-image:linear-gradient(to_right,transparent,#000_4%,#000_96%,transparent)]"
        }
      >
        <ul ref={track} className="flex w-max gap-5 px-[max(1.25rem,calc((100vw-1240px)/2+1.25rem))] py-6 will-change-transform md:py-10">
          {cards.map((item, i) => {
            const n = i % count;
            const t = THEMES[n % THEMES.length];
            const copy = i >= count; // second set exists only to make the loop seamless
            return (
              <li
                key={`${item.title}-${i}`}
                data-reveal
                aria-hidden={copy || undefined}
                className="relative shrink-0 snap-start"
              >
                  <SpotlightCard
                    data-pop="1.03"
                    role={reduced ? undefined : "button"}
                    tabIndex={reduced ? undefined : copy ? -1 : 0}
                    aria-haspopup={reduced ? undefined : "dialog"}
                    aria-label={reduced ? undefined : `Open ${item.title}`}
                    onClick={(e) => !reduced && openCard(n, e.currentTarget)}
                    onKeyDown={(e) => {
                      if (reduced || (e.key !== "Enter" && e.key !== " ")) return;
                      e.preventDefault();
                      openCard(n, e.currentTarget);
                    }}
                    className={`flex h-[400px] w-[min(80vw,360px)] flex-col rounded-[2rem] p-8 shadow-lift transition-shadow duration-500 hover:shadow-pop md:h-[440px] md:w-[380px] ${
                      reduced ? "" : "cursor-pointer"
                    } ${t.card}`}
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

      {open && <CareDetail key={open.n} n={open.n} source={open.source} onClosed={() => setOpen(null)} />}
    </section>
  );
}

/*
  The expanded card. It starts exactly over the card that was clicked, grows
  into a large centred panel (about 90% × 84% of the screen) while the page
  dims, then its content fades up. Closing reverses it back into the card's
  spot. Native <dialog> gives focus trapping, Esc and an inert page for free.
*/
type Box = { left: number; top: number; width: number; height: number };
const boxOf = (el: Element): Box => {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
};
const centredBox = (): Box => {
  const width = Math.min(window.innerWidth * 0.9, 1080);
  const height = Math.min(window.innerHeight * 0.84, 680);
  return { left: (window.innerWidth - width) / 2, top: (window.innerHeight - height) / 2, width, height };
};

function CareDetail({ n, source, onClosed }: { n: number; source: HTMLElement; onClosed: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const closing = useRef(false);
  const lenis = useLenis();
  const scrollTo = useScrollTo();
  const item = care.items[n];
  const t = THEMES[n % THEMES.length];

  useGSAP(() => {
    const d = dialog.current!;
    d.showModal();
    lenis?.stop();
    source.style.visibility = "hidden";
    gsap.set(panel.current, boxOf(source));
    closeBtn.current?.focus({ preventScroll: true });

    const onResize = () => !closing.current && gsap.set(panel.current, centredBox());
    window.addEventListener("resize", onResize);

    if (prefersReducedMotion()) {
      gsap.set(panel.current, centredBox());
    } else {
      gsap
        .timeline()
        .fromTo(backdrop.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" }, 0)
        .to(panel.current, { ...centredBox(), borderRadius: 40, duration: 0.85, ease: "expo.out" }, 0)
        .fromTo(".detail-num", { yPercent: 25, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, ease: "expo.out" }, 0.15)
        .fromTo(content.current, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" }, 0.3);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      source.style.visibility = "";
      if (d.open) d.close();
      lenis?.start();
    };
  }, { scope: dialog });

  const close = (after?: () => void) => {
    if (closing.current) return;
    closing.current = true;
    const finish = () => {
      source.style.visibility = "";
      dialog.current?.close();
      lenis?.start();
      source.focus({ preventScroll: true });
      onClosed();
      after?.();
    };
    if (prefersReducedMotion()) return finish();
    gsap
      .timeline({ onComplete: finish })
      .to(content.current, { autoAlpha: 0, y: 16, duration: 0.2, ease: "power2.in" }, 0)
      .to(".detail-num", { opacity: 0, duration: 0.2 }, 0)
      .to(panel.current, { ...boxOf(source), borderRadius: 32, duration: 0.6, ease: "power3.inOut" }, 0.08)
      .to(backdrop.current, { opacity: 0, duration: 0.45, ease: "power2.in" }, 0.2);
  };

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    close(() => scrollTo(id));
  };

  return (
    <dialog
      ref={dialog}
      aria-labelledby={`care-detail-${n}`}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden bg-transparent p-0 backdrop:bg-transparent"
    >
      <div ref={backdrop} onClick={() => close()} className="absolute inset-0 bg-ink/55 backdrop-blur-md" />

      <div ref={panel} className={`fixed overflow-hidden rounded-[2rem] shadow-[0_40px_120px_-20px_rgb(0_0_0/0.55)] ${t.card}`}>
        {t.stars && <div className="bg-stars-light pointer-events-none absolute inset-0 opacity-[0.06]" />}
        <span
          aria-hidden="true"
          className={`detail-num pointer-events-none absolute -right-6 -bottom-16 font-display text-[16rem] leading-none font-semibold select-none md:-bottom-24 md:text-[26rem] ${t.num}`}
        >
          {String(n + 1).padStart(2, "0")}
        </span>

        <div ref={content} className="relative flex h-full flex-col p-7 sm:p-10 md:p-14">
          <div className="flex items-start justify-between gap-4">
            <span className={`grid size-16 place-items-center rounded-3xl backdrop-blur-sm md:size-24 ${t.icon}`}>
              <Icon name={item.icon} className="size-8 md:size-12" />
            </span>
            <button
              ref={closeBtn}
              type="button"
              onClick={() => close()}
              aria-label="Close"
              data-pop="1.1"
              className={`grid size-12 place-items-center rounded-full bg-white/20 backdrop-blur-md transition-colors hover:bg-white/35 ${t.title}`}
            >
              <Icon name="plus" className="size-5 rotate-45" strokeWidth={2.2} />
            </button>
          </div>

          <div className="mt-auto max-w-2xl">
            <p className={`text-xs font-bold tracking-[0.2em] uppercase opacity-75 ${t.title}`}>
              {care.eyebrow}
              <span className="ml-3">
                {n + 1} of {care.items.length}
              </span>
            </p>
            <h3 id={`care-detail-${n}`} className={`mt-3 text-[clamp(2.4rem,4.5vw+1rem,4.75rem)] leading-[1.02] ${t.title}`}>
              {item.title}
            </h3>
            <p className={`mt-5 text-lg leading-relaxed md:text-2xl md:leading-relaxed ${t.body}`}>{item.body}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {/* The gold card gets a green button so it doesn't vanish into the background. */}
              <a href="#donate" onClick={go("donate")} className={`btn ${"cta" in t ? t.cta : "btn-gold"}`}>
                Help provide this <Icon name="arrow" className="size-4" strokeWidth={2.2} />
              </a>
              <a href="#sponsor" onClick={go("sponsor")} className={`btn border-2 border-current hover:bg-white/15 ${t.title}`}>
                Sponsor a child
              </a>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}
