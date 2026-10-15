import { useEffect, useId, useRef, useState, type ReactNode } from "react";

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

export function StarField({ parallax = false }: { parallax?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!parallax) return;
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    const apply = () => {
      frame = 0;
      el.style.setProperty("--px", `${x}px`);
      el.style.setProperty("--py", `${y}px`);
    };
    const onMove = (event: PointerEvent) => {
      x = (event.clientX / window.innerWidth - 0.5) * -18;
      y = (event.clientY / window.innerHeight - 0.5) * -12;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    // Gentle tilt on touch devices: eases the stars a few pixels as the phone tips.
    const touch = window.matchMedia("(pointer: coarse)").matches;
    const onTilt = (event: DeviceOrientationEvent) => {
      if (event.gamma == null || event.beta == null) return;
      const gx = Math.max(-1, Math.min(1, event.gamma / 30));
      const gy = Math.max(-1, Math.min(1, (event.beta - 45) / 30));
      x += (gx * -10 - x) * 0.15;
      y += (gy * -8 - y) * 0.15;
      if (!frame) frame = requestAnimationFrame(apply);
    };
    type PermissionedDOE = { requestPermission?: () => Promise<string> };
    const needsPermission =
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof (DeviceOrientationEvent as unknown as PermissionedDOE).requestPermission === "function";
    const askOnce = () => {
      window.removeEventListener("touchend", askOnce);
      (DeviceOrientationEvent as unknown as PermissionedDOE)
        .requestPermission?.()
        .then((state) => {
          if (state === "granted") window.addEventListener("deviceorientation", onTilt);
        })
        .catch(() => {});
    };
    if (touch && typeof DeviceOrientationEvent !== "undefined") {
      // Only iOS needs a permission; ask on the visitor's first tap, never on load.
      if (needsPermission) window.addEventListener("touchend", askOnce, { once: true });
      else window.addEventListener("deviceorientation", onTilt);
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("deviceorientation", onTilt);
      window.removeEventListener("touchend", askOnce);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [parallax]);

  return (
    <div ref={ref} className="star-field" aria-hidden="true">
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

// Rare meteor streak across a dark section. Pure line art, no gradients.
export function ShootingStar({ className = "" }: { className?: string }) {
  return (
    <svg className={`shooting-star ${className}`.trim()} viewBox="0 0 120 12" aria-hidden="true">
      <line x1="0" y1="6" x2="98" y2="6" stroke="currentColor" strokeWidth="1" strokeOpacity="0.45" />
      <circle cx="105" cy="6" r="1.6" fill="currentColor" />
    </svg>
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

// Solar-system scene: glowing sun, orbiting planets (one ringed), twinkling stars.
export function SolarSystem({ size = "lg" }: { size?: "md" | "lg" }) {
  const id = useId().replace(/:/g, "");
  const planets = [
    { r: 46, size: 5, dur: 26, start: 0, ring: false, bright: 0.9 },
    { r: 66, size: 7, dur: 44, start: 140, ring: false, bright: 0.75 },
    { r: 86, size: 6, dur: 68, start: 250, ring: true, bright: 0.85 },
    { r: 104, size: 4, dur: 96, start: 60, ring: false, bright: 0.6 },
  ];
  const stars = [
    [14, 22, 1.1],
    [178, 16, 0.9],
    [190, 60, 1.2],
    [12, 150, 1],
    [30, 188, 0.8],
    [168, 182, 1.1],
    [196, 140, 0.7],
    [52, 10, 0.8],
    [96, 6, 1],
    [8, 84, 0.7],
  ];
  return (
    <svg className={`solar solar-${size}`} viewBox="0 0 220 220" aria-hidden="true">
      <defs>
        <radialGradient id={`sg${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {stars.map(([x, y, r], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={r}
          fill="currentColor"
          className="star-twinkle"
          style={{ animationDelay: `${i * 0.7}s` }}
        />
      ))}
      {planets.map((p, i) => (
        <circle
          key={i}
          cx="110"
          cy="110"
          r={p.r}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.18"
          strokeWidth="0.75"
        />
      ))}
      <circle cx="110" cy="110" r="26" fill={`url(#sg${id})`} className="solar-glow" />
      <circle cx="110" cy="110" r="9" fill="#fff" />
      {planets.map((p, i) => (
        <g
          key={i}
          className="solar-orbit"
          style={{ animationDuration: `${p.dur}s`, animationDelay: `${(-p.start / 360) * p.dur}s` }}
        >
          <g transform={`translate(${110 + p.r} 110)`}>
            <circle r={p.size} fill="currentColor" opacity={p.bright} />
            <circle
              r={p.size}
              fill="none"
              stroke="var(--bg)"
              strokeWidth="1"
              opacity="0.35"
              strokeDasharray={`${p.size} ${p.size * 2}`}
            />
            {p.ring && (
              <ellipse
                rx={p.size + 4.5}
                ry={(p.size + 4.5) * 0.32}
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                opacity="0.8"
                transform="rotate(-18)"
              />
            )}
          </g>
        </g>
      ))}
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
