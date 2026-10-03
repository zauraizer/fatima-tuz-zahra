import { useEffect, useRef } from "react";
import { privacy, site } from "../content";
import { RichText, T } from "../lib/draft";
import { gsap, prefersReducedMotion } from "../lib/gsap";
import { Icon } from "./Icon";
import { useLenis } from "./SmoothScroll";

/** Native <dialog> (focus trap, Escape, backdrop for free) with a GSAP entrance. */
export function PrivacyDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    const dialog = ref.current!;
    const instant = prefersReducedMotion();
    if (open && !dialog.open) {
      dialog.showModal();
      lenis?.stop();
      // Opacity only: the dialog's close button already has focus and must keep it.
      if (!instant) gsap.fromTo(dialog, { opacity: 0, y: 40, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "expo.out", overwrite: true });
    } else if (!open && dialog.open) {
      const finish = () => {
        dialog.close();
        lenis?.start();
      };
      if (instant) finish();
      else gsap.to(dialog, { opacity: 0, y: 24, scale: 0.98, duration: 0.3, ease: "power2.in", onComplete: finish, overwrite: true });
    }
  }, [open, lenis]);

  // If it ever unmounts while open, don't leave the page locked.
  useEffect(() => {
    const dialog = ref.current!;
    return () => {
      gsap.killTweensOf(dialog);
      if (dialog.open) {
        dialog.close();
        lenis?.start();
      }
    };
  }, [lenis]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="privacy-title"
      data-lenis-prevent
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto max-h-[86svh] w-[min(92vw,680px)] overflow-y-auto overscroll-contain rounded-[2rem] bg-cream p-0 text-ink shadow-pop backdrop:bg-ink/55 backdrop:backdrop-blur-sm"
    >
      <div className="relative p-7 sm:p-10">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close privacy notice"
          className="absolute top-5 right-5 grid size-10 place-items-center rounded-full border border-line bg-white text-forest transition-colors hover:border-forest"
          data-pop="1.1"
        >
          <Icon name="plus" className="size-4 rotate-45" strokeWidth={2.2} />
        </button>
        <p className="eyebrow">Privacy</p>
        <h2 id="privacy-title" className="mt-4 text-[clamp(1.9rem,2vw+1rem,2.6rem)]">
          How {site.name} handles your information
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          Last updated: <T v={privacy.updated} />
        </p>
        <div className="mt-8 space-y-6">
          {privacy.sections.map((s) => (
            <section key={s.title}>
              <h3 className="text-lg">{s.title}</h3>
              <p className="mt-1.5 leading-relaxed text-ink-soft">
                <RichText parts={s.body} />
              </p>
            </section>
          ))}
        </div>
      </div>
    </dialog>
  );
}
