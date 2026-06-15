"use client";

import { useState } from "react";
import { Card, BackBar, Button } from "./ui";

export function Abgabe({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [hochgeladen, setHochgeladen] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [fehler, setFehler] = useState("");

  async function laden(n: string) {
    try {
      const r = await fetch(`/api/abgabe?key=${encodeURIComponent(n)}`, { cache: "no-store" });
      const d = await r.json();
      setHochgeladen(d.dateien || []);
    } catch { /* ignore */ }
  }

  async function hochladen() {
    if (name.trim().length < 2 || files.length === 0) return;
    setBusy(true);
    setFehler("");
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      files.forEach((f) => fd.append("files", f));
      const r = await fetch("/api/abgabe", { method: "POST", body: fd });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        setFehler(e.error || "Upload fehlgeschlagen");
      } else {
        const d = await r.json();
        setHochgeladen(d.dateien || []);
        setFiles([]);
      }
    } catch {
      setFehler("Upload fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <BackBar title="Dateien abgeben" onBack={onBack} />

      <Card className="p-7 sm:p-9">
        <div className="text-4xl">📤</div>
        <h2 className="mt-3 text-2xl font-bold">Deine Arbeiten abgeben</h2>
        <p className="mt-2 leading-relaxed text-ink-soft">
          Lade hier deine erstellten Dateien hoch (z. B. dein Word-Dokument, die
          Excel-Liste, Screenshots). <strong>Dein:e Berufsbildner:in schaut sie sich an.</strong>
        </p>

        <label className="mt-6 block text-sm font-medium text-ink">Dein Name</label>
        <input
          value={name}
          onChange={(e) => { setName(e.target.value); }}
          onBlur={() => name.trim().length >= 2 && laden(name.trim())}
          placeholder="Vorname Nachname"
          className="mt-1 w-full rounded-2xl border border-line px-4 py-3 text-base outline-none focus:border-green focus:ring-4 focus:ring-green/20"
        />

        <label className="mt-4 block text-sm font-medium text-ink">Dateien auswählen</label>
        <input
          type="file"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="mt-1 block w-full text-sm text-ink-soft file:mr-4 file:rounded-full file:border-0 file:bg-green file:px-5 file:py-2.5 file:text-sm file:font-semibold file:text-white hover:file:bg-green-dark"
        />
        {files.length > 0 && (
          <p className="mt-2 text-sm text-ink-soft">{files.length} Datei(en) ausgewählt</p>
        )}

        {fehler && <p className="mt-3 text-sm text-red-500">{fehler}</p>}

        <div className="mt-5">
          <Button onClick={hochladen} disabled={busy || name.trim().length < 2 || files.length === 0}>
            {busy ? "Lädt hoch…" : "Hochladen"}
          </Button>
        </div>

        {hochgeladen.length > 0 && (
          <div className="mt-6 rounded-2xl bg-green-soft p-4">
            <p className="text-sm font-semibold text-green-dark">✅ Schon abgegeben ({hochgeladen.length})</p>
            <ul className="mt-2 space-y-1 text-sm text-ink">
              {hochgeladen.map((f) => <li key={f}>📄 {f}</li>)}
            </ul>
          </div>
        )}

        <p className="mt-6 text-xs leading-relaxed text-ink-soft">
          🔒 Die Dateien werden nur für diesen Tag aufbewahrt und danach gelöscht.
        </p>
      </Card>
    </div>
  );
}
