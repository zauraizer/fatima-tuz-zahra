import { useRef, useState } from "react";
import { gallery } from "../content";
import { SectionHeading } from "../components/Bits";
import { Icon } from "../components/Icon";
import { Photo } from "../components/Photo";
import { PhotoViewer } from "../components/PhotoViewer";

/*
  A bento grid of the first eight photos. The tile pattern below fills a
  4-column grid (and a 2-column one on phones) with no gaps. Any tile opens the
  full-screen viewer; "See all" opens it at the first photo.
*/
const TILES = ["big", "tall", "small", "small", "tall", "big", "small", "small"] as const;
const SPAN = { big: "col-span-2 row-span-2", tall: "row-span-2", small: "" };
const SIZES = { big: "(min-width: 768px) 50vw, 100vw", tall: "(min-width: 768px) 25vw, 50vw", small: "(min-width: 768px) 25vw, 50vw" };

export function Gallery() {
  const grid = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState<{ index: number; source: HTMLElement | null; opener: HTMLElement } | null>(null);
  const shown = gallery.photos.slice(0, TILES.length);
  const tileFor = (i: number) => grid.current?.querySelector<HTMLElement>(`[data-photo="${i}"]`) ?? null;

  return (
    <section id="gallery" className="relative py-28 outline-none md:py-36">
      <div className="mx-auto max-w-[1240px] px-5">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <SectionHeading eyebrow={gallery.eyebrow} title={gallery.title} lead={gallery.lead} />
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={(e) => setOpen({ index: 0, source: null, opener: e.currentTarget })}
            className="btn btn-ghost mb-2 min-h-12 px-6"
          >
            <Icon name="camera" className="size-4.5" />
            See all {gallery.photos.length} photos
          </button>
        </div>

        <ul ref={grid} className="mt-14 grid grid-flow-dense auto-rows-[9.5rem] grid-cols-2 gap-3 md:auto-rows-[10rem] md:grid-cols-4 md:gap-4 lg:auto-rows-[13rem]">
          {shown.map((p, i) => {
            const tile = TILES[i];
            return (
              <li key={p.name} data-reveal="clip" className={SPAN[tile]}>
                <button
                  type="button"
                  data-photo={i}
                  aria-haspopup="dialog"
                  onClick={(e) => setOpen({ index: i, source: e.currentTarget, opener: e.currentTarget })}
                  className="group relative block size-full overflow-hidden rounded-[1.75rem] bg-sand focus-visible:outline-offset-4"
                >
                  <div data-reveal-inner className="absolute inset-0">
                    <Photo
                      name={p.name}
                      alt={p.alt}
                      focus={p.focus}
                      sizes={SIZES[tile]}
                      className="size-full object-cover transition-transform duration-[1.4s] ease-out-expo group-hover:scale-[1.06]"
                    />
                  </div>
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent px-5 pt-12 pb-4 text-left text-sm font-semibold text-white transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100">
                    {p.caption}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {open && (
        <PhotoViewer
          photos={gallery.photos}
          start={open.index}
          source={open.source}
          opener={open.opener}
          tileFor={tileFor}
          onClosed={() => setOpen(null)}
        />
      )}
    </section>
  );
}
