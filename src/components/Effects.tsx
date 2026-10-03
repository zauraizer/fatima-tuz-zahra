import { useEffect, useRef, type ReactNode } from "react";
import { gsap, isFinePointer, prefersReducedMotion, ScrollTrigger, useGSAP } from "../lib/gsap";
import { useFinePointer, useReducedMotion } from "../lib/hooks";
import { formatNumber } from "../lib/format";
import { onEnterOnce } from "../lib/reveal";
import { useLenis } from "./SmoothScroll";

/* ------------------------------------------------------------------
   Scroll progress hairline across the top of the viewport
   ------------------------------------------------------------------ */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const setScale = gsap.quickSetter(bar.current, "scaleX");
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: (self) => setScale(self.progress) });
  });
  return (
    <div
      ref={bar}
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px] origin-left scale-x-0 bg-gradient-to-r from-gold via-gold-soft to-gold"
      aria-hidden="true"
    />
  );
}

/* ------------------------------------------------------------------
   Soft cursor ring that trails the pointer and swells over anything
   clickable. Mouse/trackpad only; never replaces the system cursor.
   ------------------------------------------------------------------ */
export function Cursor() {
  const fine = useFinePointer();
  const reduced = useReducedMotion();
  return fine && !reduced ? <CursorInner /> : null;
}

function CursorInner() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.set([dot.current, ring.current], { xPercent: -50, yPercent: -50, autoAlpha: 0 });
    const dotX = gsap.quickTo(dot.current, "x", { duration: 0.12, ease: "power3" });
    const dotY = gsap.quickTo(dot.current, "y", { duration: 0.12, ease: "power3" });
    const ringX = gsap.quickTo(ring.current, "x", { duration: 0.55, ease: "power3" });
    const ringY = gsap.quickTo(ring.current, "y", { duration: 0.55, ease: "power3" });
    let visible = false;
    let hovering = false;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
      if (!visible) {
        visible = true;
        gsap.to([dot.current, ring.current], { autoAlpha: 1, duration: 0.3 });
      }
    };
    const onOver = (e: PointerEvent) => {
      const t = e.target as Element;
      const typing = !!t.closest("input, textarea, select");
      const interactive = !typing && !!t.closest("a, button, label, [data-cursor]");
      if (interactive === hovering && !typing) return;
      hovering = interactive;
      gsap.to(ring.current, {
        scale: interactive ? 1.9 : 1,
        backgroundColor: interactive ? "rgba(200,147,58,0.14)" : "rgba(200,147,58,0)",
        borderColor: interactive ? "rgba(200,147,58,0.5)" : "rgba(200,147,58,0.75)",
        autoAlpha: typing ? 0 : 1,
        duration: 0.4,
        ease: "power3.out",
      });
      gsap.to(dot.current, { scale: interactive ? 0 : 1, autoAlpha: typing ? 0 : 1, duration: 0.25 });
    };
    const onLeave = () => {
      visible = false;
      gsap.to([dot.current, ring.current], { autoAlpha: 0, duration: 0.3 });
    };

    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerover", onOver);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  });

  return (
    <>
      <div ref={ring} aria-hidden="true" className="pointer-events-none fixed top-0 left-0 z-[99] size-9 rounded-full border-[1.5px] border-gold/75" />
      <div ref={dot} aria-hidden="true" className="pointer-events-none fixed top-0 left-0 z-[99] size-1.5 rounded-full bg-gold" />
    </>
  );
}

/* ------------------------------------------------------------------
   Magnetic wrapper: the child leans toward the pointer
   ------------------------------------------------------------------ */
export function Magnetic({ children, strength = 0.3, className = "" }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(
    () => {
      if (!isFinePointer() || prefersReducedMotion()) return;
      const el = ref.current!;
      const xTo = gsap.quickTo(el, "x", { duration: 0.7, ease: "elastic.out(1, 0.45)" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.7, ease: "elastic.out(1, 0.45)" });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * strength);
        yTo((e.clientY - (r.top + r.height / 2)) * strength);
      };
      const leave = () => {
        xTo(0);
        yTo(0);
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
    <span ref={ref} className={`will-change-transform ${/\b(block|flex|grid|hidden)\b/.test(className) ? "" : "inline-block"} ${className}`}>
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------
   Number that counts up the first time it scrolls into view
   ------------------------------------------------------------------ */
export function Counter({ value, suffix = "", className = "" }: { value: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const final = formatNumber(value) + suffix;

  useGSAP(
    (_ctx, contextSafe) => {
      const el = ref.current!;
      if (reduced) {
        el.textContent = final;
        return;
      }
      el.textContent = "0" + suffix;
      const counter = { v: 0 };
      const play = contextSafe!(() =>
        gsap.to(counter, {
          v: value,
          duration: 2.4,
          ease: "power3.out",
          onUpdate: () => {
            el.textContent = formatNumber(counter.v) + suffix;
          },
        }),
      );
      return onEnterOnce(el, play);
    },
    { dependencies: [value, suffix, reduced], revertOnUpdate: true },
  );

  // GSAP owns the visible digits; screen readers get the final figure.
  return (
    <span className={`tabular-nums ${className}`}>
      <span ref={ref} aria-hidden="true" />
      <span className="sr-only">{final}</span>
    </span>
  );
}

/* ------------------------------------------------------------------
   Endless ticker that speeds up with scroll velocity and reverses
   when you scroll back up. It glides to a stop while hovered or paused.
   ------------------------------------------------------------------ */
export function Marquee({
  children,
  className = "",
  baseSpeed = 0.022,
  reverse = false,
  paused = false,
}: {
  children: ReactNode;
  className?: string;
  baseSpeed?: number;
  reverse?: boolean;
  paused?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const reduced = useReducedMotion();
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useGSAP(
    () => {
      if (reduced) return;
      const wrap = gsap.utils.wrap(0, 50);
      const setX = gsap.quickSetter(track.current, "xPercent");
      let pos = 0;
      let speed = 1;
      let visible = false;
      let hovered = false;
      const tick = () => {
        if (!visible) return;
        const v = lenis?.velocity ?? 0;
        const dir = lenis?.direction === -1 ? -1 : 1;
        const target = pausedRef.current || hovered ? 0 : dir * (1 + Math.min(Math.abs(v) * 0.12, 6));
        speed += (target - speed) * 0.06;
        pos += baseSpeed * speed * gsap.ticker.deltaRatio();
        setX(-wrap(reverse ? -pos : pos));
      };
      const el = root.current!;
      const onEnter = (e: PointerEvent) => (hovered = e.pointerType === "mouse");
      const onLeave = () => (hovered = false);
      el.addEventListener("pointerenter", onEnter);
      el.addEventListener("pointerleave", onLeave);
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(el);
      gsap.ticker.add(tick);
      return () => {
        gsap.ticker.remove(tick);
        io.disconnect();
        el.removeEventListener("pointerenter", onEnter);
        el.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: root, dependencies: [lenis, reverse, reduced], revertOnUpdate: true },
  );

  return (
    <div ref={root} className={`overflow-hidden ${className}`}>
      <div ref={track} className="flex w-max will-change-transform">
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Rising lanterns: soft gold lights drifting upward on a canvas
   ------------------------------------------------------------------ */
function makeGlowSprite() {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,240,205,1)");
  grad.addColorStop(0.18, "rgba(246,205,120,0.85)");
  grad.addColorStop(0.45, "rgba(214,164,78,0.28)");
  grad.addColorStop(1, "rgba(200,147,58,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

type Lantern = { x: number; y: number; r: number; vy: number; sway: number; phase: number; alpha: number; flicker: number };

export function Lanterns({ className = "", count = 26 }: { className?: string; count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const sprite = makeGlowSprite();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let t = 0;
    let last = 0;
    let raf = 0;
    let running = false;
    let lanterns: Lantern[] = [];

    const spawn = (anywhere: boolean): Lantern => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 30,
      r: 5 + Math.random() * 15,
      vy: 0.12 + Math.random() * 0.42,
      sway: 5 + Math.random() * 16,
      phase: Math.random() * Math.PI * 2,
      alpha: 0.35 + Math.random() * 0.55,
      flicker: Math.random() * Math.PI * 2,
    });

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const l of lanterns) {
        const x = l.x + Math.sin(t * 0.012 + l.phase) * l.sway;
        const glow = 0.75 + 0.25 * Math.sin(t * 0.06 + l.flicker);
        const fadeTop = Math.min(1, l.y / (h * 0.3));
        ctx.globalAlpha = Math.max(0, l.alpha * glow * fadeTop);
        ctx.drawImage(sprite, x - l.r, l.y - l.r, l.r * 2, l.r * 2);
      }
    };

    // Speeds are tuned per 60 Hz frame; scale by real elapsed time so 120 Hz screens match.
    const step = (now: number) => {
      const dt = last ? Math.min((now - last) / (1000 / 60), 3) : 1;
      last = now;
      t += dt;
      for (const l of lanterns) {
        l.y -= l.vy * dt;
        if (l.y < -30) Object.assign(l, spawn(false));
      }
      draw();
      raf = requestAnimationFrame(step);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lanterns = Array.from({ length: count }, () => spawn(true));
      draw();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const io = new IntersectionObserver(([e]) => {
      if (reduced) return;
      if (e.isIntersecting && !running) {
        running = true;
        last = 0;
        raf = requestAnimationFrame(step);
      } else if (!e.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [count, reduced]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
