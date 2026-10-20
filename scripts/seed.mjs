// Run: SUPABASE_URL=https://celestial-scents-guide.lovable.app SUPABASE_ANON_KEY=... node scripts/seed.mjs
const URL = process.env.SUPABASE_URL + "/api/public/write-reading";
const KEY = process.env.SUPABASE_ANON_KEY;
const planets = ["Sun","Moon","Mercury","Venus","Mars","Jupiter","Saturn"];
const signs = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const jobs = [];
for (const language of ["en","vi"]) for (const planet of planets) for (const sign of signs) for (let house = 1; house <= 12; house++) jobs.push({ planet, sign, house, language });

let done = 0, failed = [];
async function worker() {
  while (jobs.length) {
    const j = jobs.pop();
    try {
      const r = await fetch(URL, { method: "POST", headers: { "content-type": "application/json", apikey: KEY, authorization: "Bearer " + KEY }, body: JSON.stringify(j) });
      if (!r.ok) throw new Error(r.status + " " + (await r.text()));
    } catch (e) { failed.push({ ...j, error: String(e) }); }
    if (++done % 50 === 0) console.log(done, "done,", failed.length, "failed");
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
console.log("finished. failed:", failed.length);
if (failed.length) console.log(JSON.stringify(failed.slice(0, 10), null, 2));