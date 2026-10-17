import { useEffect, useRef, useState } from "react";
import { contact, donateUrl, give, isTaxExempt, links, phoneHref, sponsorship, taxExempt, type Designation } from "../content";
import { SectionHeading } from "../components/Bits";
import { Collapsible } from "../components/Collapsible";
import { Magnetic } from "../components/Effects";
import { Icon } from "../components/Icon";
import { useToast } from "../components/Toast";
import { useDonation } from "../lib/donation";
import { DraftNum, linkMissing, T, textOf } from "../lib/draft";
import { usd, usdWhole } from "../lib/format";
import { gsap, prefersReducedMotion, useGSAP } from "../lib/gsap";

/** Largest gift the form accepts in one go; bigger gifts are better arranged with us directly. */
const MAX_GIFT = 100_000;

/** Reads the "Other" box: digits with up to two decimals. A comma counts as the decimal point. */
function parseAmount(raw: string): { text: string; amount: number; error: string } {
  const text = raw.replace(",", ".").replace(/[^0-9.]/g, "");
  if (text === "") return { text, amount: 0, error: "" };
  if (!/^\d*\.?\d{0,2}$/.test(text)) return { text, amount: 0, error: "Please enter an amount like 40 or 40.50" };
  const amount = Number(text);
  if (!Number.isFinite(amount) || amount < 1) return { text, amount: 0, error: "The smallest gift we can take online is $1" };
  if (amount > MAX_GIFT) return { text, amount: 0, error: `For gifts over ${usdWhole(MAX_GIFT)}, please contact us and we'll help you give` };
  return { text, amount: Math.round(amount * 100) / 100, error: "" };
}

/* ===================================================================
   Sponsorship — how it works, with a line that draws as you scroll
   =================================================================== */
export function Sponsorship() {
  const root = useRef<HTMLElement>(null);
  const { prefill } = useDonation();

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      gsap.set(q(".sp-line"), { strokeDasharray: 1, strokeDashoffset: 1 });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: q(".sp-steps")[0], start: "top 72%", end: "bottom 55%", scrub: 0.8 },
      });
      tl.to(q(".sp-line"), { strokeDashoffset: 0, duration: 1, ease: "none" }, 0);
      q(".sp-node").forEach((node, i) => {
        tl.to(node, { backgroundColor: "#c8933a", borderColor: "#c8933a", color: "#ffffff", scale: 1.08, duration: 0.1, ease: "power2.out" }, i * 0.47);
      });
    },
    { scope: root },
  );

  const monthly = sponsorship.monthly;
  return (
    <section ref={root} id="sponsor" className="relative py-28 outline-none md:py-36">
      <div className="mx-auto max-w-[1240px] px-5">
        <SectionHeading
          eyebrow={sponsorship.eyebrow}
          title={sponsorship.title}
          center
          lead={
            <>
              For <DraftNum n={monthly}>{usd(monthly.value)}</DraftNum> a month, you cover everything one child needs, and you get to watch them grow.
            </>
          }
        />

        <div className="sp-steps relative mx-auto mt-20 grid max-w-5xl gap-12 md:grid-cols-3 md:gap-8">
          <svg className="absolute top-11 left-[16.66%] hidden h-1 w-[66.68%] md:block" viewBox="0 0 100 2" preserveAspectRatio="none" aria-hidden="true">
            <line x1="0" y1="1" x2="100" y2="1" stroke="var(--color-line)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <line className="sp-line" x1="0" y1="1" x2="100" y2="1" pathLength={1} stroke="var(--color-gold)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </svg>
          <svg className="absolute top-11 bottom-11 left-11 w-1 md:hidden" viewBox="0 0 2 100" preserveAspectRatio="none" aria-hidden="true">
            <line x1="1" y1="0" x2="1" y2="100" stroke="var(--color-line)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <line className="sp-line" x1="1" y1="0" x2="1" y2="100" pathLength={1} stroke="var(--color-gold)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </svg>

          {sponsorship.steps.map((s, i) => (
            <div key={s.title} className="relative flex items-start gap-6 md:flex-col md:items-center md:text-center">
              <span className="sp-node relative z-10 grid size-22 shrink-0 place-items-center rounded-full border-2 border-line bg-cream font-display text-3xl font-semibold text-forest">
                {i + 1}
              </span>
              <div data-reveal className="pt-4 md:pt-0">
                <h3 className="text-xl md:mt-6">{s.title}</h3>
                <p className="mt-2 leading-relaxed text-ink-soft md:mx-auto md:max-w-[19rem]">{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div data-reveal className="mt-16 text-center">
          <Magnetic>
            <button
              type="button"
              onClick={() => prefill({ frequency: "monthly", amount: monthly.value, designation: "Sponsorship" })}
              className="btn btn-primary group min-h-14 px-8 text-lg"
            >
              Become a sponsor<span className="hidden sm:inline">&nbsp;for {usd(monthly.value)} a month</span>
              <Icon name="arrow" className="size-5 transition-transform duration-500 group-hover:translate-x-1" />
            </button>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}

/* ===================================================================
   Donate — the giving widget and other ways to give
   =================================================================== */
export function Donate() {
  return (
    <section id="donate" className="relative bg-sand py-28 outline-none md:py-36">
      <div className="mx-auto grid max-w-[1240px] items-start gap-14 px-5 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
        <div className="lg:sticky lg:top-28">
          <SectionHeading eyebrow={give.eyebrow} title={give.title} lead={give.lead} />
          <ul className="mt-8 space-y-3">
            {give.trust.map((t) => (
              <li key={t.text} data-reveal data-pop="1.04" className="flex w-fit items-center gap-3 font-medium">
                <Icon data-pop-icon name={t.icon} className="size-5 text-forest" />
                {t.text}
              </li>
            ))}
          </ul>
          <p data-reveal className="mt-6 text-sm leading-relaxed text-ink-soft">
            {isTaxExempt ? `${taxExempt.note} EIN ${taxExempt.ein}.` : taxExempt.pending}
          </p>

          <div data-reveal className="mt-10">
            <p className="eyebrow">Other ways to give</p>
            <div className="mt-3 border-t border-line">
              <Collapsible title="Bank transfer" icon="bank">
                <p className="text-ink-soft">{give.bankTransfer}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a href={phoneHref} className="btn btn-ghost min-h-11 px-5 text-sm">
                    <Icon name="phone" className="size-4" /> {contact.phone}
                  </a>
                  <a href="#contact" className="btn btn-ghost min-h-11 px-5 text-sm">
                    <Icon name="mail" className="size-4" /> Send a message
                  </a>
                </div>
              </Collapsible>
            </div>
          </div>
        </div>

        <DonateWidget />
      </div>
    </section>
  );
}

function DonateWidget() {
  const d = useDonation();
  const toast = useToast();
  const root = useRef<HTMLDivElement>(null);
  const [custom, setCustom] = useState("");
  const [amountError, setAmountError] = useState("");
  const isPreset = custom === "" && give.presets.includes(d.amount);

  // When another section pre-fills the widget, mirror a non-preset amount into the "Other" field.
  useEffect(() => {
    if (!d.pulse) return;
    setCustom(give.presets.includes(d.amount) || d.amount <= 0 ? "" : String(d.amount));
    setAmountError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d.pulse]);

  useGSAP(
    () => {
      if (!d.pulse) return;
      gsap.fromTo(
        root.current,
        { boxShadow: "0 0 0 0px rgba(200,147,58,0.6), 0 24px 48px rgba(27,42,36,0.14)" },
        { boxShadow: "0 0 0 26px rgba(200,147,58,0), 0 24px 48px rgba(27,42,36,0.14)", duration: 1.4, ease: "power2.out", delay: 0.9, repeat: 1 },
      );
    },
    { dependencies: [d.pulse], revertOnUpdate: true },
  );

  const submit = () => {
    if (d.amount <= 0) return toast("Choose an amount first");
    if (linkMissing(links.donate)) return toast("Donation page not connected yet. Add links.donate in src/content.ts");
    window.open(donateUrl(textOf(links.donate), d), "_blank", "noopener,noreferrer");
  };

  return (
    <div ref={root} id="donate-widget" data-reveal className="card relative overflow-hidden p-7 shadow-lift outline-none sm:p-10">
      <div className="bg-stars pointer-events-none absolute -top-28 -right-28 size-72 opacity-[0.14] [mask-image:radial-gradient(closest-side,#000,transparent)]" />

      <p className="relative font-display text-2xl font-semibold">Make a gift</p>

      {/* Frequency */}
      <div role="group" aria-label="How often" className="relative mt-7 grid grid-cols-2 rounded-full bg-sand p-1.5">
        <span
          aria-hidden="true"
          className={`absolute inset-y-1.5 left-1.5 w-[calc(50%-0.375rem)] rounded-full bg-forest shadow-soft transition-transform duration-500 ease-out-expo ${
            d.frequency === "once" ? "translate-x-full" : ""
          }`}
        />
        {(["monthly", "once"] as const).map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={d.frequency === f}
            onClick={() => d.update({ frequency: f })}
            className={`relative z-10 rounded-full py-3 text-[0.95rem] font-semibold transition-colors duration-300 ${
              d.frequency === f ? "text-white" : "text-ink-soft hover:text-ink"
            }`}
          >
            {f === "monthly" ? "Monthly" : "One time"}
          </button>
        ))}
      </div>

      {/* Amount */}
      <fieldset className="relative mt-8">
        <legend className="text-sm font-semibold">Amount in US dollars</legend>
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {give.presets.map((a) => {
            const on = isPreset && d.amount === a;
            return (
              <button
                key={a}
                type="button"
                aria-pressed={on}
                data-pop="1.07"
                onClick={() => {
                  setCustom("");
                  setAmountError("");
                  d.update({ amount: a });
                }}
                className={`rounded-2xl border-[1.5px] py-4 font-display text-xl font-semibold transition-colors duration-300 ${
                  on ? "border-forest bg-forest text-white shadow-soft" : "border-line bg-cream hover:border-forest/60"
                }`}
              >
                {usd(a)}
              </button>
            );
          })}
          <label
            className={`col-span-3 flex items-center rounded-2xl border-[1.5px] bg-cream transition-[border-color,box-shadow] duration-300 focus-within:border-forest focus-within:shadow-[0_0_0_4px_rgb(31_90_70/0.22)] sm:col-span-1 ${
              amountError ? "border-clay-ink" : !isPreset ? "border-forest shadow-[0_0_0_4px_rgb(31_90_70/0.12)]" : "border-line"
            }`}
          >
            <span className="pl-3 font-display text-xl font-semibold text-ink-soft sm:pl-4">$</span>
            <input
              inputMode="decimal"
              placeholder="Other"
              aria-label="Other amount in US dollars"
              aria-invalid={amountError ? true : undefined}
              aria-describedby="amount-error"
              maxLength={9}
              value={custom}
              onChange={(e) => {
                const { text, amount, error } = parseAmount(e.target.value);
                setCustom(text);
                setAmountError(error);
                d.update({ amount });
              }}
              className="w-full min-w-0 bg-transparent py-4 pr-2 pl-1 font-display text-xl font-semibold outline-none placeholder:font-sans placeholder:text-base placeholder:font-medium placeholder:text-ink-soft"
            />
          </label>
        </div>
        <p id="amount-error" role="status" className="mt-2 min-h-5 text-sm font-medium text-clay-ink empty:min-h-0">
          {amountError}
        </p>
      </fieldset>

      {/* Designation */}
      <label className="relative mt-8 block">
        <span className="text-sm font-semibold">Where should it go?</span>
        <span className="relative mt-3 block">
          <select
            value={d.designation}
            onChange={(e) => d.update({ designation: e.target.value as Designation })}
            className="w-full cursor-pointer appearance-none rounded-2xl border-[1.5px] border-line bg-cream py-4 pr-12 pl-4 font-medium text-ink outline-none transition-[border-color,box-shadow] duration-300 hover:border-forest/60 focus:border-forest focus:shadow-[0_0_0_4px_rgb(31_90_70/0.12)]"
          >
            {give.designations.map((g) => (
              <option key={g} value={g}>
                {g === "General" ? "Where it's needed most" : g}
              </option>
            ))}
          </select>
          <Icon name="chevronDown" className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-forest" />
        </span>
      </label>

      <Magnetic className="mt-8 block w-full" strength={0.12}>
        <button type="button" onClick={submit} disabled={d.amount <= 0} className="btn btn-gold group min-h-15 w-full text-lg disabled:opacity-50">
          Give {usd(d.amount)} {d.frequency === "monthly" ? "monthly" : "now"}
          <Icon name="arrow" className="size-5 transition-transform duration-500 group-hover:translate-x-1" />
        </button>
      </Magnetic>
      <p className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-xs text-ink-soft">
        <Icon name="lock" className="size-3.5" />
        <T v={links.donatePlatform} />
        {d.designation !== "General" && <span>Giving to {d.designation}</span>}
      </p>
    </div>
  );
}
