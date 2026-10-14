import { useLayoutEffect, useRef, useState } from "react";
import { photoFiles, type PhotoName } from "../assets/photos";

/**
  A responsive photo: the browser picks the right size, it loads only when it
  nears the screen, and a blurred preview fills the space until then.

  Photos are cropped to fill their frame (object-cover), so a wide photo in a
  tall frame is drawn much wider than the frame itself. The drawn width is
  measured and given to the browser as `sizes`, so it fetches a file sharp
  enough for that, not just for the frame. `sizes` below is only the first guess.
*/
export function Photo({
  name,
  alt,
  sizes,
  focus,
  eager = false,
  className = "",
}: {
  name: PhotoName;
  alt: string;
  sizes: string;
  focus?: string;
  eager?: boolean;
  className?: string;
}) {
  const f = photoFiles[name];
  const ref = useRef<HTMLImageElement>(null);
  const [drawn, setDrawn] = useState<string | null>(null);

  useLayoutEffect(() => {
    const img = ref.current!;
    const measure = () => {
      const w = img.clientWidth;
      const h = img.clientHeight;
      if (!w || !h) return;
      const width = Math.max(w, h * (f.width / f.height));
      setDrawn(`${Math.ceil(width / 20) * 20}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(img);
    return () => ro.disconnect();
  }, [f]);

  return (
    <img
      ref={ref}
      src={f.src}
      srcSet={f.srcset}
      sizes={drawn ?? sizes}
      width={f.width}
      height={f.height}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      className={className}
      style={{ objectPosition: focus, backgroundImage: `url(${f.blur})`, backgroundSize: "cover", backgroundPosition: focus ?? "center" }}
    />
  );
}
