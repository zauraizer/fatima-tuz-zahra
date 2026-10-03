import { useRef } from "react";
import { hero, site } from "../content";
import { Lanterns, Magnetic } from "../components/Effects";
import { Icon } from "../components/Icon";
import { RichText } from "../lib/draft";
import { useDonation } from "../lib/donation";
import { gsap, isFinePointer, ScrollTrigger, useGSAP } from "../lib/gsap";
import { useReducedMotion } from "../lib/hooks";
import { finishIntro, introFinished } from "../lib/intro";

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();
  const { prefill } = useDonation();

  useGSAP(
    (_ctx, contextSafe) => {
      if (reduced) return;
      const q = gsap.utils.selector(root);
      let alive = true;

      // Hidden until the intro curtain lifts. The copy uses opacity only (not
      // visibility), so its links stay reachable by keyboard and screen readers.
      gsap.set(title.current, { opacity: 0, y: 34, scale: 0.97, filter: "blur(14px)" });
      gsap.set(q(".hero-fade"), { opacity: 0, y: 26 });
      gsap.set(q(".hero-arch"), { clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(q(".hero-back"), { autoAlpha: 0, scale: 0.92, rotate: -4 });
      gsap.set(q(".hero-ar"), { autoAlpha: 0, y: 18, filter: "blur(8px)" });
      gsap.set(q(".hero-star"), { autoAlpha: 0, scale: 0.6 });
      gsap.set(q(".hero-card"), { autoAlpha: 0, scale: 0.85, y: 24 });
      gsap.set(q(".hero-cue"), { opacity: 0 });

      // Aurora: soft colour fields drifting behind everything, paused while the hero is off screen.
      const aurora = q(".hero-blob").map((blob, i) =>
        gsap.to(blob, {
          xPercent: gsap.utils.random(-28, 28),
          yPercent: gsap.utils.random(-22, 22),
          scale: gsap.utils.random(0.85, 1.25),
          duration: gsap.utils.random(7, 11),
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: i * -2.5,
          paused: true,
        }),
      );
      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => aurora.forEach((t) => (self.isActive ? t.resume() : t.pause())),
      });

      const play = contextSafe!(() => {
        if (!alive) return;
        // The headline is the page's Largest Contentful Paint, so it animates as one
        // element (no text splitting) and starts painting on the very first frame.
        gsap
          .timeline()
          .to(title.current, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 1.5, clearProps: "filter" }, 0)
          .to(q(".hero-fade"), { opacity: 1, y: 0, duration: 1.2, stagger: 0.09 }, 0.3)
          .to(q(".hero-arch"), { clipPath: "inset(0% 0% 0% 0%)", duration: 1.7, ease: "expo.inOut" }, 0)
          .to(q(".hero-back"), { autoAlpha: 1, scale: 1, rotate: 0, duration: 1.6 }, 0.35)
          .to(q(".hero-star"), { autoAlpha: 1, scale: 1, duration: 1.6 }, 0.9)
          .to(q(".hero-ar"), { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: 1.3 }, 1.0)
          .to(q(".hero-card"), { autoAlpha: 1, scale: 1, y: 0, duration: 1.1, ease: "back.out(1.6)", stagger: 0.16 }, 1.15)
          .to(q(".hero-cue"), { opacity: 1, duration: 1 }, 1.6);
      });
      introFinished.then(play);
      // Tabbing into the hero before scrolling should show it straight away.
      root.current!.addEventListener("focusin", finishIntro);

      // Scroll away, Apple-style: the copy recedes (shrinks + fades), the arch sinks and swells.
      const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
      gsap.to(q(".hero-copy"), { y: -70, scale: 0.9, opacity: 0, transformOrigin: "0% 50%", ease: "none", scrollTrigger: st });
      gsap.to(q(".hero-art"), { y: 120, scale: 1.08, ease: "none", scrollTrigger: st });
      gsap.to(q(".hero-pattern"), { yPercent: 18, ease: "none", scrollTrigger: st });
      gsap.to(q(".hero-cue-wrap"), { opacity: 0, ease: "none", scrollTrigger: { ...st, end: "20% top" } });

      // Pointer parallax: each layer drifts by its data-depth.
      if (isFinePointer()) {
        const layers = q("[data-depth]").map((el) => ({
          depth: Number((el as HTMLElement).dataset.depth),
          x: gsap.quickTo(el, "x", { duration: 1.1, ease: "power3" }),
          y: gsap.quickTo(el, "y", { duration: 1.1, ease: "power3" }),
        }));
        const onMove = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          for (const l of layers) {
            l.x(nx * 28 * l.depth);
            l.y(ny * 22 * l.depth);
          }
        };
        root.current!.addEventListener("pointermove", onMove);
        return () => {
          alive = false;
          root.current?.removeEventListener("pointermove", onMove);
          root.current?.removeEventListener("focusin", finishIntro);
        };
      }
      return () => {
        alive = false;
        root.current?.removeEventListener("focusin", finishIntro);
      };
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  );

  return (
    <section ref={root} className="relative overflow-hidden pt-32 pb-24 md:pt-40 lg:flex lg:min-h-svh lg:items-center lg:pb-28">
      {/* Aurora — drifting colour fields */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="hero-blob absolute -top-[12%] right-[2%] size-[max(44vw,340px)] max-h-[680px] max-w-[680px] rounded-full bg-[#f6d48f] opacity-60 blur-[90px]" />
        <div className="hero-blob absolute top-[38%] -left-[12%] size-[max(36vw,300px)] max-h-[560px] max-w-[560px] rounded-full bg-[#bfe2cf] opacity-70 blur-[90px]" />
        <div className="hero-blob absolute right-[26%] -bottom-[18%] size-[max(30vw,260px)] max-h-[480px] max-w-[480px] rounded-full bg-[#f4bea8] opacity-50 blur-[100px]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-[1240px] items-center gap-16 px-5 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
        <div className="hero-copy">
          <p className="hero-fade eyebrow">
            <span>
              <RichText parts={hero.eyebrow} />
            </span>
          </p>
          <h1 ref={title} className="mt-6 text-[clamp(2.8rem,4.6vw+1.2rem,5.3rem)] leading-[1.03] font-semibold tracking-[-0.02em]">
            {hero.title} <span className="text-shimmer">{hero.titleAccent}</span>
          </h1>
          <p className="hero-fade mt-7 max-w-[33rem] text-lg leading-relaxed text-ink-soft md:text-xl">{hero.lead}</p>
          <div className="hero-fade mt-10 flex flex-wrap gap-3">
            <Magnetic>
              <a href="#sponsor" className="btn btn-primary group">
                Sponsor a child
                <Icon name="arrow" className="size-4 transition-transform duration-500 group-hover:translate-x-1" strokeWidth={2.2} />
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="#donate"
                onClick={(e) => {
                  e.preventDefault();
                  prefill({ frequency: "once" });
                }}
                className="btn btn-ghost"
              >
                Give once
              </a>
            </Magnetic>
          </div>
          <ul className="hero-fade mt-9 flex flex-wrap gap-x-6 gap-y-2 text-[0.92rem] font-medium text-ink-soft" aria-label="Ways to give">
            {hero.assurances.map((a) => (
              <li key={a} data-pop="1.06" className="inline-flex items-center gap-1.5">
                <Icon name="check" className="size-4 text-forest" strokeWidth={2.6} />
                {a}
              </li>
            ))}
          </ul>
        </div>

        <div className="hero-art relative mx-auto aspect-[4/5] w-full max-w-[min(460px,82vw)]" aria-hidden="true">
          <div data-depth="0.35" className="hero-back arch absolute top-[6%] right-[-6%] bottom-[-4%] left-[10%] border border-line bg-sand" />

          <div data-depth="0.7" className="hero-arch arch absolute top-0 right-[6%] bottom-0 left-0 overflow-hidden bg-forest shadow-lift">
            <div className="hero-pattern bg-stars absolute -inset-[20%] opacity-[0.2]" />
            <div className="absolute top-[34%] left-1/2 aspect-square w-[115%] -translate-1/2 bg-[radial-gradient(closest-side,rgb(214_164_78/0.5),rgb(200_147_58/0.12)_55%,transparent)]" />
            <Lanterns className="absolute inset-0 size-full" />
            <div className="hero-star absolute top-[34%] left-1/2 w-[46%] -translate-1/2">
              <svg viewBox="0 0 120 120" className="w-full animate-spin-slow">
                <g fill="none" stroke="var(--color-gold-soft)" strokeWidth="1.6">
                  <rect x="27" y="27" width="66" height="66" rx="6" />
                  <rect x="27" y="27" width="66" height="66" rx="6" transform="rotate(45 60 60)" />
                  <circle cx="60" cy="60" r="22" />
                </g>
                <circle cx="60" cy="60" r="9" fill="var(--color-gold)" />
              </svg>
            </div>
            <div className="arch absolute inset-3.5 border-[1.5px] border-gold/70" />
            <div className="hero-ar absolute inset-x-0 bottom-[14%] px-6 text-center">
              <p lang="ar" dir="rtl" className="text-[clamp(2.5rem,5vw,3.6rem)] leading-normal text-cream">
                {site.nameArabic}
              </p>
              <p className="mt-1 text-[0.72rem] font-semibold tracking-[0.3em] text-gold-soft uppercase">{site.name}</p>
            </div>
          </div>

          <div data-depth="1.4" className="absolute top-[52%] left-[-8%] z-10">
            <div className="hero-card" data-pop="1.07">
              <div className="animate-bob flex items-center gap-3 rounded-2xl bg-white py-2.5 pr-4 pl-2.5 text-sm font-semibold whitespace-nowrap shadow-lift">
                <span className="grid size-9 place-items-center rounded-xl bg-forest-soft text-forest">
                  <Icon name="home" className="size-5" />
                </span>
                {hero.cards[0]}
              </div>
            </div>
          </div>
          <div data-depth="1.9" className="absolute right-[-4%] bottom-[-3%] z-10">
            <div className="hero-card" data-pop="1.07">
              <div className="animate-bob flex items-center gap-3 rounded-2xl bg-white py-2.5 pr-4 pl-2.5 text-sm font-semibold whitespace-nowrap shadow-lift [animation-delay:-3s]">
                <span className="grid size-9 place-items-center rounded-xl bg-gold-soft text-gold-deep">
                  <Icon name="school" className="size-5" />
                </span>
                {hero.cards[1]}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-cue-wrap absolute bottom-7 left-1/2 hidden -translate-x-1/2 lg:block">
        <a href="#about" className="hero-cue flex flex-col items-center gap-2 text-[0.7rem] font-bold tracking-[0.2em] text-ink-soft uppercase">
          <span className="relative flex h-9 w-5.5 justify-center rounded-full border-[1.5px] border-ink-soft/50 pt-1.5">
            <span className="block size-1.5 animate-scroll-dot rounded-full bg-gold" />
          </span>
          Scroll
        </a>
      </div>
    </section>
  );
}
