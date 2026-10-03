import { useState } from "react";
import { marquee, stats } from "../content";
import { StarGlyph } from "../components/Bits";
import { Icon, type IconName } from "../components/Icon";
import { SpotlightCard } from "./Care";
import { Counter, Marquee } from "../components/Effects";
import { DraftNum } from "../lib/draft";
import { useReducedMotion } from "../lib/hooks";

const STAT_ICONS: IconName[] = ["users", "clock", "school", "meal"];

/** Glass tiles on deep green; numbers count up in gold gradient. */
export function Stats() {
  return (
    <section aria-label="Our work in numbers" className="relative overflow-hidden bg-forest-deep py-16 text-cream md:py-20">
      <div className="bg-stars-light absolute inset-0 opacity-[0.04]" />
      <div className="pointer-events-none absolute -top-40 left-1/4 size-[36rem] rounded-full bg-[radial-gradient(closest-side,rgb(232_176_74/0.18),transparent)]" />
      <div className="pointer-events-none absolute -right-40 -bottom-56 size-[40rem] rounded-full bg-[radial-gradient(closest-side,rgb(42_122_93/0.45),transparent)]" />
      <ul className="relative mx-auto grid max-w-[1240px] gap-4 px-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <li key={s.label} data-reveal>
            <SpotlightCard
              data-pop
              className="h-full rounded-[1.75rem] border border-cream/10 bg-cream/[0.045] p-7 transition-[border-color,background-color] duration-500 hover:border-gold-bright/40 hover:bg-cream/[0.07]"
            >
              <span data-pop-icon className="relative grid size-11 place-items-center rounded-2xl bg-gold-bright/15 text-gold-bright">
                <Icon name={STAT_ICONS[i % STAT_ICONS.length]} className="size-5.5" strokeWidth={1.9} />
              </span>
              <p className="text-gold-gradient relative mt-8 font-display text-[clamp(2.8rem,3.4vw+1rem,4.2rem)] leading-none font-semibold">
                <DraftNum n={s.n}>
                  <Counter value={s.n.value} suffix={s.suffix} />
                </DraftNum>
              </p>
              <p className="relative mt-3 text-cream/80">{s.label}</p>
            </SpotlightCard>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Two counter-running tickers of our values; they accelerate with scroll and reverse on the way back up. */
export function ValuesMarquee() {
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const row = (outline: boolean) =>
    marquee.map((word) => (
      <span key={word} className="flex items-center">
        <span
          className={`px-6 font-display text-[clamp(2.6rem,5vw+1rem,5.5rem)] leading-[1.15] font-medium italic md:px-10 ${
            outline ? "text-transparent [-webkit-text-stroke:1.2px_var(--color-gold)]" : "text-ink"
          }`}
        >
          {word}
        </span>
        <StarGlyph className={`size-6 shrink-0 md:size-8 ${outline ? "text-forest/30" : "text-gold"}`} />
      </span>
    ));

  return (
    <section aria-label="Our values" className="relative overflow-hidden border-b border-line bg-cream py-10 md:py-14">
      <Marquee paused={paused}>{row(false)}</Marquee>
      <Marquee paused={paused} reverse className="mt-1 md:mt-2">
        {row(true)}
      </Marquee>
      {/* Anything that moves on its own needs a way to stop it. */}
      {!reduced && (
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Play the moving words" : "Pause the moving words"}
          data-pop="1.1"
          className="absolute top-1 right-3 z-10 grid size-9 place-items-center rounded-full border border-line bg-cream/90 text-forest transition-colors hover:border-forest md:top-3 md:right-5"
        >
          <Icon name={paused ? "play" : "pause"} className="size-4" strokeWidth={2.2} />
        </button>
      )}
    </section>
  );
}
