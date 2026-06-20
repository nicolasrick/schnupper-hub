"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Einstellungen, DEFAULT_EINSTELLUNGEN, EinStation } from "@/lib/einstellungen";

type Status = "" | "speichern" | "ok" | "fehler";

export default function EinstellungenPage() {
  const [e, setE] = useState<Einstellungen>(DEFAULT_EINSTELLUNGEN);
  const [zugangscode, setZugangscode] = useState("");
  const [geladen, setGeladen] = useState(false);
  const [status, setStatus] = useState<Status>("");

  // Admin-Passwort ändern (eigene Aktion, getrennt vom Speichern).
  const [pwAktuell, setPwAktuell] = useState("");
  const [pwNeu, setPwNeu] = useState("");
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwBusy, setPwBusy] = useState(false);
  async function passwortAendern() {
    setPwBusy(true);
    setPwMsg(null);
    try {
      const res = await api.aendereAdminPasswort(pwAktuell, pwNeu);
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setPwMsg({ ok: true, text: "✓ Passwort geändert." });
        setPwAktuell("");
        setPwNeu("");
      } else {
        setPwMsg({ ok: false, text: data?.message || "Änderung fehlgeschlagen." });
      }
    } catch {
      setPwMsg({ ok: false, text: "Netzwerkfehler." });
    } finally {
      setPwBusy(false);
    }
  }

  useEffect(() => {
    Promise.all([
      api.ladeEinstellungen<Einstellungen>().then((d) => setE(d)).catch(() => {}),
      api.ladeZugangscode().then((c) => setZugangscode(c)).catch(() => {}),
    ]).finally(() => setGeladen(true));
  }, []);

  const setBetrieb = (patch: Partial<Einstellungen["betrieb"]>) =>
    setE((cur) => ({ ...cur, betrieb: { ...cur.betrieb, ...patch } }));

  async function speichern() {
    setStatus("speichern");
    try {
      const [gespeichert] = await Promise.all([
        api.speichereEinstellungen<Einstellungen>(e),
        api.speichereZugangscode(zugangscode),
      ]);
      setE(gespeichert);
      setStatus("ok");
      setTimeout(() => setStatus(""), 2500);
    } catch {
      setStatus("fehler");
    }
  }

  // Verantwortliche
  const setVerant = (i: number, v: string) =>
    setE((cur) => ({ ...cur, verantwortliche: cur.verantwortliche.map((x, j) => (j === i ? v : x)) }));
  const addVerant = () => setE((cur) => ({ ...cur, verantwortliche: [...cur.verantwortliche, ""] }));
  const delVerant = (i: number) =>
    setE((cur) => ({ ...cur, verantwortliche: cur.verantwortliche.filter((_, j) => j !== i) }));

  // Stationen
  const setStation = (i: number, label: string) =>
    setE((cur) => ({ ...cur, stationen: cur.stationen.map((s, j) => (j === i ? { ...s, label } : s)) }));
  const addStation = () =>
    setE((cur) => ({ ...cur, stationen: [...cur.stationen, { id: "neu-" + cur.stationen.length, label: "" } as EinStation] }));
  const delStation = (i: number) =>
    setE((cur) => ({ ...cur, stationen: cur.stationen.filter((_, j) => j !== i) }));

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">⚙ Einstellungen</h1>
          <p className="text-sm text-white/70">Eigene Daten hinterlegen – ohne Code. Gilt für Bewertung, Bericht &amp; Bestätigung.</p>
        </div>
        <Link href="/admin" className="shrink-0 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/20">← Dashboard</Link>
      </div>

      {!geladen ? (
        <p className="text-white/70">Lädt …</p>
      ) : (
        <div className="space-y-6">
          {/* Betrieb */}
          <Box titel="Betrieb">
            <Feld label="Name" value={e.betrieb.name} onChange={(v) => setBetrieb({ name: v })} />
            <Feld label="Adresse" value={e.betrieb.adresse} onChange={(v) => setBetrieb({ adresse: v })} />
            <Feld label="Beruf" value={e.betrieb.beruf} onChange={(v) => setBetrieb({ beruf: v })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Feld label="Ort" value={e.betrieb.ort} onChange={(v) => setBetrieb({ ort: v })} />
              <Feld label="Kontakt-Mail" value={e.betrieb.kontaktMail} onChange={(v) => setBetrieb({ kontaktMail: v })} type="email" />
            </div>
          </Box>

          {/* Titel */}
          <Box titel="Bezeichnung">
            <Feld label="Titel des Anlasses" value={e.titel} onChange={(v) => setE((cur) => ({ ...cur, titel: v }))} />
          </Box>

          {/* Verantwortliche */}
          <Box titel="Verantwortliche (Dropdown im Bewertungsbogen)">
            <div className="space-y-2">
              {e.verantwortliche.map((v, i) => (
                <div key={i} className="flex gap-2">
                  <input value={v} onChange={(ev) => setVerant(i, ev.target.value)} placeholder="Name"
                    className="flex-1 rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/20" />
                  <button onClick={() => delVerant(i)} className="rounded-xl px-3 text-sm text-red-500 hover:bg-red-50">✕</button>
                </div>
              ))}
            </div>
            <button onClick={addVerant} className="mt-2 text-sm font-medium text-green hover:text-green-dark">+ Person hinzufügen</button>
          </Box>

          {/* Stationen */}
          <Box titel="Stationen / Tätigkeiten">
            <div className="space-y-2">
              {e.stationen.map((s, i) => (
                <div key={s.id + i} className="flex gap-2">
                  <input value={s.label} onChange={(ev) => setStation(i, ev.target.value)} placeholder="Tätigkeit"
                    className="flex-1 rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/20" />
                  <button onClick={() => delStation(i)} className="rounded-xl px-3 text-sm text-red-500 hover:bg-red-50">✕</button>
                </div>
              ))}
            </div>
            <button onClick={addStation} className="mt-2 text-sm font-medium text-green hover:text-green-dark">+ Station hinzufügen</button>
          </Box>

          {/* Schüler-Login */}
          <Box titel="Schüler-Login (Zugangscode)">
            <Feld label="Code für die Teilnehmer-Startseite" value={zugangscode} onChange={setZugangscode} />
            <p className="text-xs text-ink-soft">
              Diesen Code geben die Schüler/innen auf der Startseite ein. Leer lassen = Gate weiterhin aktiv,
              aber ohne gültigen Code kommt niemand rein. Nach dem Ändern müssen sich alle neu einloggen.
            </p>
          </Box>

          {/* Admin-Passwort */}
          <Box titel="Admin-Passwort">
            <div className="grid gap-3 sm:grid-cols-2">
              <Feld label="Aktuelles Passwort" value={pwAktuell} onChange={setPwAktuell} type="password" />
              <Feld label="Neues Passwort (min. 6 Zeichen)" value={pwNeu} onChange={setPwNeu} type="password" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={passwortAendern} disabled={pwBusy || !pwAktuell || pwNeu.trim().length < 6}
                className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-40">
                {pwBusy ? "Ändert …" : "Passwort ändern"}
              </button>
              {pwMsg && <span className={"text-sm font-medium " + (pwMsg.ok ? "text-green" : "text-red-500")}>{pwMsg.text}</span>}
            </div>
            <p className="text-xs text-ink-soft">Wird nur als Hash gespeichert (nie im Klartext). Du bleibst eingeloggt.</p>
          </Box>

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={speichern} disabled={status === "speichern"}
              className="rounded-full bg-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-dark disabled:opacity-50">
              {status === "speichern" ? "Speichert …" : "Speichern"}
            </button>
            {status === "ok" && <span className="text-sm font-medium text-green">✓ Gespeichert</span>}
            {status === "fehler" && <span className="text-sm font-medium text-red-500">Fehler beim Speichern</span>}
            <Link href="/admin" className="ml-auto rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white/90 hover:bg-white/20">← Zurück zum Dashboard</Link>
          </div>
        </div>
      )}
    </main>
  );
}

function Box({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-surface p-5 shadow-xl ring-1 ring-black/5 sm:p-6">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-green">{titel}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Feld({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-green focus:ring-2 focus:ring-green/20" />
    </div>
  );
}
