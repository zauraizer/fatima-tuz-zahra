import { useMemo, useRef } from "react";
import { day } from "../content";
import { SectionHeading } from "../components/Bits";
import { gsap, useGSAP } from "../lib/gsap";
import { useMedia, useReducedMotion } from "../lib/hooks";

/*
  "A day at Fatima tuz Zahra": a pinned scene scrubbed by scroll.
  The sun climbs and sets across the sky, the sky shifts dawn → night,
  the house windows light up at dusk, stars and the crescent come out,
  while the six moments of the day cross-fade in the card.
  With reduced motion it's a plain list instead.
*/

type Phase = {
  top: string;
  bottom: string;
  horizon: string;
  sun: string;
  p: number;
  sunAlpha: number;
  clouds: number;
  stars: number;
  moon: number;
  windows: number;
};

const PHASES: Phase[] = [
  { top: "#e7a78b", bottom: "#fde3c2", horizon: "rgba(255,186,128,0.6)", sun: "#f59a5a", p: 0.07, sunAlpha: 1, clouds: 0.5, stars: 0.12, moon: 0, windows: 0.35 }, // dawn
  { top: "#86bcd3", bottom: "#eef6f1", horizon: "rgba(255,255,255,0.25)", sun: "#fcd56b", p: 0.48, sunAlpha: 1, clouds: 0.9, stars: 0, moon: 0, windows: 0 }, // midday
  { top: "#9cc7cd", bottom: "#f7efd8", horizon: "rgba(255,226,170,0.35)", sun: "#f9c95a", p: 0.63, sunAlpha: 1, clouds: 0.75, stars: 0, moon: 0, windows: 0 }, // afternoon
  { top: "#e3ad6c", bottom: "#fbdfab", horizon: "rgba(255,180,100,0.55)", sun: "#f6a14a", p: 0.8, sunAlpha: 1, clouds: 0.5, stars: 0, moon: 0, windows: 0.12 }, // late afternoon
  { top: "#4d3f6d", bottom: "#ea8b60", horizon: "rgba(255,130,85,0.7)", sun: "#ef6c43", p: 0.95, sunAlpha: 1, clouds: 0.22, stars: 0.35, moon: 0.25, windows: 0.9 }, // evening
  { top: "#0b1c29", bottom: "#1c3947", horizon: "rgba(90,150,180,0.18)", sun: "#ef6c43", p: 1.06, sunAlpha: 0, clouds: 0, stars: 1, moon: 1, windows: 1 }, // night
];


export function DayCycle() {
  return useReducedMotion() ? <DayList /> : <DayScene />;
}

function DayScene() {
  const section = useRef<HTMLElement>(null);
  const desktop = useMedia("(min-width: 1024px)");
  const steps = day.steps;

  // Deterministic star field.
  const stars = useMemo(() => {
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    return Array.from({ length: 70 }, () => ({
      left: rand() * 100,
      top: rand() * 62,
      size: 1 + rand() * 2.2,
      delay: rand() * -3.2,
    }));
  }, []);

  useGSAP(
    () => {
      const q = gsap.utils.selector(section);
      const scene = q(".day-scene")[0] as HTMLElement;
      const ground = q(".day-ground")[0] as HTMLElement;
      const sky = q(".day-sky")[0] as HTMLElement;
      const sun = q(".day-sun")[0] as HTMLElement;
      const moon = q(".day-moon")[0] as HTMLElement;
      const starsEl = q(".day-stars")[0] as HTMLElement;
      const clouds = q(".day-clouds")[0] as HTMLElement;
      const glow = q(".day-glow")[0] as unknown as SVGGElement;
      const bar = q(".day-bar")[0] as HTMLElement;
      const counter = q(".day-count")[0] as HTMLElement;
      const dots = q(".day-dot") as HTMLElement[];
      const stepEls = q(".day-step") as HTMLElement[];

      const state: Phase = { ...PHASES[0] };
      const dims = { w: 0, h: 0, horizon: 0 };
      let lastIdx = -1;
      // Assigned below; ScrollTrigger can call render() during its first refresh, before that.
      let tl: gsap.core.Timeline | undefined;

      const render = () => {
        sky.style.setProperty("--sky-top", state.top);
        sky.style.setProperty("--sky-bottom", state.bottom);
        sky.style.setProperty("--horizon", state.horizon);
        // On desktop the card covers the left side, so the sun travels across the open right side.
        const x = dims.w * (desktop ? 0.4 + state.p * 0.56 : 0.08 + state.p * 0.84);
        const y = dims.horizon - Math.sin(Math.PI * state.p) * dims.horizon * 0.74;
        sun.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        sun.style.opacity = String(state.sunAlpha);
        sun.style.setProperty("--sun", state.sun);
        clouds.style.opacity = String(state.clouds);
        starsEl.style.opacity = String(state.stars);
        moon.style.opacity = String(state.moon);
        moon.style.transform = `translateY(${(1 - state.moon) * 50}px)`;
        glow.style.opacity = String(state.windows);

        const t = tl?.time() ?? 0;
        let idx = 0;
        for (let i = 1; i < steps.length; i++) if (t >= i - 1 + 0.7) idx = i;
        if (idx !== lastIdx) {
          lastIdx = idx;
          counter.textContent = `${idx + 1} of ${steps.length}`;
          dots.forEach((d, i) => d.toggleAttribute("data-on", i <= idx));
        }
        bar.style.transform = `scaleX(${tl?.progress() ?? 0})`;
      };

      const measure = () => {
        const r = scene.getBoundingClientRect();
        dims.w = r.width;
        dims.h = r.height;
        dims.horizon = r.height - ground.getBoundingClientRect().height * 0.3;
        render();
      };

      gsap.set(stepEls.slice(1), { autoAlpha: 0, y: 28 });

      tl = gsap.timeline({
        onUpdate: render,
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: () => `+=${window.innerHeight * 4.4}`,
          pin: true,
          scrub: 0.9,
          invalidateOnRefresh: true,
          onRefresh: measure,
        },
      });

      for (let i = 1; i < steps.length; i++) {
        const at = i - 1;
        const { top, bottom, horizon, sun: sunColor, p, sunAlpha, clouds: c, stars: s, moon: m, windows } = PHASES[i];
        tl.to(state, { top, bottom, horizon, sun: sunColor, p, sunAlpha, clouds: c, stars: s, moon: m, windows, duration: 1, ease: "sine.inOut" }, at + 0.3);
        tl.to(stepEls[i - 1], { autoAlpha: 0, y: -28, duration: 0.28, ease: "power2.in" }, at + 0.55);
        tl.to(stepEls[i], { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" }, at + 0.85);
      }
      tl.to({}, { duration: 0.6 });

      measure();
    },
    { scope: section, dependencies: [desktop], revertOnUpdate: true },
  );

  return (
    // Stable wrapper: GSAP moves the pinned <section> into a pin-spacer, so React only ever touches this div.
    <div>
      <section ref={section} id="day" className="relative h-svh overflow-hidden outline-none">
        {/* Screen readers get the whole day at once */}
        <div className="sr-only">
          <h2>{day.title}</h2>
          <ol>
            {steps.map((s) => (
              <li key={s.title}>
                {s.time}: {s.title}. {s.body}
              </li>
            ))}
          </ol>
        </div>

        <div className="flex h-full flex-col lg:block" aria-hidden="true">
          {/* ---------- Scene ---------- */}
          <div className="day-scene relative min-h-0 flex-1 overflow-hidden lg:absolute lg:inset-0">
            <div
              className="day-sky absolute inset-0"
              style={{
                background:
                  "radial-gradient(120% 60% at 50% 100%, var(--horizon) 0%, transparent 60%), linear-gradient(to bottom, var(--sky-top), var(--sky-bottom))",
              }}
            />

            <div className="day-stars absolute inset-0">
              {stars.map((s, i) => (
                <span
                  key={i}
                  className="absolute animate-twinkle rounded-full bg-white"
                  style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s` }}
                />
              ))}
            </div>

            <div className="day-moon absolute top-[13%] right-[12%] lg:right-[16%]">
              <div className="size-14 rounded-full shadow-[inset_-15px_8px_0_0_var(--color-gold-soft)] [filter:drop-shadow(0_0_18px_rgb(246_231_200/0.5))] md:size-16" />
            </div>

            <div className="day-sun absolute top-0 left-0" style={{ "--sun": PHASES[0].sun } as React.CSSProperties}>
              <div className="absolute size-72 -translate-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--sun)_55%,transparent),transparent)]" />
              <div className="absolute size-20 -translate-1/2 rounded-full bg-[var(--sun)] shadow-[0_0_60px_10px_color-mix(in_srgb,var(--sun)_60%,transparent)] md:size-24" />
            </div>

            <div className="day-clouds pointer-events-none absolute inset-x-0 top-[8%] h-1/2">
              <div className="absolute top-[10%] left-[8%] h-10 w-48 animate-[cloud_70s_linear_infinite] rounded-full bg-white/80 blur-md" />
              <div className="absolute top-[28%] left-[55%] h-8 w-36 animate-[cloud_90s_linear_infinite] rounded-full bg-white/70 blur-md [animation-delay:-30s]" />
              <div className="absolute top-[4%] left-[78%] h-12 w-56 animate-[cloud_110s_linear_infinite] rounded-full bg-white/60 blur-lg [animation-delay:-60s]" />
            </div>

            {/* Ground + the home */}
            <svg
              className="day-ground absolute inset-x-0 bottom-0 h-[42%] w-full lg:h-[38%]"
              viewBox="0 0 1200 300"
              preserveAspectRatio="xMidYMax slice"
            >
              <path d="M0 218 Q 200 150 420 196 T 820 186 T 1200 200 V300 H0Z" fill="#1f5a46" opacity="0.55" />
              <g transform={desktop ? "translate(150 0)" : undefined}>
                {/* trees */}
                <rect x="406" y="150" width="9" height="62" fill="#143d30" />
                <circle cx="410" cy="138" r="34" fill="#1f5a46" />
                <circle cx="388" cy="160" r="22" fill="#1f5a46" />
                <circle cx="434" cy="157" r="24" fill="#1f5a46" />
                <rect x="796" y="168" width="7" height="44" fill="#143d30" />
                <circle cx="800" cy="160" r="24" fill="#1f5a46" />
                {/* house */}
                <g fill="#17463a">
                  <rect x="470" y="110" width="260" height="102" />
                  <rect x="460" y="100" width="280" height="14" rx="3" />
                  <path d="M560 212 V84 A40 40 0 0 1 640 84 V212 Z" />
                </g>
                <g fill="#0d2a21">
                  {WINDOWS.map((d, i) => (
                    <path key={i} d={d} />
                  ))}
                </g>
                <g className="day-glow" fill="#f8cf6a" style={{ filter: "drop-shadow(0 0 7px rgba(248,207,106,0.9))" }}>
                  {WINDOWS.map((d, i) => (
                    <path key={i} d={d} />
                  ))}
                </g>
              </g>
              <path d="M0 210 Q 600 194 1200 210 V300 H0Z" fill="#143d30" />
            </svg>
          </div>

          {/* ---------- Card ---------- */}
          <div className="relative z-10 border-t border-line bg-cream px-5 pt-6 pb-22 lg:absolute lg:inset-y-0 lg:left-0 lg:flex lg:w-[min(46%,560px)] lg:items-center lg:border-0 lg:bg-transparent lg:p-0 lg:pl-[max(1.25rem,calc((100vw-1240px)/2+1.25rem))]">
            <div className="w-full lg:rounded-[2rem] lg:border lg:border-white/60 lg:bg-white/72 lg:p-10 lg:shadow-lift lg:backdrop-blur-xl">
              <p className="eyebrow">{day.eyebrow}</p>
              <p className="mt-3 font-display text-[clamp(1.7rem,2vw+1rem,2.6rem)] leading-tight font-semibold">{day.title}</p>
              <div className="relative mt-6 h-[8.5rem] lg:mt-8 lg:h-[9.5rem]">
                {steps.map((s) => (
                  <div key={s.title} className="day-step absolute inset-0">
                    <p className="text-[0.75rem] font-bold tracking-[0.16em] text-gold-ink uppercase">{s.time}</p>
                    <p className="mt-1.5 font-display text-2xl font-semibold">{s.title}</p>
                    <p className="mt-2 leading-relaxed text-ink-soft">{s.body}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-4">
                <span className="day-count font-display text-sm font-semibold tabular-nums">
                  1 of {steps.length}
                </span>
                <div className="flex gap-1.5">
                  {steps.map((s, i) => (
                    <span
                      key={s.title}
                      data-on={i === 0 ? "" : undefined}
                      className="day-dot h-1.5 w-1.5 rounded-full bg-line transition-all duration-500 data-[on]:w-5 data-[on]:bg-gold"
                    />
                  ))}
                </div>
              </div>
              <div className="mt-5 h-[2px] overflow-hidden rounded-full bg-line">
                <div className="day-bar h-full origin-left scale-x-0 bg-forest" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const arched = (x: number, y: number, w: number, h: number) =>
  `M${x} ${y + h} V${y + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2} V${y + h} Z`;

const WINDOWS = [
  arched(490, 126, 22, 32),
  arched(526, 126, 22, 32),
  arched(652, 126, 22, 32),
  arched(688, 126, 22, 32),
  arched(490, 168, 22, 30),
  arched(526, 168, 22, 30),
  arched(652, 168, 22, 30),
  arched(688, 168, 22, 30),
  arched(589, 98, 22, 34),
  arched(582, 158, 36, 54),
];

/** Reduced-motion version: the same day, as a calm list. */
function DayList() {
  return (
    <section id="day" className="py-28 outline-none md:py-36">
      <div className="mx-auto max-w-[1240px] px-5">
        <SectionHeading eyebrow={day.eyebrow} title={day.title} lead={day.lead} center />
        <ol className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {day.steps.map((s, i) => (
            <li key={s.title} className="relative pl-14">
              <span className="absolute top-0 left-0 grid size-9 place-items-center rounded-full border-2 border-gold bg-gold-soft text-sm font-bold text-forest-deep">
                {i + 1}
              </span>
              <p className="text-[0.75rem] font-bold tracking-[0.16em] text-gold-ink uppercase">{s.time}</p>
              <h3 className="mt-1 text-xl">{s.title}</h3>
              <p className="mt-1.5 text-ink-soft">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
