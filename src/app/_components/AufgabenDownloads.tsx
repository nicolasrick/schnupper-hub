"use client";

import { useState } from "react";
import { AUFGABEN, DOWNLOADS, Aufgabe, AufgabeTool, Download } from "@/lib/content";
import { Card, BackBar } from "./ui";

const TOOL_LABEL: Record<AufgabeTool, string> = {
  OnlyOffice: "Office im Browser",
  Browser: "Browser",
  PowerShell: "PowerShell ISE",
  Scratch: "Scratch",
  Hardware: "Hands-on",
};

function findDownload(file: string): Download | undefined {
  return DOWNLOADS.find((d) => d.file === file);
}

function DownloadButton({ file }: { file: string }) {
  const d = findDownload(file);
  if (!d) return null;
  if (!d.vorhanden) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-line px-4 py-2 text-sm text-ink-soft">
        ⏳ {d.label} <span className="text-xs">· folgt vom Berufsbildner</span>
      </span>
    );
  }
  return (
    <a
      href={`/downloads/${d.file}`}
      download
      className="inline-flex items-center gap-2 rounded-full bg-green-soft px-4 py-2 text-sm font-semibold text-green-dark transition hover:bg-green hover:text-white"
    >
      ⬇ {d.label}
    </a>
  );
}

function AufgabeCard({ a }: { a: Aufgabe }) {
  const [offen, setOffen] = useState(false);
  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setOffen(!offen)}
        className="flex w-full items-center gap-4 p-5 text-left"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-green-soft text-2xl">
          {a.emoji}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold leading-tight">{a.titel}</span>
          <span className="mt-0.5 inline-block rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium text-ink-soft">
            {TOOL_LABEL[a.tool]}
          </span>
        </span>
        <span className={"shrink-0 text-ink-soft transition " + (offen ? "rotate-180" : "")}>▾</span>
      </button>

      {offen && (
        <div className="anim-in space-y-4 border-t border-line px-5 pb-5 pt-4">
          <p className="text-sm leading-relaxed text-ink">
            <span className="font-semibold">Ziel: </span>{a.ziel}
          </p>

          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">Schritte</p>
            <ol className="list-inside list-decimal space-y-1 text-sm leading-relaxed text-ink">
              {a.schritte.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </div>

          {a.hinweise.length > 0 && (
            <div className="rounded-2xl bg-amber/10 px-4 py-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber">Hinweise</p>
              <ul className="space-y-1 text-sm leading-relaxed text-ink">
                {a.hinweise.map((h, i) => <li key={i}>· {h}</li>)}
              </ul>
            </div>
          )}

          {a.tool === "OnlyOffice" && (
            <p className="rounded-2xl bg-green-soft px-4 py-3 text-sm text-green-dark">
              💡 Diese Aufgabe läuft im Browser-Office (OnlyOffice) – keine Word/Excel-Lizenz nötig.
              <span className="text-green-dark/70"> (Einbindung folgt, sobald der Server steht.)</span>
            </p>
          )}

          {a.downloads.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {a.downloads.map((f) => <DownloadButton key={f} file={f} />)}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export function AufgabenDownloads({ onBack }: { onBack: () => void }) {
  const [tag, setTag] = useState<1 | 2>(1);
  const aufgaben = AUFGABEN.filter((a) => a.tag === tag);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <BackBar title="Aufgaben & Downloads" onBack={onBack} />

      {/* Tag-Umschalter */}
      <div className="mb-5 inline-flex rounded-full bg-white/10 p-1">
        {([1, 2] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTag(t)}
            className={
              "rounded-full px-5 py-2 text-sm font-semibold transition " +
              (tag === t ? "bg-white text-ink" : "text-white/70 hover:text-white")
            }
          >
            Tag {t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {aufgaben.map((a) => <AufgabeCard key={a.id} a={a} />)}
      </div>

      <p className="mt-6 rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/70">
        🗂️ Lade dir die Gerüst-Dateien selbst herunter – kein Verteilen auf 16 Geräten nötig.
        {tag === 1 ? " Tag 1 ist vor allem Hands-on." : ""}
      </p>
    </div>
  );
}
