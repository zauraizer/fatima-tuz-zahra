import { site } from "../content";
import { Emblem } from "../components/Brand";
import { Icon } from "../components/Icon";

/*
  The page hosts show for any address that doesn't exist (404.html).
  It wears the opening screen's colours, and the 0 of 404 is the turning star.
*/
export function NotFound() {
  return (
    <main className="relative isolate grid min-h-svh place-items-center overflow-hidden bg-forest-deep px-5 py-16 text-center text-cream">
      <div className="bg-stars-light pointer-events-none absolute -inset-y-[15%] inset-x-0 animate-drift opacity-[0.07]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 aspect-square w-[90vmax] -translate-1/2 bg-[radial-gradient(closest-side,rgb(232_176_74/0.16),transparent_70%)]" />

      <div className="relative flex max-w-xl flex-col items-center">
        <a href="/" className="inline-flex items-center gap-3 text-cream transition-colors hover:text-gold-soft">
          <Emblem light className="size-10" />
          <span className="font-display text-xl font-semibold">{site.name}</span>
        </a>

        <p aria-hidden="true" className="mt-14 flex items-center gap-[0.12em] font-display text-[clamp(6rem,20vw,11rem)] leading-none font-semibold text-gold-soft">
          <span>4</span>
          <Emblem light className="size-[0.78em] translate-y-[0.04em] animate-spin-slower" />
          <span>4</span>
        </p>

        <p className="sr-only">Error 404.</p>
        <h1 className="mt-8 text-[clamp(2rem,2.6vw+1rem,3rem)] text-cream">We couldn't find that page</h1>
        <p className="mt-4 max-w-md text-lg leading-relaxed text-cream/75">
          The link may be old, or the page may have moved. Everything is still on our homepage.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a href="/" className="btn btn-gold">
            Back to the homepage
            <Icon name="arrow" className="size-4" />
          </a>
          <a href="/#sponsor" className="btn border-2 border-cream/35 text-cream hover:border-cream hover:bg-cream/10">
            Sponsor a child
          </a>
        </div>
        <a href="/#contact" className="mt-6 text-sm text-cream/70 underline-offset-4 transition-colors hover:text-gold-soft hover:underline">
          Or get in touch with us
        </a>

        <p lang="ar" dir="rtl" className="mt-14 text-2xl text-gold-soft/80">
          {site.nameArabic}
        </p>
      </div>
    </main>
  );
}
