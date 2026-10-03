import { site } from "../content";

/** The 8-point star emblem: two rotated squares around a radiant centre ("al-Zahra" — the radiant one). */
export function Emblem({ className = "size-10", light = false }: { className?: string; light?: boolean }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <g className={light ? "fill-cream" : "fill-forest"}>
        <rect x="9" y="9" width="22" height="22" rx="3" />
        <rect x="9" y="9" width="22" height="22" rx="3" transform="rotate(45 20 20)" />
      </g>
      <circle cx="20" cy="20" r="7" className="fill-gold" />
      <circle cx="20" cy="20" r="3" className={light ? "fill-forest-deep" : "fill-cream"} />
    </svg>
  );
}

export function Brand({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return (
    <a
      href="#top"
      data-pop="1.04"
      data-pop-lift="0"
      className={`group inline-flex items-center gap-3 ${light ? "text-cream" : "text-ink"} ${className}`}
      aria-label={`${site.name} ${site.kind}, back to top`}
    >
      <Emblem light={light} className="size-10 shrink-0 transition-transform duration-700 ease-out-expo group-hover:rotate-45" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.2rem] font-semibold tracking-tight">{site.name}</span>
        <span className={`mt-1 text-[0.66rem] font-bold tracking-[0.24em] uppercase ${light ? "text-gold-bright" : "text-gold-ink"}`}>{site.kind}</span>
      </span>
    </a>
  );
}
