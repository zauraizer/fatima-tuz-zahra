import { involved, isTaxExempt, links, site } from "../content";
import { copyText, SectionHeading } from "../components/Bits";
import { Icon, type IconName } from "../components/Icon";
import { useToast } from "../components/Toast";
import { linkMissing, textOf } from "../lib/draft";
import { SpotlightCard } from "./Care";

const CARD_ICONS: Record<string, IconName> = { volunteer: "users", meal: "meal", fundraise: "flag", match: "briefcase" };

// Column counts for the cards, with the share banner spanning a full row, so the grid never has gaps.
const LAYOUT: Record<number, { grid: string; banner: string }> = {
  4: { grid: "md:grid-cols-2 lg:grid-cols-4", banner: "md:col-span-2 lg:col-span-4" },
  3: { grid: "md:grid-cols-3", banner: "md:col-span-3" },
  2: { grid: "md:grid-cols-2", banner: "md:col-span-2" },
};

export function Involved() {
  const toast = useToast();
  const cards = involved.cards.filter((c) => !c.needsTaxExempt || isTaxExempt);
  const layout = LAYOUT[cards.length] ?? LAYOUT[4];

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
    toast((await copyText(data.url)) ? "Link copied. Thank you for sharing" : `Couldn't copy the link. Please copy it from the address bar`);
  };

  return (
    <section id="involved" className="relative py-28 outline-none md:py-36">
      <div className="mx-auto max-w-[1240px] px-5">
        <SectionHeading eyebrow={involved.eyebrow} title={involved.title} lead={involved.lead} center />

        <div className={`mt-16 grid gap-5 ${layout.grid}`}>
          {cards.map((c) => {
            const external = !c.href.startsWith("#");
            const target = external ? links[c.href as keyof typeof links] : null;
            return (
              <SpotlightCard key={c.key} data-reveal data-pop className="flex flex-col rounded-3xl border border-line bg-white p-8 transition-shadow duration-500 hover:shadow-pop">
                <Icon data-pop-icon name={CARD_ICONS[c.key]} className="relative size-8 text-forest" />
                <h3 className="relative mt-5 text-xl">{c.title}</h3>
                <p className="relative mt-2 flex-1 leading-relaxed text-ink-soft">{c.body}</p>
                <a
                  href={target ? textOf(target) : c.href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  onClick={(e) => {
                    if (target && linkMissing(target)) {
                      e.preventDefault();
                      toast(`Link not set yet. Add links.${c.href} in src/content.ts`);
                    }
                  }}
                  className="group/link relative mt-6 inline-flex items-center gap-2 font-semibold text-forest"
                >
                  {c.cta}
                  <Icon name="arrow" className="size-4 transition-transform duration-500 group-hover/link:translate-x-1" />
                </a>
              </SpotlightCard>
            );
          })}

          {/* Share: a full-width banner closing the grid, so the last row never has gaps */}
          <SpotlightCard
            data-reveal
            data-pop="1.015"
            className={`flex flex-col gap-6 rounded-3xl border border-gold/40 bg-gold-soft p-8 transition-shadow duration-500 hover:shadow-pop md:flex-row md:items-center md:justify-between md:p-10 ${layout.banner}`}
          >
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
              <Icon data-pop-icon name="share" className="size-8 shrink-0 text-forest-deep" />
              <div>
                <h3 className="text-2xl">Spread the word</h3>
                <p className="mt-1.5 max-w-xl leading-relaxed text-ink-soft">Tell one friend about our children. Every new supporter starts with a conversation.</p>
              </div>
            </div>
            <button type="button" onClick={share} className="btn btn-primary relative shrink-0 self-start md:self-center">
              <Icon name="share" className="size-4" /> Share this page
            </button>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}
