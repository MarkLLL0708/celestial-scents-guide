import { useLanguage } from "@/i18n/provider";
export function Logo() {
  return (
    <svg className="brand-symbol" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1" />
      <circle cx="25" cy="7" r="3" fill="currentColor" />
    </svg>
  );
}
export function ChartWheel() {
  return (
    <svg className="wheel" viewBox="0 0 400 400" fill="none" aria-hidden="true">
      <circle cx="200" cy="200" r="177" stroke="currentColor" strokeWidth=".7" />
      <circle cx="200" cy="200" r="145" stroke="currentColor" strokeWidth=".7" />
      <circle cx="200" cy="200" r="114" stroke="currentColor" strokeWidth=".7" />
      {Array.from({ length: 12 }, (_, i) => (
        <g key={i} transform={`rotate(${i * 30} 200 200)`}>
          <path d="M200 23V86" stroke="currentColor" strokeWidth=".7" />
          <path d="M200 14V19" stroke="currentColor" />
          <circle cx="200" cy="55" r="2" fill="currentColor" />
        </g>
      ))}
      {Array.from({ length: 72 }, (_, i) => (
        <path
          key={i}
          d="M200 23V28"
          transform={`rotate(${i * 5} 200 200)`}
          stroke="currentColor"
          strokeWidth=".5"
        />
      ))}
      <path
        d="M200 86L299 257L101 257ZM101 143L299 143L200 314Z"
        stroke="currentColor"
        strokeWidth=".65"
      />
      <path
        d="M200 86L101 257L299 143L200 314L101 143L299 257Z"
        stroke="currentColor"
        strokeWidth=".5"
      />
      <circle cx="200" cy="200" r="36" stroke="currentColor" strokeWidth=".7" />
      <circle cx="200" cy="200" r="6" stroke="currentColor" />
      <path d="M200 150V169M200 231V250M150 200H169M231 200H250" stroke="currentColor" />
      <circle cx="299" cy="143" r="4" fill="currentColor" />
      <circle cx="200" cy="314" r="4" fill="currentColor" />
      <circle cx="101" cy="257" r="4" fill="currentColor" />
    </svg>
  );
}
const shapes: Record<string, string> = {
  Citrus: "M65 90H155V235H65Z",
  Floral: "M70 90Q110 75 150 90V235H70Z",
  Woody: "M60 100H160V230H60Z",
  Oriental: "M80 90H140L165 130V220Q110 245 55 220V130Z",
  Fresh: "M75 85H145V240H75Z",
  Gourmand: "M55 115Q55 90 80 90H140Q165 90 165 115V225H55Z",
  Aromatic: "M75 100L65 235H155L145 100Z",
  Musk: "M65 110Q65 85 110 85Q155 85 155 110V225Q110 240 65 225Z",
  Leather: "M60 95H160V235H60Z",
  Green: "M70 90H150V230H70Z",
};
export function Bottle({ family, name }: { family: string; name: string }) {
  const { t } = useLanguage();
  return (
    <svg
      className="bottle"
      viewBox="0 0 220 290"
      fill="none"
      role="img"
      aria-label={t.bottleAlt.replace("{name}", name)}
    >
      <path d="M91 55H129V78H91Z" stroke="currentColor" strokeWidth="1.3" />
      <path d="M85 78H135V90H85Z" stroke="currentColor" strokeWidth="1.3" />
      <path d={shapes[family] ?? shapes.Citrus} stroke="currentColor" strokeWidth="1.3" />
      <path d="M78 132H142V192H78Z" stroke="currentColor" strokeWidth=".8" />
      <circle cx="110" cy="150" r="8" stroke="currentColor" strokeWidth=".7" />
      <circle cx="116" cy="144" r="2" fill="currentColor" />
      <path d="M91 169H129M98 176H122" stroke="currentColor" strokeWidth=".7" />
      <path d="M72 245H148" stroke="currentColor" strokeWidth=".5" />
    </svg>
  );
}
export function SignGlyph({ index = 0 }: { index?: number }) {
  return (
    <svg className="placement-glyph" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      {index === 0 ? (
        <>
          <circle cx="20" cy="20" r="12" stroke="currentColor" />
          <circle cx="20" cy="20" r="3" fill="currentColor" />
        </>
      ) : index === 1 ? (
        <path d="M27 8A13 13 0 1 0 27 32A14 14 0 0 1 27 8Z" stroke="currentColor" />
      ) : (
        <>
          <path d="M7 28H33M7 23H13A8 8 0 1 1 27 23H33" stroke="currentColor" />
        </>
      )}
    </svg>
  );
}
