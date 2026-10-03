import { involved, links, site } from "../content";
import { SectionHeading } from "../components/Bits";
import { Icon, type IconName } from "../components/Icon";
import { useToast } from "../components/Toast";
import { isDraft, textOf } from "../lib/draft";
import { SpotlightCard } from "./Care";
import { WishlistLink } from "./Give";

const CARD_ICONS: Record<string, IconName> = { volunteer: "users", meal: "meal", fundraise: "flag", match: "briefcase" };

export function Involved() {
  const toast = useToast();

  const share = async () => {
    const data = { title: `${site.name} ${site.kind}`, text: site.tagline, url: window.location.href.split("#")[0] };
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch {
        /* dismissed */
      }
      return;
    }
    await navigator.clipboard.writeText(data.url).catch(() => {});
    toast("Link copied. Thank you for sharing");
  };

  return (
    <section id="involved" className="relative py-28 outline-none md:py-36">
      <div className="mx-auto max-w-[1240px] px-5">
        <SectionHeading eyebrow={involved.eyebrow} title={involved.title} lead={involved.lead} center />

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {/* Wish list — the wide card */}
          <SpotlightCard data-reveal data-pop="1.015" className="rounded-3xl bg-forest-deep p-8 text-cream transition-shadow duration-500 hover:shadow-pop md:col-span-2 md:p-10">
            <div className="bg-stars-light pointer-events-none absolute inset-0 opacity-[0.05]" />
            <span data-pop-icon className="relative grid size-14 place-items-center rounded-2xl bg-gold-bright text-forest-deep">
              <Icon name="gift" className="size-7" draw />
            </span>
            <h3 className="relative mt-6 text-[1.7rem] text-cream">Give in kind</h3>
            <p className="relative mt-2 max-w-lg text-cream/75">Things we always need. Drop them off, or send them straight from our wish list.</p>
            <ul className="relative mt-6 flex flex-wrap gap-2">
              {involved.wishlist.map((w) => (
                <li
                  key={w}
                  data-pop="1.1"
                  className="cursor-default rounded-full border border-cream/15 bg-cream/[0.07] px-4 py-2 text-sm font-medium transition-colors duration-300 hover:border-gold-bright hover:bg-gold-bright hover:text-forest-deep"
                >
                  {w}
                </li>
              ))}
            </ul>
            <div className="relative mt-8 flex flex-wrap gap-3">
              <WishlistLink className="!border-cream !text-cream hover:!bg-cream hover:!text-forest-deep" />
              <a href="#contact" className="btn btn-light min-h-11 px-5 text-sm">
                Arrange a drop off
              </a>
            </div>
          </SpotlightCard>

          {involved.cards.map((c) => {
            const external = !c.href.startsWith("#");
            const target = external ? links[c.href as keyof typeof links] : null;
            return (
              <SpotlightCard key={c.key} data-reveal data-pop className="flex flex-col rounded-3xl border border-line bg-white p-8 transition-shadow duration-500 hover:shadow-pop">
                <span data-pop-icon className="relative grid size-12 place-items-center rounded-2xl bg-forest-soft text-forest">
                  <Icon name={CARD_ICONS[c.key]} className="size-6" draw />
                </span>
                <h3 className="relative mt-5 text-xl">{c.title}</h3>
                <p className="relative mt-2 flex-1 leading-relaxed text-ink-soft">{c.body}</p>
                <a
                  href={target ? textOf(target) : c.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  onClick={(e) => {
                    if (target && isDraft(target)) {
                      e.preventDefault();
                      toast(`Link not set yet. Add links.${c.href} in src/content.ts`);
                    }
                  }}
                  className="group/link relative mt-6 inline-flex items-center gap-2 font-semibold text-forest"
                >
                  {c.cta}
                  <Icon name="arrow" className="size-4 transition-transform duration-500 group-hover/link:translate-x-1" strokeWidth={2.2} />
                </a>
              </SpotlightCard>
            );
          })}

          {/* Share: a full-width banner closing the grid, so the last row never has gaps */}
          <SpotlightCard
            data-reveal
            data-pop="1.015"
            className="flex flex-col gap-6 rounded-3xl border border-gold/40 bg-gold-soft p-8 transition-shadow duration-500 hover:shadow-pop md:col-span-2 md:flex-row md:items-center md:justify-between md:p-10 lg:col-span-3"
          >
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
              <span data-pop-icon className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gold-bright text-forest-deep">
                <Icon name="share" className="size-7" draw />
              </span>
              <div>
                <h3 className="text-2xl">Spread the word</h3>
                <p className="mt-1.5 max-w-xl leading-relaxed text-ink-soft">Tell one friend about our children. Every new supporter starts with a conversation.</p>
              </div>
            </div>
            <button type="button" onClick={share} className="btn btn-primary relative shrink-0 self-start md:self-center">
              <Icon name="share" className="size-4" strokeWidth={2} /> Share this page
            </button>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}
