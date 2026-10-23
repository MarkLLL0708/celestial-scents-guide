import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/provider";
import { useAccount } from "@/data/auth";
import { generateReadingTest, readingTestAccess } from "@/data/reading-test.functions";
import { check } from "@/lib/readingValidator";
import { fixtures, testModels, type Language, type ReadingOutput } from "@/lib/reading-test/fixtures";

type Result = { output: ReadingOutput | null; tries: number; model: string; humanized: boolean; reason: string | null };
const signsFor = (packet: Record<string, unknown>) => {
  const names = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
  return names.filter((sign) => new RegExp(`\\b${sign}\\b`, "i").test(JSON.stringify(packet)));
};
function Output({ value }: { value: ReadingOutput }) {
  return <div className="space-y-3">{value.lines ? value.lines.map((line, i) => <p key={i}>{line}</p>) : Object.entries(value).map(([key, text]) => <p key={key}><span className="label muted">{key}</span><br />{text}</p>)}</div>;
}
export function DevReadingsTest() {
  const { t } = useLanguage();
  const { user } = useAccount();
  const generate = useServerFn(generateReadingTest);
  const access = useServerFn(readingTestAccess);
  const [models, setModels] = useState<string[]>([testModels[0], testModels[1]]);
  const [compare, setCompare] = useState(false);
  const [results, setResults] = useState<Record<string, Result>>({});
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const stop = useRef(false);
  async function run() {
    setError(""); setResults({}); setBusy("starting"); stop.current = false;
    try {
      await access();
      for (const fixture of fixtures) for (const model of models.slice(0, compare ? 2 : 1)) for (const language of ["en", "vi"] as const) {
        if (stop.current) return;
        const key = `${fixture.id}:${model}:${language}`;
        setBusy(key);
        const selected = testModels.find((item) => item === model);
        if (!selected) throw new Error("Unknown model");
        const result = await generate({ data: { fixtureId: fixture.id, language, model: selected } });
        setResults((old) => ({ ...old, [key]: result }));
      }
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(""); }
  }
  return <section className="page-wide library-page space-y-8">
    <h1 className="question">{t.testReadings}</h1>
    {!user && <p><Link to="/login">{t.testAdmin}</Link></p>}
    <div className="flex flex-wrap items-center gap-4">
      <label><input type="checkbox" checked={compare} disabled={!!busy} onChange={(e) => setCompare(e.target.checked)} />{t.testCompare}</label>
      {models.slice(0, compare ? 2 : 1).map((model, i) => <label key={i}>{t.testModel} {i + 1}<select aria-label={`${t.testModel} ${i + 1}`} value={model} disabled={!!busy} onChange={(e) => setModels((old) => old.map((v, n) => n === i ? e.target.value : v))}>{testModels.map((m) => <option key={m}>{m}</option>)}</select></label>)}
      <Button disabled={!user || !!busy} onClick={() => void run()}>{t.testRunAll}</Button>
      {busy && <Button variant="secondary" onClick={() => { stop.current = true; }}>{t.testStop}</Button>}
    </div>
    {error && <p role="alert" className="field-error">{error}</p>}
    <div aria-live="polite">{busy ? t.testRunning : ""}</div>
    {fixtures.map((fixture) => <section key={fixture.id} className="border-t border-border pt-8 space-y-6">
      <h2 className="label">{fixture.id.toString().padStart(2, "0")} / {fixture.surface}</h2>
      <details><summary>{t.testPacket}</summary><pre className="whitespace-pre-wrap break-words text-sm">{JSON.stringify(fixture.packet, null, 2)}</pre></details>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {models.slice(0, compare ? 2 : 1).map((model) => <div key={model} className={compare ? "space-y-6 min-w-0" : "space-y-6 min-w-0 lg:col-span-2"}>
          <h3 className="label break-all">{model}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{(["en", "vi"] as Language[]).map((language) => {
            const result = results[`${fixture.id}:${model}:${language}`];
            const reason = result?.reason || (result?.output ? check(result.output, fixture.surface, language, signsFor(fixture.packet)) : null);
            return <div key={language} className="min-w-0 space-y-4">
              <h4 className="label">{language.toUpperCase()}</h4>
              {result ? <><p className={reason ? "field-error" : "label"}>{reason ? t.testFail : t.testPass}{reason ? ` — ${reason}` : ""}</p><p className="small muted">{t.testTries}: {result.tries} / {t.testHumanized}: {result.humanized ? t.testYes : t.testNo}</p>{result.output && <Output value={result.output} />}<Button variant="text" asChild><Link to="/dev/voice" search={{ text: JSON.stringify(result.output), lang: language, surface: fixture.surface }}>{t.testFake}</Link></Button></> : <p className="muted">{t.testWaiting}</p>}
              <details open><summary className="label muted">{t.testTarget}</summary>{fixture.target?.[language] ? <Output value={fixture.target[language]} /> : <p className="muted">{t.testNoTarget}</p>}</details>
            </div>;
          })}</div>
        </div>)}
      </div>
    </section>)}
  </section>;
}
export function DevVoice({ initial }: { initial: { text?: string; lang?: string; surface?: string } }) {
  const { t } = useLanguage();
  const [text, setText] = useState(initial.text ?? "");
  return <section className="page-wide library-page space-y-8"><h1 className="question">{t.testVoice}</h1><p role="status">{t.testStaged}</p><form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
    <label>{t.language}<select defaultValue={initial.lang ?? "en"}><option value="en">EN</option><option value="vi">VI</option></select></label>
    <label>{t.testSurface}<select defaultValue={initial.surface ?? "hook"}>{["hook", "chartLine", "answer"].map((value) => <option key={value}>{value}</option>)}</select></label>
    <label>{t.testText}<textarea className="w-full min-h-48" value={text} onChange={(e) => setText(e.target.value)} /></label>
    <label>{t.testComment}<textarea className="w-full min-h-24" /></label>
    <div className="flex flex-wrap gap-4"><Button disabled>{t.testGold}</Button><Button disabled variant="secondary">{t.testBad}</Button></div>
  </form></section>;
}