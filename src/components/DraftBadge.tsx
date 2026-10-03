import { useEffect, useRef, useState } from "react";
import { site } from "../content";
import { Icon } from "./Icon";
import { scrollToTarget, useLenis } from "./SmoothScroll";

/*
  Draft-mode helper (only while site.draftMode is true):
  counts the placeholders still on the page, jumps between them, and can
  temporarily hide the highlights to preview the page as it'll look live.
*/
export function DraftBadge() {
  const [count, setCount] = useState(0);
  const [preview, setPreview] = useState(false);
  const index = useRef(0);
  const lenis = useLenis();

  useEffect(() => {
    const recount = () => setCount(document.querySelectorAll("[data-todo]").length);
    recount();
    const timer = window.setTimeout(recount, 1500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!site.draftMode) return;
    if (preview) document.documentElement.removeAttribute("data-draft");
    else document.documentElement.setAttribute("data-draft", "");
  }, [preview]);

  const next = () => {
    const all = Array.from(document.querySelectorAll<HTMLElement>("[data-todo]")).filter(
      (el) => !el.closest("#mobile-menu, [aria-hidden='true']"),
    );
    if (!all.length) return;
    const el = all[index.current % all.length];
    index.current++;

    // Open a collapsed panel (FAQ, bank details…) if the placeholder is inside one.
    const collapsed = el.closest<HTMLElement>("[data-collapsible='closed']");
    const opener = collapsed && document.querySelector<HTMLElement>(`[aria-controls="${collapsed.id}"]`);
    opener?.click();

    window.setTimeout(
      () => {
        const top = el.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2;
        scrollToTarget(lenis, Math.max(0, top));
        el.classList.add("is-flash");
        window.setTimeout(() => el.classList.remove("is-flash"), 1400);
      },
      opener ? 450 : 0,
    );
  };

  if (!site.draftMode || !count) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[80] flex items-center gap-1 rounded-full bg-ink p-1 pl-4 text-[0.82rem] font-semibold text-cream shadow-lift">
      <span className="size-2 rounded-full bg-gold shadow-[0_0_0_4px_rgb(200_147_58/0.3)]" aria-hidden="true" />
      <span className="ml-1.5 mr-2">
        Draft · {count} to fill in
      </span>
      <button
        type="button"
        onClick={next}
        className="inline-flex items-center gap-1 rounded-full bg-cream/10 px-3 py-1.5 transition-colors hover:bg-cream/20"
      >
        Next <Icon name="arrow" className="size-3.5" strokeWidth={2.2} />
      </button>
      <button
        type="button"
        onClick={() => setPreview((p) => !p)}
        aria-pressed={preview}
        className={`rounded-full px-3 py-1.5 transition-colors ${preview ? "bg-gold text-ink" : "bg-cream/10 hover:bg-cream/20"}`}
      >
        {preview ? "Show highlights" : "Preview"}
      </button>
    </div>
  );
}
