import { useEffect, useRef, useState } from "react";
import { photoFiles } from "../assets/photos";
import type { GalleryPhoto } from "../content";
import { gsap, prefersReducedMotion, useGSAP } from "../lib/gsap";
import { Icon } from "./Icon";
import { useLenis } from "./SmoothScroll";

/*
  Full-screen photo viewer. The photo grows out of the tile that was clicked into
  the largest size that fits, over a dark page. Arrows, the arrow keys or a swipe
  move between photos; ✕, Esc or a click on the background closes it, and the
  photo shrinks back into its tile when that tile is on screen.
  Native <dialog> gives focus trapping and an inert page for free.
*/

type Box = { left: number; top: number; width: number; height: number };
const boxOf = (el: Element): Box => {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
};

/** The largest box the photo fits in, leaving room for the controls. */
function fitted(photo: GalleryPhoto): Box {
  const f = photoFiles[photo.name];
  const phone = window.innerWidth < 768;
  const sideRoom = phone ? 12 : 96;
  const top = phone ? 64 : 76;
  const bottom = phone ? 132 : 104;
  const roomW = window.innerWidth - sideRoom * 2;
  const roomH = window.innerHeight - top - bottom;
  const scale = Math.min(roomW / f.width, roomH / f.height, 1.6);
  const width = f.width * scale;
  const height = f.height * scale;
  return { left: (window.innerWidth - width) / 2, top: top + (roomH - height) / 2, width, height };
}

export function PhotoViewer({
  photos,
  start,
  source,
  opener,
  tileFor,
  onClosed,
}: {
  photos: GalleryPhoto[];
  start: number;
  /** The tile the photo grows out of (none when opened from "See all"). */
  source: HTMLElement | null;
  /** Gets focus back when the viewer closes on a photo with no tile. */
  opener: HTMLElement | null;
  /** The grid tile showing a given photo, if there is one. */
  tileFor: (index: number) => HTMLElement | null;
  onClosed: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const chrome = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const [index, setIndex] = useState(start);
  const current = useRef(start);
  const direction = useRef(0);
  const closing = useRef(false);
  const lenis = useLenis();
  const count = photos.length;
  const photo = photos[index];

  // Opening
  useGSAP(() => {
    const d = dialog.current!;
    d.showModal();
    lenis?.stop();
    closeBtn.current?.focus({ preventScroll: true });
    const target = fitted(photos[start]);

    const onResize = () => !closing.current && gsap.set(frame.current, fitted(photos[current.current]));
    window.addEventListener("resize", onResize);

    if (prefersReducedMotion()) {
      gsap.set(frame.current, target);
    } else if (source) {
      source.style.visibility = "hidden";
      gsap
        .timeline({ onComplete: () => void (source.style.visibility = "") })
        .fromTo(backdrop.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" }, 0)
        .fromTo(frame.current, { ...boxOf(source), borderRadius: 28 }, { ...target, borderRadius: 16, duration: 0.85, ease: "expo.out" }, 0)
        .fromTo(chrome.current, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.3);
    } else {
      gsap.set(frame.current, target);
      gsap
        .timeline()
        .fromTo(backdrop.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" }, 0)
        .fromTo(frame.current, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.7, ease: "expo.out" }, 0.05)
        .fromTo(chrome.current, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.3);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      if (source) source.style.visibility = "";
      if (d.open) d.close();
      lenis?.start();
    };
  }, { scope: dialog });

  // Moving to another photo: the frame reshapes and the new photo slides in.
  useGSAP(
    () => {
      current.current = index;
      if (index === start && direction.current === 0) return;
      const reduce = prefersReducedMotion();
      gsap.to(frame.current, { ...fitted(photos[index]), duration: reduce ? 0 : 0.55, ease: "power3.out", overwrite: "auto" });
      if (!reduce) {
        gsap.fromTo(frame.current!.querySelector("img"), { opacity: 0, x: 48 * direction.current }, { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" });
      }
    },
    { dependencies: [index], scope: dialog },
  );

  // Fetch the neighbours ahead of time so arrowing through feels instant.
  useEffect(() => {
    for (const d of [1, -1]) new Image().src = photoFiles[photos[(index + d + count) % count].name].src;
  }, [index, count, photos]);

  const go = (d: number) => {
    if (closing.current) return;
    direction.current = d;
    setIndex((i) => (i + d + count) % count);
  };

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    const tile = tileFor(current.current);
    const finish = () => {
      if (tile) tile.style.visibility = "";
      dialog.current?.close();
      lenis?.start();
      (tile ?? opener)?.focus({ preventScroll: true });
      onClosed();
    };
    if (prefersReducedMotion()) return finish();
    const r = tile?.getBoundingClientRect();
    const tl = gsap
      .timeline({ onComplete: finish })
      .to(chrome.current, { opacity: 0, duration: 0.2 }, 0)
      .to(backdrop.current, { opacity: 0, duration: 0.45, ease: "power2.in" }, 0.15);
    if (tile && r && r.bottom > 0 && r.top < window.innerHeight) {
      tile.style.visibility = "hidden";
      tl.to(frame.current, { left: r.left, top: r.top, width: r.width, height: r.height, borderRadius: 28, duration: 0.6, ease: "power3.inOut" }, 0);
    } else {
      tl.to(frame.current, { opacity: 0, scale: 0.94, duration: 0.35, ease: "power2.in" }, 0);
    }
  };

  // Swipe on touch screens: the photo follows the finger, then moves on or springs back.
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const img = () => frame.current?.querySelector("img") ?? null;
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return;
    swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!swipe.current) return;
    gsap.set(img(), { x: (e.clientX - swipe.current.x) * 0.6 });
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!swipe.current) return;
    const dx = e.clientX - swipe.current.x;
    const dy = e.clientY - swipe.current.y;
    swipe.current = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
    else gsap.to(img(), { x: 0, duration: 0.4, ease: "power3.out" });
  };

  const arrow = "grid size-12 place-items-center rounded-full bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/25";

  return (
    <dialog
      ref={dialog}
      aria-label="Photos"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        else if (e.key === "ArrowLeft") go(-1);
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden bg-transparent p-0 text-white backdrop:bg-transparent"
    >
      <div ref={backdrop} onClick={close} className="absolute inset-0 bg-[#0b1f19]/92 backdrop-blur-md" />

      <div
        ref={frame}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="fixed touch-none overflow-hidden rounded-2xl bg-forest-deep shadow-[0_40px_120px_-20px_rgb(0_0_0/0.6)]"
      >
        <img
          key={photo.name}
          src={photoFiles[photo.name].src}
          alt={photo.alt}
          draggable={false}
          className="size-full object-cover select-none"
          style={{
            objectPosition: photo.focus,
            backgroundImage: `url(${photoFiles[photo.name].blur})`,
            backgroundSize: "cover",
          }}
        />
      </div>

      <div ref={chrome}>
        <p className="fixed top-5 left-5 text-sm font-semibold tracking-wide text-white/70 tabular-nums md:top-7 md:left-8">
          {index + 1} of {count}
        </p>
        <button ref={closeBtn} type="button" onClick={close} aria-label="Close photos" data-pop="1.1" className={`fixed top-3 right-3 md:top-5 md:right-6 ${arrow}`}>
          <Icon name="plus" className="size-5 rotate-45" />
        </button>

        <div className="fixed inset-x-0 bottom-0 flex items-center justify-between gap-4 px-4 pb-6 md:justify-center md:pb-8">
          <button type="button" onClick={() => go(-1)} aria-label="Previous photo" data-pop="1.1" className={`${arrow} md:fixed md:top-1/2 md:left-6 md:-translate-y-1/2`}>
            <Icon name="arrow" className="size-5 rotate-180" />
          </button>
          <p aria-live="polite" className="max-w-xl text-center font-display text-lg leading-snug md:text-xl">
            {photo.caption}
          </p>
          <button type="button" onClick={() => go(1)} aria-label="Next photo" data-pop="1.1" className={`${arrow} md:fixed md:top-1/2 md:right-6 md:-translate-y-1/2`}>
            <Icon name="arrow" className="size-5" />
          </button>
        </div>
      </div>
    </dialog>
  );
}
