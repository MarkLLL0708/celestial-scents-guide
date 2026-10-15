import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/provider";
import { useAccount } from "@/data/auth";
import * as cloud from "@/data/library.functions";
import { kinds, listKeys, type LibraryKind } from "@/lib/library/keys";
import { ScentDialog } from "@/components/scent/dialog";
import { StateMessage } from "./shared";
import { Skeleton } from "@/components/scent/controls";
export function LibraryPage() {
  const { t } = useLanguage();
  const account = useAccount();
  const client = useQueryClient();
  const rowsFn = useServerFn(cloud.libraryRows),
    generate = useServerFn(cloud.generateLibrary),
    edit = useServerFn(cloud.editLibrary),
    remove = useServerFn(cloud.deleteLibrary),
    resume = useServerFn(cloud.resumeLibrary);
  const q = useQuery({
    queryKey: ["library-admin", account.user?.id],
    queryFn: () => rowsFn(),
    enabled: !!account.user,
  });
  const [kind, setKind] = useState<LibraryKind>("trait_line"),
    [lang, setLang] = useState<"en" | "vi">("en"),
    [status, setStatus] = useState("all"),
    [flagged, setFlagged] = useState(false),
    [search, setSearch] = useState(""),
    [confirm, setConfirm] = useState(false),
    [busy, setBusy] = useState(false),
    [progress, setProgress] = useState(0),
    [error, setError] = useState("");
  const stop = useRef(false);
  const rows = q.data?.rows ?? [];
  const filtered = rows.filter(
    (r) =>
      r.kind === kind &&
      r.lang === lang &&
      (status === "all" || r.status === status) &&
      (!flagged || r.flags.length > 0) &&
      `${r.key} ${r.body}`.toLowerCase().includes(search.toLowerCase()),
  );
  const missing = listKeys(kind)
    .filter((key) => !rows.some((r) => r.kind === kind && r.lang === lang && r.key === key))
    .slice(0, 200);
  const refresh = () => client.invalidateQueries({ queryKey: ["library-admin"] });
  const run = async (keys: string[], regenerate = false) => {
    setConfirm(false);
    setBusy(true);
    setError("");
    setProgress(0);
    stop.current = false;
    try {
      for (let i = 0; i < keys.length && !stop.current; i += 8) {
        await generate({ data: { kind, lang, keys: keys.slice(i, i + 8), regenerate } });
        setProgress(Math.min(i + 8, keys.length));
        await refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t.accountError);
    } finally {
      setBusy(false);
    }
  };
  const action = async (fn: () => Promise<unknown>) => {
    setError("");
    try {
      await fn();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : t.accountError);
    }
  };
  if (!account.user)
    return (
      <div className="wide">
        <StateMessage message={t.adminOnly}>
          <Button asChild>
            <Link to="/login">{t.login}</Link>
          </Button>
        </StateMessage>
      </div>
    );
  if (q.isPending)
    return (
      <div className="wide">
        <Skeleton />
      </div>
    );
  if (q.isError)
    return (
      <div className="wide">
        <StateMessage message={t.adminOnly} retry={() => void q.refetch()} />
      </div>
    );
  return (
    <div className="wide stack">
      <h1 className="xl">{t.libraryTitle}</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th>{t.libraryKind}</th>
              <th>EN</th>
              <th>VI</th>
            </tr>
          </thead>
          <tbody>
            {kinds.map((k) => (
              <tr key={k}>
                <td>{k}</td>
                {(["en", "vi"] as const).map((l) => (
                  <td key={l}>
                    {t.libraryDraft}:{" "}
                    {
                      rows.filter((r) => r.kind === k && r.lang === l && r.status === "draft")
                        .length
                    }{" "}
                    · {t.libraryApproved}:{" "}
                    {
                      rows.filter((r) => r.kind === k && r.lang === l && r.status === "approved")
                        .length
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-4">
        <label>
          {t.libraryKind}
          <select value={kind} onChange={(e) => setKind(e.target.value as LibraryKind)}>
            {kinds.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </label>
        <label>
          {t.language}
          <select value={lang} onChange={(e) => setLang(e.target.value as "en" | "vi")}>
            <option value="en">EN</option>
            <option value="vi">VI</option>
          </select>
        </label>
        <label>
          {t.libraryStatus}
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">{t.libraryAll}</option>
            <option value="draft">{t.libraryDraft}</option>
            <option value="approved">{t.libraryApproved}</option>
          </select>
        </label>
        <label>
          <input type="checkbox" checked={flagged} onChange={(e) => setFlagged(e.target.checked)} />
          {t.libraryFlagged}
        </label>
        <label>
          {t.librarySearch}
          <input value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
      </div>
      {q.data?.pause && (
        <div role="alert">
          <p>{q.data.pause}</p>
          <Button onClick={() => action(() => resume())}>{t.libraryResume}</Button>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <Button
          disabled={busy || !missing.length || !!q.data?.pause}
          onClick={() => setConfirm(true)}
        >
          {t.libraryGenerate}
        </Button>
        <Button
          variant="secondary"
          disabled={busy}
          onClick={() =>
            action(async () => {
              for (const r of filtered.filter((r) => !r.flags.length))
                await edit({ data: { id: r.id, body: r.body, approve: true } });
            })
          }
        >
          {t.libraryApproveAll}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            const csv = [
              ["kind", "key", "lang", "body", "status", "flags", "model"],
              ...rows.map((r) => [
                r.kind,
                r.key,
                r.lang,
                r.body,
                r.status,
                r.flags.join(";"),
                r.model,
              ]),
            ]
              .map((row) => row.map((v) => `"${v.replaceAll('"', '""')}"`).join(","))
              .join("\n");
            const a = document.createElement("a");
            a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
            a.download = "natal-notes-library.csv";
            a.click();
            URL.revokeObjectURL(a.href);
          }}
        >
          {t.libraryExport}
        </Button>
        {busy && (
          <Button
            variant="secondary"
            onClick={() => {
              stop.current = true;
            }}
          >
            {t.libraryStop}
          </Button>
        )}
      </div>
      {busy && (
        <div role="status">
          <progress max={Math.max(1, missing.length)} value={progress} />
          <p>
            {progress} / {missing.length}
          </p>
        </div>
      )}
      {error && <p role="alert">{error}</p>}
      {!filtered.length && <p className="muted">{t.libraryEmpty}</p>}
      {filtered.map((r) => (
        <section className="section stack" key={r.id}>
          <p className="label">
            {r.key} · {r.status}
          </p>
          {r.kind === "ask_answer" && <p>{questionText(r.key, t)}</p>}
          <label className="stack">
            {t.libraryBody}
            <textarea
              className="w-full min-h-24"
              defaultValue={r.body}
              key={`${r.id}-${r.updated_at}`}
              id={`body-${r.id}`}
            />
          </label>
          <p className="small muted">{r.flags.join(", ") || t.libraryNoFlags}</p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() =>
                action(() =>
                  edit({
                    data: {
                      id: r.id,
                      body: (document.getElementById(`body-${r.id}`) as HTMLTextAreaElement).value,
                      approve: false,
                    },
                  }),
                )
              }
            >
              {t.save}
            </Button>
            <Button
              disabled={!!r.flags.length}
              onClick={() =>
                action(() =>
                  edit({
                    data: {
                      id: r.id,
                      body: (document.getElementById(`body-${r.id}`) as HTMLTextAreaElement).value,
                      approve: true,
                    },
                  }),
                )
              }
            >
              {t.libraryApprove}
            </Button>
            <Button variant="secondary" disabled={busy} onClick={() => run([r.key], true)}>
              {t.libraryRegenerate}
            </Button>
            <Button variant="text" onClick={() => action(() => remove({ data: { id: r.id } }))}>
              {t.libraryDelete}
            </Button>
          </div>
        </section>
      ))}
      <ScentDialog
        open={confirm}
        onOpenChange={setConfirm}
        title={t.libraryGenerate}
        description={t.libraryConfirm.replace("{n}", String(missing.length))}
      >
        <Button onClick={() => run(missing)}>{t.continue}</Button>
      </ScentDialog>
    </div>
  );
}
function questionText(key: string, t: import("@/i18n/en").Dictionary) {
  const [theme, n] = key.split(".")[0].split("-");
  const num = Number(n);
  const k =
    `q${theme[0].toUpperCase() + theme.slice(1)}${theme === "work" && num <= 4 ? `${num}b` : num}` as keyof typeof t;
  return t[k] ?? key;
}
