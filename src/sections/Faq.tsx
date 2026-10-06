import { faq } from "../content";
import { SectionHeading } from "../components/Bits";
import { Collapsible } from "../components/Collapsible";
import { Icon } from "../components/Icon";
import { RichText } from "../lib/draft";

export function Faq() {
  return (
    <section id="faq" className="relative bg-sand py-28 outline-none md:py-36">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-5 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading eyebrow="Questions" title="Things people often ask" lead="Can't find what you're looking for? We're happy to talk." />
          <a data-reveal href="#contact" className="btn btn-ghost mt-8">
            <Icon name="mail" className="size-4" /> Ask us anything
          </a>
        </div>
        <div data-reveal className="border-t border-line">
          {faq.map((item, i) => (
            <Collapsible key={item.q} title={item.q} defaultOpen={i === 0} size="lg">
              <p className="leading-relaxed text-ink-soft">
                <RichText parts={item.a} />
              </p>
            </Collapsible>
          ))}
        </div>
      </div>
    </section>
  );
}
