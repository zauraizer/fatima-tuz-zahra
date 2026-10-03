import { useEffect, useRef, useState, type FormEvent } from "react";
import { contact, forms, site } from "../content";
import { SectionHeading } from "../components/Bits";
import { Magnetic } from "../components/Effects";
import { Icon, type IconName } from "../components/Icon";
import { isDraft, T, textOf } from "../lib/draft";
import { gsap, useGSAP } from "../lib/gsap";

const TOPICS = ["Sponsor a child", "Zakat or Sadaqah", "Volunteer", "Visit", "Something else"];

const INFO: { icon: IconName; label: string; value: typeof contact.email }[] = [
  { icon: "pin", label: "Address", value: contact.address },
  { icon: "phone", label: "Phone", value: contact.phone },
  { icon: "mail", label: "Email", value: contact.email },
  { icon: "clock", label: "Visiting hours", value: contact.hours },
];

type Status = "idle" | "sending" | "sent" | "mailto" | "error";
type Invalid = { name?: boolean; email?: boolean };

export function Contact() {
  const form = useRef<HTMLFormElement>(null);
  const success = useRef<HTMLDivElement>(null);
  const thanks = useRef<HTMLParagraphElement>(null);
  const [topic, setTopic] = useState(TOPICS[0]);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [invalid, setInvalid] = useState<Invalid>({});

  // The form is swapped for the thank-you card, so move focus to it (and back again after).
  const wasSent = useRef(false);
  useEffect(() => {
    if (status === "sent") thanks.current?.focus();
    else if (wasSent.current) form.current?.querySelector<HTMLInputElement>("[name=name]")?.focus();
    wasSent.current = status === "sent";
  }, [status]);

  useGSAP(
    () => {
      if (status !== "sent") return;
      gsap
        .timeline()
        .from(success.current, { opacity: 0, scale: 0.94, duration: 0.7 })
        .fromTo(".ok-ring", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" }, 0.1)
        .fromTo(".ok-check", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5, ease: "power2.out" }, 0.7)
        .from(".ok-text", { opacity: 0, y: 12, stagger: 0.08 }, 0.8);
    },
    { dependencies: [status], scope: success, revertOnUpdate: true },
  );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const f = form.current!;
    const data = Object.fromEntries(new FormData(f)) as Record<string, string>;
    // Honeypot: real people never see this field; bots fill it in. Pretend it worked.
    if (data._gotcha) {
      setStatus("sent");
      return;
    }
    delete data._gotcha;
    const emailField = f.querySelector<HTMLInputElement>("[name=email]")!;
    const bad: Invalid = { name: !data.name?.trim(), email: !data.email?.trim() || !emailField.validity.valid };
    if (bad.name || bad.email) {
      setInvalid(bad);
      // A fresh string each time, so a repeated mistake is announced again.
      const msg = bad.name && bad.email ? "Please add your name and email so we can reply." : bad.name ? "Please add your name." : "Please check your email address.";
      setError(error === msg ? `${msg}\u00a0` : msg);
      f.querySelector<HTMLInputElement>(bad.name ? "[name=name]" : "[name=email]")?.focus();
      gsap.fromTo(f, { x: -8 }, { x: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" });
      return;
    }
    setInvalid({});
    setError("");
    const payload: Record<string, string> = { ...data, topic };

    if (!forms.contactEndpoint) {
      // No form service yet: open the visitor's email app with the message filled in.
      // The form stays filled in, in case no email app is set up on this device.
      const to = textOf(contact.email);
      if (isDraft(contact.email)) {
        setError("The contact email isn't set yet. Add contact.email in src/content.ts");
        return;
      }
      const body = `Name: ${payload.name}\nEmail: ${payload.email}\nPhone: ${payload.phone || "none given"}\nTopic: ${topic}\n\n${payload.message || ""}`;
      window.location.href = `mailto:${to}?subject=${encodeURIComponent(`Website enquiry: ${topic}`)}&body=${encodeURIComponent(body)}`;
      setStatus("mailto");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch(forms.contactEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
    } catch {
      setStatus("error");
      setError("Something went wrong sending your message. Please email us directly.");
    }
  };

  return (
    <section id="contact" className="relative py-28 outline-none md:py-36">
      <div className="mx-auto grid max-w-[1240px] items-start gap-14 px-5 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionHeading
            eyebrow="Visit and contact"
            title="Come and meet our family"
            lead="Visitors are always welcome during visiting hours. Please call ahead so we can show you around."
          />
          <ul className="mt-10 grid gap-5 sm:grid-cols-2">
            {INFO.map((item) => (
              <li key={item.label} data-reveal data-pop="1.04" className="flex items-start gap-4">
                <span data-pop-icon className="grid size-12 shrink-0 place-items-center rounded-2xl border border-line bg-white text-forest">
                  <Icon name={item.icon} className="size-5" />
                </span>
                <div>
                  <p className="text-[0.72rem] font-bold tracking-[0.12em] text-ink-soft uppercase">{item.label}</p>
                  <p className="mt-0.5 font-semibold">
                    <T v={item.value} />
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* The empty "map goes here" box only shows in draft mode. */}
          {(contact.mapEmbed || site.draftMode) && (
            <div data-reveal="clip" className="mt-10 aspect-[16/8] overflow-hidden rounded-3xl border-2 border-dashed border-line bg-sand">
              {contact.mapEmbed ? (
                <iframe title="Map to the home" src={contact.mapEmbed} className="size-full border-0" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
              ) : (
                <div data-reveal-inner className="relative grid size-full place-content-center justify-items-center gap-2 text-sm text-ink-soft">
                  <div className="bg-stars absolute inset-0 opacity-15" />
                  <Icon name="map" className="relative size-9 text-gold" />
                  <p className="relative">Map of the home goes here</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div data-reveal className="relative">
          {status === "sent" ? (
            <div ref={success} className="card grid min-h-[34rem] place-content-center justify-items-center p-10 text-center shadow-lift">
              <svg viewBox="0 0 80 80" className="size-24 text-forest" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle className="ok-ring" cx="40" cy="40" r="36" pathLength={1} strokeDasharray="1" />
                <path className="ok-check" d="M25 41l10 10 20-22" pathLength={1} strokeDasharray="1" />
              </svg>
              <p ref={thanks} tabIndex={-1} role="status" className="ok-text mt-6 font-display text-3xl font-semibold outline-none">
                Thank you
                <span className="mt-2 block max-w-xs font-sans text-base font-normal text-ink-soft">Your message is on its way. We'll be in touch soon.</span>
              </p>
              <button type="button" onClick={() => setStatus("idle")} className="ok-text btn btn-ghost mt-8 min-h-11 px-5 text-sm">
                Send another message
              </button>
            </div>
          ) : (
            <form ref={form} onSubmit={submit} noValidate className="card p-6 shadow-lift sm:p-9">
              <p className="font-display text-2xl font-semibold">Send us a message</p>
              <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

              <fieldset className="mt-6">
                <legend className="text-sm font-semibold">I would like to</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {TOPICS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={topic === t}
                      data-pop="1.07"
                      onClick={() => setTopic(t)}
                      className={`rounded-full border-[1.5px] px-3.5 py-1.5 text-sm font-semibold transition-colors duration-300 ${
                        topic === t ? "border-forest bg-forest text-white" : "border-line bg-cream hover:border-forest/60"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <FloatingField name="name" label="Your name" autoComplete="name" required invalid={invalid.name} />
                <FloatingField name="email" label="Email" type="email" autoComplete="email" required invalid={invalid.email} />
              </div>
              <div className="mt-4">
                <FloatingField name="phone" label="Phone (optional)" type="tel" autoComplete="tel" />
              </div>
              <div className="relative mt-4">
                <textarea id="cf-message" name="message" rows={4} placeholder=" " className="field-input peer min-h-32 resize-y" />
                <label htmlFor="cf-message" className="field-label">
                  Message
                </label>
              </div>

              <p id="cf-error" role="status" aria-live="polite" className="mt-4 min-h-6 text-sm font-medium text-clay-ink">
                {error}
              </p>
              {status === "mailto" && (
                <p role="status" className="mt-1 rounded-xl bg-forest-soft p-4 text-sm leading-relaxed text-forest-deep">
                  Your email app should have opened with your message ready. Just press send. If nothing opened, email us at{" "}
                  <a href={`mailto:${textOf(contact.email)}`} className="font-semibold underline underline-offset-2">
                    {textOf(contact.email)}
                  </a>
                  . Your message is still here so you can copy it.
                </p>
              )}
              <Magnetic className="mt-2 block w-full" strength={0.12}>
                <button type="submit" disabled={status === "sending"} className="btn btn-primary group min-h-14 w-full disabled:opacity-60">
                  {status === "sending" ? "Sending" : "Send message"}
                  <Icon name="arrow" className="size-4 transition-transform duration-500 group-hover:translate-x-1" strokeWidth={2.2} />
                </button>
              </Magnetic>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function FloatingField({
  name,
  label,
  type = "text",
  invalid,
  ...rest
}: { name: string; label: string; type?: string; invalid?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = `cf-${name}`;
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={type}
        placeholder=" "
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? "cf-error" : undefined}
        className={`field-input peer ${invalid ? "border-clay-ink" : ""}`}
        {...rest}
      />
      <label htmlFor={id} className="field-label">
        {label}
      </label>
    </div>
  );
}
