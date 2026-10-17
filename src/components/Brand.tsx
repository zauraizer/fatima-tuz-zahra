import { site } from "../content";
import logoUrl from "../assets/brand/logo.webp";
import markUrl from "../assets/brand/logo-mark.webp";

export { logoUrl };

/** The full logo: the Fatima al Zahra calligraphy with Bait ul Khair below it. Gold, so it sits on dark backgrounds. */
export function Logo({ className = "", alt = "Fatima tuz Zahra, Bait ul Khair" }: { className?: string; alt?: string }) {
  return <img src={logoUrl} width={512} height={822} alt={alt} draggable={false} decoding="async" className={className} />;
}

/** The calligraphy alone, for small spaces (header, footer, badges). */
export function LogoMark({ className = "", alt = "" }: { className?: string; alt?: string }) {
  return <img src={markUrl} width={512} height={620} alt={alt} draggable={false} decoding="async" className={className} />;
}

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
      aria-label={`${site.fullName}, back to top`}
    >
      <span
        className={`grid size-11 shrink-0 place-items-center rounded-xl bg-forest-deep shadow-soft transition-transform duration-700 ease-out-expo group-hover:scale-105 ${
          light ? "ring-1 ring-cream/20" : ""
        }`}
      >
        <LogoMark className="h-[2.1rem] w-auto" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.2rem] font-semibold tracking-tight">{site.name}</span>
        <span className={`mt-1 text-[0.66rem] font-bold tracking-[0.24em] uppercase ${light ? "text-gold-bright" : "text-gold-ink"}`}>{site.subtitle}</span>
      </span>
    </a>
  );
}
