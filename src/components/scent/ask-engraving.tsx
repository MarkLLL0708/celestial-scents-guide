export function AskEngraving({ kind }: { kind: "self" | "love" | "work" | "mood" }) {
  return <svg viewBox="0 0 64 64" className="ask-engraving" fill="none" stroke="currentColor" strokeWidth="0.8" aria-hidden="true">
    {kind === "self" && <>
      <circle cx="32" cy="32" r="5" />
      {Array.from({ length: 8 }, (_, i) => <g key={i} transform={`rotate(${i * 45} 32 32)`}><path d="M30 25L32 6L34 25M32 10V24M28 22L24 14M36 22L40 14" /></g>)}
    </>}
    {kind === "love" && <>
      <circle cx="32" cy="32" r="21" /><ellipse cx="32" cy="32" rx="10" ry="21" /><ellipse cx="32" cy="32" rx="21" ry="8" /><path d="M14 21Q32 36 50 21M14 43Q32 28 50 43M32 11V53" />
      <circle cx="32" cy="32" r="3" /><path d="M7 12l3-3m43 43 4 4M55 8v6m-3-3h6" />
    </>}
    {kind === "work" && <>
      <path d="M32 5C11 20 14 47 32 58C50 47 53 20 32 5ZM32 5V58" />
      {[15,22,29,36,43,50].map((y) => <path key={y} d={`M32 ${y}Q21 ${y-3} 18 ${y+4}M32 ${y}Q43 ${y-3} 46 ${y+4}`} />)}
      <path d="M26 8Q15 33 29 55M38 8Q49 33 35 55" />
    </>}
    {kind === "mood" && <>
      <path d="M29 59Q38 39 31 22M33 45Q18 45 15 34Q29 33 33 45M34 37Q49 37 51 27Q38 26 34 37" />
      <circle cx="30" cy="17" r="4" />
      {Array.from({length:6},(_,i)=><ellipse key={i} cx="30" cy="8" rx="3" ry="7" transform={`rotate(${i*60} 30 17)`} />)}
      <path d="M32 42L20 37M37 33L46 30" />
    </>}
  </svg>;
}