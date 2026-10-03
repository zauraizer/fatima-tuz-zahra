/* Line icons on a 24×24 grid. Pass `draw` to let the reveal system draw the strokes in. */

type Shape = { d: string } | { c: [number, number, number] } | { r: [number, number, number, number, number] };

const ICONS: Record<string, Shape[]> = {
  home: [{ d: "M3 11l9-7 9 7" }, { d: "M5 10v10h14V10" }, { d: "M10 20v-6h4v6" }],
  school: [{ d: "M2 8l10-4 10 4-10 4z" }, { d: "M6 10v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" }],
  health: [{ d: "M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" }, { d: "M9 12h6M12 9v6" }],
  book: [{ d: "M4 5c3-1 6-1 8 1v14c-2-2-5-2-8-1z" }, { d: "M20 5c-3-1-6-1-8 1v14c2-2 5-2 8-1z" }],
  ball: [{ c: [12, 12, 8] }, { d: "M4.5 9.5c3 1 5.5 4 6 10M19.5 9.5c-3 1-5.5 4-6 10M7 5.5c2 2.5 8 2.5 10 0" }],
  tools: [{ d: "M14.5 6.5l3-3 3 3-3 3" }, { d: "M17.5 3.5L9 12" }, { d: "M4 20l5-5" }, { d: "M7 12l5 5-3 3-5-5z" }],
  lock: [{ r: [5, 10, 14, 10, 2] }, { d: "M8 10V7a4 4 0 0 1 8 0v3" }],
  receipt: [{ d: "M6 3h12v18l-3-2-3 2-3-2-3 2z" }, { d: "M9 8h6M9 12h6" }],
  heart: [{ d: "M12 20s-7-4.3-7-9.5A4 4 0 0 1 12 8a4 4 0 0 1 7 2.5C19 15.7 12 20 12 20z" }],
  arrow: [{ d: "M5 12h14M13 6l6 6-6 6" }],
  arrowUp: [{ d: "M12 19V5M6 11l6-6 6 6" }],
  check: [{ d: "M4 12.5l5 5L20 6.5" }],
  copy: [{ r: [9, 9, 11, 11, 2] }, { d: "M5 15V5a2 2 0 0 1 2-2h8" }],
  phone: [{ d: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z" }],
  mail: [{ r: [3, 5, 18, 14, 2] }, { d: "M3 7l9 6 9-6" }],
  pin: [{ d: "M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" }, { c: [12, 9.5, 2.5] }],
  clock: [{ c: [12, 12, 9] }, { d: "M12 7v5l3 2" }],
  map: [{ d: "M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z" }, { d: "M9 4v14M15 6v14" }],
  camera: [{ d: "M4 7h3l2-2h6l2 2h3v12H4z" }, { c: [12, 13, 3.5] }],
  plus: [{ d: "M12 5v14M5 12h14" }],
  pause: [{ d: "M9 5v14M15 5v14" }],
  play: [{ d: "M8 5.5v13l10.5-6.5z" }],
  chevronDown: [{ d: "M6 9l6 6 6-6" }],
  gift: [{ r: [3, 8, 18, 4, 1] }, { d: "M5 12v8h14v-8M12 8v12" }, { d: "M12 8S10 3 7.5 4.5 9 8 12 8zM12 8s2-5 4.5-3.5S15 8 12 8z" }],
  users: [{ c: [9, 8, 3.5] }, { d: "M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" }, { d: "M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2 .8 3 3 3 6" }],
  meal: [{ d: "M4 3v7a3 3 0 0 0 6 0V3M7 3v18" }, { d: "M17 3c-2 2-3 5-3 8h3v10" }],
  flag: [{ d: "M5 21V4" }, { d: "M5 4h11l-2 4 2 4H5" }],
  briefcase: [{ r: [3, 7, 18, 13, 2] }, { d: "M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" }],
  share: [{ c: [18, 5, 2.5] }, { c: [6, 12, 2.5] }, { c: [18, 19, 2.5] }, { d: "M8.2 10.8l7.6-4.6M8.2 13.2l7.6 4.6" }],
  calc: [{ r: [5, 3, 14, 18, 2] }, { d: "M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" }],
  bank: [{ d: "M3 9l9-5 9 5" }, { d: "M5 10v7M9.5 10v7M14.5 10v7M19 10v7M3 20h18" }],
  envelope: [{ r: [3, 6, 18, 12, 2] }, { d: "M7 10h6M7 14h3" }],
  cart: [{ d: "M3 4h2l2.5 11h11L21 7H6.2" }, { c: [9, 19, 1.5] }, { c: [17, 19, 1.5] }],
  zap: [{ d: "M13 3L5 13h6l-1 8 8-10h-6z" }],
  sparkle: [{ d: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" }],
  instagram: [{ r: [3.5, 3.5, 17, 17, 5] }, { c: [12, 12, 4] }, { d: "M17.5 6.5h.01" }],
  facebook: [{ d: "M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v7h4v-7h3l1-4h-4V8z" }],
  youtube: [{ r: [2.5, 5.5, 19, 13, 4] }, { d: "M10 9.5v5l4.5-2.5z" }],
};

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  className = "size-6",
  strokeWidth = 1.7,
  draw = false,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
  draw?: boolean;
}) {
  const extra = draw ? { pathLength: 1, "data-draw": "" } : {};
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name].map((s, i) =>
        "d" in s ? (
          <path key={i} d={s.d} {...extra} />
        ) : "c" in s ? (
          <circle key={i} cx={s.c[0]} cy={s.c[1]} r={s.c[2]} {...extra} />
        ) : (
          <rect key={i} x={s.r[0]} y={s.r[1]} width={s.r[2]} height={s.r[3]} rx={s.r[4]} {...extra} />
        ),
      )}
    </svg>
  );
}
