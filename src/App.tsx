import { useCallback, useEffect, useRef, useState } from "react";
import { DraftBadge } from "./components/DraftBadge";
import { Cursor, ScrollProgress } from "./components/Effects";
import { Header } from "./components/Header";
import { PrivacyDialog } from "./components/PrivacyDialog";
import { SmoothScroll, useScrollTo } from "./components/SmoothScroll";
import { ToastProvider } from "./components/Toast";
import { DonationProvider } from "./lib/donation";
import { ScrollTrigger } from "./lib/gsap";
import { useFinePointer, useReducedMotion } from "./lib/hooks";
import { usePopHover } from "./lib/pop";
import { useReveals } from "./lib/reveal";
import { Care } from "./sections/Care";
import { Contact } from "./sections/Contact";
import { DayCycle } from "./sections/DayCycle";
import { Faq } from "./sections/Faq";
import { BackToTop, Footer } from "./sections/Footer";
import { Donate, Sponsorship } from "./sections/Give";
import { Hero } from "./sections/Hero";
import { Splash } from "./sections/Splash";
import { Involved } from "./sections/Involved";
import { Stats, ValuesMarquee } from "./sections/Stats";
import { Story } from "./sections/Story";
import { WindowReveal } from "./sections/WindowReveal";
import { Verse } from "./sections/Verse";

export default function App() {
  return (
    <SmoothScroll>
      <ToastProvider>
        <Site />
      </ToastProvider>
    </SmoothScroll>
  );
}

function Site() {
  const page = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const finePointer = useFinePointer();
  const scrollTo = useScrollTo();
  const [privacyOpen, setPrivacyOpen] = useState(false);
  useReveals(page, !reduced);
  usePopHover(finePointer && !reduced);

  // Everything is mounted: order the triggers by page position (the pinned
  // day scene adds height above later sections), then re-measure once fonts land.
  useEffect(() => {
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }, [reduced]);

  // Arriving with a #hash: let layout settle, then glide there.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const t = window.setTimeout(() => scrollTo(id), 400);
    return () => window.clearTimeout(t);
  }, [scrollTo]);

  const toDonate = useCallback(() => scrollTo("donate-widget"), [scrollTo]);

  return (
    <DonationProvider onPrefill={toDonate}>
      <a
        href="#main"
        className="fixed top-3 left-3 z-[110] -translate-y-24 rounded-full bg-forest px-5 py-3 font-semibold text-white shadow-lift transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <Header />
      <div ref={page}>
        <Splash />
        <main id="main" className="outline-none">
          <Hero />
          <Stats />
          <ValuesMarquee />
          <Story />
          <WindowReveal />
          <Care />
          <DayCycle />
          <Verse />
          <div id="give" className="outline-none">
            <Sponsorship />
            <Donate />
          </div>
          <Involved />
          <Faq />
          <Contact />
        </main>
        <Footer openPrivacy={() => setPrivacyOpen(true)} />
      </div>
      <PrivacyDialog open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <div className="grain" aria-hidden="true" />
      <BackToTop />
      <DraftBadge />
      <Cursor />
    </DonationProvider>
  );
}
