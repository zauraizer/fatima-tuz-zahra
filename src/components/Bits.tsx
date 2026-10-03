import { useState, type ReactNode } from "react";
import type { Text } from "../content";
import { textOf } from "../lib/draft";
import { Icon } from "./Icon";
import { useToast } from "./Toast";

/** Eyebrow + masked-line heading + lead paragraph, wired into the reveal system. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  center = false,
  light = false,
  className = "",
}: {
  eyebrow: string;
  title: string;
  lead?: ReactNode;
  center?: boolean;
  light?: boolean;
  className?: string;
}) {
  return (
    <div className={`${center ? "mx-auto text-center" : ""} max-w-2xl ${className}`}>
      <p data-reveal="fade" className={`eyebrow ${light ? "eyebrow-dark" : ""}`}>
        {eyebrow}
      </p>
      <h2
        data-reveal="lines"
        className={`mt-4 text-[clamp(2.1rem,2.6vw+1rem,3.4rem)] ${center ? "" : "[text-wrap:pretty]"} ${light ? "text-cream" : "text-ink"}`}
      >
        {title}
      </h2>
      {lead && (
        <p data-reveal className={`mt-5 text-lg leading-relaxed ${light ? "text-cream/75" : "text-ink-soft"}`}>
          {lead}
        </p>
      )}
    </div>
  );
}

/** Copies a value to the clipboard with a toast + a check-mark morph. */
export function CopyButton({ value, label, className = "" }: { value: Text; label: string; className?: string }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const text = textOf(value);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    toast(`${label} copied`);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${label}`}
      data-pop="1.08"
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border-[1.5px] px-3.5 py-2 text-[0.8rem] font-semibold transition-colors duration-300 ${
        copied ? "border-forest bg-forest text-white" : "border-line bg-cream text-forest hover:border-forest"
      } ${className}`}
    >
      <Icon name={copied ? "check" : "copy"} className="size-3.5" strokeWidth={2.2} />
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

/** A small decorative 8-point star used as a separator. */
export function StarGlyph({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <g fill="currentColor">
        <rect x="6" y="6" width="12" height="12" rx="1.5" />
        <rect x="6" y="6" width="12" height="12" rx="1.5" transform="rotate(45 12 12)" />
      </g>
    </svg>
  );
}
