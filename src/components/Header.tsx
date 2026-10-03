import { useEffect, useRef, useState } from "react";
import { contact, nav } from "../content";
import { textOf } from "../lib/draft";
import { gsap, ScrollTrigger, useGSAP } from "../lib/gsap";
import { Brand } from "./Brand";
import { Magnetic } from "./Effects";
import { Icon } from "./Icon";
import { useLenis } from "./SmoothScroll";

export function Header() {
  const header = useRef<HTMLElement>(null);
  const navList = useRef<HTMLUListElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const menuTl = useRef<gsap.core.Timeline>(null);
  const [active, setActive] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const lenis = useLenis();

  // Hide on the way down, return on the way up; track which section is in view.
  useGSAP(() => {
    let hidden: boolean | null = null;
    const update = (y: number, direction: number) => {
      // Stay out of the way while the opening splash is on screen.
      const splash = document.getElementById("splash")?.offsetHeight ?? 0;
      setScrolled(y > splash + 24);
      const hide = y < splash * 0.8 || (direction === 1 && y > splash + 360);
      if (hide === hidden) return;
      const first = hidden === null;
      hidden = hide;
      if (first) gsap.set(header.current, { yPercent: hide ? -130 : 0 });
      else gsap.to(header.current, { yPercent: hide ? -130 : 0, duration: 0.6, ease: hide ? "power3.in" : "expo.out" });
    };
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => update(self.scroll(), self.direction),
      onRefresh: (self) => update(self.scroll(), 1),
    });

    nav.forEach(({ id }, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      ScrollTrigger.create({
        trigger: el,
        start: "top 45%",
        end: "bottom 45%",
        refreshPriority: -1,
        onToggle: (self) => {
          if (self.isActive) setActive(id);
          else if (i === 0 && self.direction === -1) setActive(null);
        },
      });
    });
  });

  // Slide the pill indicator under the active link.
  useEffect(() => {
    const place = () => {
      const link = navList.current?.querySelector<HTMLElement>(`[data-id="${active}"]`);
      if (!link) return gsap.to(indicator.current, { autoAlpha: 0, duration: 0.3 });
      gsap.to(indicator.current, {
        x: link.offsetLeft,
        width: link.offsetWidth,
        autoAlpha: 1,
        duration: 0.7,
        ease: "expo.out",
      });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [active]);

  // Full-screen mobile menu: a circle grows out of the toggle button.
  useGSAP(() => {
    const items = menu.current!.querySelectorAll(".menu-item");
    gsap.set(menu.current, { clipPath: "circle(0% at calc(100% - 44px) 44px)", visibility: "hidden" });
    menuTl.current = gsap
      .timeline({ paused: true })
      .set(menu.current, { visibility: "visible" })
      .to(menu.current, { clipPath: "circle(150% at calc(100% - 44px) 44px)", duration: 0.9, ease: "expo.inOut" })
      .from(items, { yPercent: 120, autoAlpha: 0, duration: 0.8, stagger: 0.05, ease: "expo.out" }, "-=0.45");
  });

  // Only touch Lenis on real open/close transitions, so the intro's scroll lock isn't undone on mount.
  const wasOpen = useRef(false);
  useEffect(() => {
    const tl = menuTl.current;
    if (!tl) return;
    if (open) {
      wasOpen.current = true;
      tl.timeScale(1).play();
      lenis?.stop();
      menu.current?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
    } else if (wasOpen.current) {
      wasOpen.current = false;
      tl.timeScale(1.6).reverse();
      lenis?.start();
    }
    // Keyboard and screen-reader users stay inside the open menu.
    for (const id of ["main", "site-footer"]) document.getElementById(id)?.toggleAttribute("inert", open);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, lenis]);

  const glass = scrolled && !open;

  return (
    <>
      <header ref={header} className="fixed inset-x-0 top-0 z-[60] px-3 pt-3 md:px-5">
        <div
          className={`mx-auto flex h-16 max-w-[1240px] items-center justify-between rounded-full border pr-2 pl-4 transition-[background-color,border-color,box-shadow] duration-500 ${
            glass ? "border-line/80 bg-cream/80 shadow-soft backdrop-blur-xl backdrop-saturate-150" : "border-transparent bg-transparent"
          }`}
        >
          <Brand light={open} />

          <nav aria-label="Main" className="hidden lg:block">
            <ul ref={navList} className="relative flex items-center gap-1">
              <span
                ref={indicator}
                className="invisible absolute top-0 left-0 h-full rounded-full bg-forest-soft opacity-0"
                aria-hidden="true"
              />
              {nav.map((item) => (
                <li key={item.id} className="relative">
                  <a
                    href={`#${item.id}`}
                    data-id={item.id}
                    aria-current={active === item.id ? "true" : undefined}
                    data-pop="1.06"
                    data-pop-lift="0"
                    className={`block rounded-full px-4 py-2 text-[0.94rem] font-medium transition-colors duration-300 ${
                      active === item.id ? "text-forest-deep" : "text-ink hover:text-forest"
                    }`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Magnetic className="hidden sm:inline-block">
              <a href="#give" className="btn btn-gold min-h-11 px-5 text-[0.95rem]">
                <Icon name="heart" className="size-4" strokeWidth={2.2} />
                Donate
              </a>
            </Magnetic>
            <button
              ref={toggle}
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className={`relative grid size-12 place-items-center rounded-full transition-colors lg:hidden ${
                open ? "bg-cream/10 text-cream" : "text-ink hover:bg-forest-soft"
              }`}
            >
              <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
              <span aria-hidden="true" className="relative block h-3.5 w-6">
                <span className={`absolute left-0 h-0.5 w-6 rounded-full bg-current transition-all duration-500 ease-out-expo ${open ? "top-1.5 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 h-0.5 rounded-full bg-current transition-all duration-500 ease-out-expo ${open ? "top-1.5 w-6 -rotate-45" : "top-3 w-4"}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        ref={menu}
        id="mobile-menu"
        className="fixed inset-0 z-[55] overflow-y-auto bg-forest-deep text-cream lg:hidden"
        inert={!open}
        aria-hidden={!open}
        onClick={(e) => (e.target as Element).closest("a") && setOpen(false)}
      >
        <div className="bg-stars-light pointer-events-none absolute inset-0 opacity-[0.06]" />
        <div className="relative flex min-h-full flex-col px-6 pt-28 pb-10">
          <ul className="flex flex-col">
            {nav.map((item, i) => (
              <li key={item.id} className="overflow-hidden border-b border-cream/10">
                <a href={`#${item.id}`} className="menu-item flex items-baseline gap-4 py-4 font-display text-4xl font-medium">
                  <span className="font-sans text-xs font-bold tracking-widest text-gold-bright">{String(i + 1).padStart(2, "0")}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="menu-item mt-10">
            <a href="#give" className="btn btn-gold w-full">
              <Icon name="heart" className="size-4" strokeWidth={2.2} />
              Donate now
            </a>
          </div>
          <div className="menu-item mt-auto pt-10 text-sm text-cream/70">
            <p>{textOf(contact.email)}</p>
            <p>{textOf(contact.phone)}</p>
          </div>
        </div>
      </div>
    </>
  );
}
