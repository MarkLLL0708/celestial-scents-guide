import { useId, useState, type ReactNode } from "react";

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const stars = (() => {
  const r = seeded(20261014);
  return Array.from({ length: 140 }, (_, i) => ({
    x: r() * 100,
    y: r() * 100,
    size: [1, 1.6, 2.4][Math.floor(r() * 3)],
    opacity: 0.2 + r() * 0.7,
    bright: i < 6,
    twinkle: i >= 6 && i < 18,
    delay: r() * 6,
  }));
})();

export function StarField() {
  return (
    <div className="star-field" aria-hidden="true">
      {stars.map((s, i) => (
        <span
          key={i}
          className={`star${s.bright ? " star-bright" : ""}${s.twinkle ? " star-twinkle" : ""}`}
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.bright ? 3 : s.size,
            height: s.bright ? 3 : s.size,
            opacity: s.bright ? 1 : s.opacity,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export function Orb({
  variant = "disc",
  size = "md",
}: {
  variant?: "sun" | "moon" | "disc";
  size?: "sm" | "md" | "lg";
}) {
  const id = useId().replace(/:/g, "");
  const light = variant === "sun" ? 1 : variant === "moon" ? 0.85 : 0.55;
  return (
    <svg className={`orb orb-${size}`} viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <filter id={`n${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="7" />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.6 -0.55" />
        </filter>
        <radialGradient id={`g${id}`} cx={variant === "moon" ? "30%" : "42%"} cy="40%" r="65%">
          <stop offset="0" stopColor="#fff" stopOpacity={light} />
          <stop
            offset={variant === "moon" ? "0.5" : "0.75"}
            stopColor="#fff"
            stopOpacity={light * 0.5}
          />
          <stop offset="1" stopColor="#fff" stopOpacity="0.04" />
        </radialGradient>
        <mask id={`m${id}`}>
          <circle cx="100" cy="100" r="92" fill={`url(#g${id})`} />
        </mask>
      </defs>
      <circle cx="100" cy="100" r="92" fill="var(--surface)" />
      <rect
        width="200"
        height="200"
        filter={`url(#n${id})`}
        mask={`url(#m${id})`}
        className="orb-grain"
      />
      <circle
        cx="100"
        cy="100"
        r="92"
        fill="none"
        stroke="currentColor"
        strokeOpacity={variant === "disc" ? 0.4 : 0.8}
        strokeWidth="1"
      />
    </svg>
  );
}

export function OrbitDiagram({ size = "md" }: { size?: "sm" | "md" }) {
  const orbits = [40, 60, 80, 100, 120, 140, 160];
  return (
    <svg className={`orbit orbit-${size}`} viewBox="0 0 360 200" fill="none" aria-hidden="true">
      <g className="orbit-spin">
        {orbits.map((rx, i) => {
          const ry = rx * 0.38;
          const a = (i * 53 * Math.PI) / 180;
          return (
            <g key={rx}>
              <ellipse
                cx="180"
                cy="100"
                rx={rx}
                ry={ry}
                stroke="currentColor"
                strokeWidth="1"
                opacity=".5"
              />
              <circle
                cx={180 + rx * Math.cos(a)}
                cy={100 + ry * Math.sin(a)}
                r="3.5"
                fill="currentColor"
              />
            </g>
          );
        })}
      </g>
      <circle cx="180" cy="100" r="12" fill="currentColor" />
    </svg>
  );
}

export const noteNames = ["bergamot", "rose", "vetiver", "amber", "jasmine", "musk"] as const;
export type NoteName = (typeof noteNames)[number];

// Files dropped into public/art/notes/<name>.png replace the line drawing.
const photoFiles = Object.keys(import.meta.glob("/public/art/notes/*.png"));
const hasPhoto = (n: NoteName) => photoFiles.some((f) => f.endsWith(`/${n}.png`));

const notePaths: Record<NoteName, ReactNode> = {
  bergamot: (
    <>
      <circle cx="24" cy="27" r="13" />
      <path d="M24 14V9M24 9C28 6 32 7 34 9C30 11 27 11 24 9" />
      <circle cx="20" cy="24" r="1" />
      <circle cx="27" cy="30" r="1" />
    </>
  ),
  rose: (
    <>
      <path d="M24 10C32 10 36 16 34 22C32 28 16 28 14 22C12 16 16 10 24 10Z" />
      <path d="M24 14C28 15 29 19 26 21C23 23 20 20 22 17" />
      <path d="M24 27V40M24 34C20 31 17 32 16 34M24 36C28 33 31 34 32 36" />
    </>
  ),
  vetiver: (
    <>
      <path d="M24 8V40M18 10C20 20 22 30 24 40M30 10C28 20 26 30 24 40M12 16C17 24 21 32 24 40M36 16C31 24 27 32 24 40" />
    </>
  ),
  amber: (
    <>
      <path d="M24 8L36 18L32 36H16L12 18Z" />
      <path d="M12 18H36M24 8L20 18L24 36L28 18Z" />
    </>
  ),
  jasmine: (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <ellipse key={i} cx="24" cy="15" rx="4" ry="8" transform={`rotate(${i * 72} 24 24)`} />
      ))}
      <circle cx="24" cy="24" r="2" />
    </>
  ),
  musk: (
    <>
      <circle cx="24" cy="24" r="14" />
      <circle cx="24" cy="24" r="8" strokeDasharray="2 3" />
      <circle cx="24" cy="24" r="2" />
    </>
  ),
};

export function NoteIcon({ name, label }: { name: NoteName; label: string }) {
  const [photoFailed, setPhotoFailed] = useState(false);
  if (hasPhoto(name) && !photoFailed)
    return (
      <img
        className="note-icon"
        src={`/art/notes/${name}.png`}
        alt={label}
        onError={() => setPhotoFailed(true)}
      />
    );
  return (
    <svg
      className="note-icon"
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      role="img"
      aria-label={label}
    >
      {notePaths[name]}
    </svg>
  );
}

export function CellGrid({ columns = 2, children }: { columns?: 1 | 2 | 3; children: ReactNode }) {
  return <div className={`cell-grid cell-grid-${columns}`}>{children}</div>;
}
export function Cell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return <div className={`cell${wide ? " cell-wide" : ""}`}>{children}</div>;
}
