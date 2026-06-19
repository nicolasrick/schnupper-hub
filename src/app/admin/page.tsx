"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Teilnehmer, Bewertung, STATIONEN, ladeTeilnehmer, speichereTeilnehmer,
  neuerTeilnehmer, vollerName, formatDatum, leereBewertung, standardArbeiten, schnuppertageRange,
} from "@/lib/admin";
import { MODI } from "@/lib/modi";
import { api } from "@/lib/api";
import type { ErgebnisEintrag } from "@/lib/ergebnisse";
import { Bestaetigung } from "../_components/admin/Bestaetigung";
import { MailVorlagen } from "../_components/admin/MailVorlagen";
import { Bewertungsbogen } from "../_components/admin/Bewertungsbogen";
import { Schnupperbericht } from "../_components/admin/Schnupperbericht";

type Modal = "none" | "bestaetigung" | "mail" | "bewertung" | "bericht";

// Datensparsamkeit: lokale Datensätze nach dieser Frist beim Laden entfernen
const RETENTION_TAGE = 30;

function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function pruneLocal(list: Teilnehmer[]): Teilnehmer[] {
  const cutoff = Date.now() - RETENTION_TAGE * 86_400_000;
  return list.filter((t) => {
    const ts = Date.parse(t.erstellt || "");
    return Number.isNaN(ts) ? true : ts >= cutoff;
  });
}

export default function AdminPage() {
  const router = useRouter();
  const [liste, setListe] = useState<Teilnehmer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>("none");
  const [modus, setModusState] = useState("schnuppertag");
  const [abgaben, setAbgaben] = useState<{ key: string; name: string; dateien: { name: string; size: number }[] }[]>([]);
  const [ergebnisse, setErgebnisse] = useState<ErgebnisEintrag[]>([]);

  function ladeAbgaben() {
    fetch("/api/abgabe/list", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then(setAbgaben)
      .catch(() => {});
  }
  function ladeErgebnisse() {
    fetch("/api/ergebnis", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then(setErgebnisse)
      .catch(() => {});
  }

  useEffect(() => {
    // Server ist die gemeinsame Quelle (geräteübergreifend). localStorage nur Offline-Cache.
    let aktiv = true;
    (async () => {
      const lokal = pruneLocal(ladeTeilnehmer());
      try {
        const serverListe = (await api.ladeTeilnehmer<Teilnehmer>()) as Teilnehmer[];
        if (!aktiv) return;
        if (serverListe.length === 0 && lokal.length > 0) {
          // Einmaliger Umzug: bestehende lokale Daten auf den Server heben (kein Verlust).
          setListe(lokal);
          if (lokal.length) setSelectedId((cur) => cur ?? lokal[0].id);
          api.speichereTeilnehmer(lokal).catch(() => {});
        } else {
          setListe(serverListe);
          speichereTeilnehmer(serverListe); // Cache aktualisieren
          if (serverListe.length) setSelectedId((cur) => cur ?? serverListe[0].id);
        }
      } catch {
        // Offline/Fehler → lokalen Cache verwenden
        if (!aktiv) return;
        setListe(lokal);
        if (lokal.length) setSelectedId((cur) => cur ?? lokal[0].id);
      }
    })();
    api.getModus().then(setModusState).catch(() => {});
    ladeAbgaben();
    ladeErgebnisse();
    const iv = setInterval(() => { ladeAbgaben(); ladeErgebnisse(); }, 15000); // live
    return () => { aktiv = false; clearInterval(iv); };
  }, []);

  const selected = liste.find((t) => t.id === selectedId) ?? null;

  // Schreibt sofort in den lokalen Cache (snappy/offline) + debounced auf den Server (gemeinsam).
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function persist(next: Teilnehmer[]) {
    setListe(next);
    speichereTeilnehmer(next);
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => { api.speichereTeilnehmer(next).catch(() => {}); }, 600);
  }

  // Manuell den Stand des anderen Geräts nachladen.
  async function aktualisiereListe() {
    try {
      const serverListe = (await api.ladeTeilnehmer<Teilnehmer>()) as Teilnehmer[];
      setListe(serverListe);
      speichereTeilnehmer(serverListe);
      setSelectedId((cur) => (cur && serverListe.some((t) => t.id === cur) ? cur : serverListe[0]?.id ?? null));
    } catch { /* offline → lokalen Stand behalten */ }
  }

  async function waehleModus(id: string) {
    setModusState(id);
    try { await api.setModus(id); } catch { /* ignore */ }
  }

  function anlegen() {
    const t = neuerTeilnehmer();
    persist([t, ...liste]);
    setSelectedId(t.id);
  }

  function aktualisiere(patch: Partial<Teilnehmer>) {
    if (!selected) return;
    persist(liste.map((t) => (t.id === selected.id ? { ...t, ...patch } : t)));
  }

  function loeschen() {
    if (!selected) return;
    const next = liste.filter((t) => t.id !== selected.id);
    persist(next);
    setSelectedId(next[0]?.id ?? null);
  }

  function exportieren() {
    const cols = ["Vorname", "Nachname", "E-Mail", "Schule", "Datum", "Anlass", "Stationen", "Bemerkung", "Besprochen"];
    const rows = liste.map((t) => [
      t.vorname, t.nachname, t.email, t.schule, t.datum, t.modus || "",
      t.stationen.length, (t.bemerkung || "").replace(/\n/g, " "), t.bewertung?.besprochen || "",
    ]);
    const csv = [cols, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")).join("\n");
    download("schnuppertage_export.csv", "﻿" + csv, "text/csv;charset=utf-8");
    download("schnuppertage_export.json", JSON.stringify(liste, null, 2), "application/json");
  }

  async function tagAbschliessen() {
    if (!window.confirm("Erst exportieren – dann ALLE Daten löschen (gemeinsame Teilnehmer-Liste auf dem Server + alle Abgaben). Fortfahren?")) return;
    exportieren();
    persist([]);
    setSelectedId(null);
    try { await fetch("/api/abgabe", { method: "DELETE" }); } catch { /* ignore */ }
    try { await fetch("/api/ergebnis", { method: "DELETE" }); } catch { /* ignore */ }
    setAbgaben([]);
    setErgebnisse([]);
  }

  async function abmelden() {
    try { await api.logout(); } catch { /* ignore */ }
    router.push("/admin/login");
  }

  function oeffneBewertung() {
    if (!selected) return;
    if (!selected.bewertung) aktualisiere({ bewertung: { ...leereBewertung(), arbeiten: standardArbeiten(), datumBis: schnuppertageRange() } });
    setModal("bewertung");
  }
  function bewertungAusErgebnis(e: ErgebnisEintrag) {
    const tn: Teilnehmer = { ...neuerTeilnehmer(), vorname: e.vorname, nachname: e.nachname || "", bewertung: { ...leereBewertung(), arbeiten: standardArbeiten(), datumBis: schnuppertageRange() } };
    persist([tn, ...liste]);
    setSelectedId(tn.id);
    setModal("bewertung");
  }
  function aktualisiereBewertung(patch: Partial<Bewertung>) {
    if (!selected) return;
    aktualisiere({ bewertung: { ...(selected.bewertung ?? leereBewertung()), ...patch } });
  }
  function oeffneBericht() {
    if (!selected) return;
    if (!selected.bericht) aktualisiere({ bericht: { beobachtungen: [], freitext: "" } });
    setModal("bericht");
  }

  function toggleStation(id: string) {
    if (!selected) return;
    const has = selected.stationen.includes(id);
    aktualisiere({ stationen: has ? selected.stationen.filter((s) => s !== id) : [...selected.stationen, id] });
  }

  return (
    <main className="flex-1 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard · Schnuppertage</h1>
            <p className="text-sm text-white/60">Anlass steuern · Bestätigung · Bewertung · Bericht · Mails</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a href="/api/export/zip" className="rounded-full bg-green px-4 py-2 text-sm font-semibold text-white hover:bg-green-dark">⬇ Alles als ZIP</a>
            <button onClick={exportieren} className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/20">⬇ Liste (CSV)</button>
            <button onClick={tagAbschliessen} className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/20">🔒 Tag abschliessen</button>
            <Link href="/" className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/20">Hub →</Link>
            <button onClick={abmelden} className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/60 hover:bg-white/20 hover:text-white">Abmelden</button>
          </div>
        </div>

        {/* Zentrale Modus-Steuerung (das Einzige, was zentral am Server liegt – keine Personendaten) */}
        <div className="mb-5 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-sm font-semibold text-white/80">Anlass (gilt für alle Geräte):</span>
            <div className="flex flex-wrap gap-1.5">
              {MODI.map((m) => (
                <button
                  key={m.id}
                  onClick={() => waehleModus(m.id)}
                  className={"rounded-full px-3 py-1.5 text-xs font-medium transition " + (m.id === modus ? "bg-green text-white" : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white")}
                >
                  {m.emoji} {m.label} <span className="text-white/40">· {m.dauer}</span>
                </button>
              ))}
            </div>
          </div>
          <p className="mt-2 text-xs text-white/40">
            🔒 Datensparsam: Auf dem Server liegen nur der Anlass + kurzlebige Check-Ergebnisse (Vorname + Kennzahlen, Auto-Löschung). Namen, Bericht & Bewertung bleiben <b>lokal auf diesem Gerät</b>. «Tag abschliessen» exportiert lokal & löscht alles Server-seitige.
          </p>
        </div>

        {/* Eignungs-Check-Ergebnisse (Server-Box, minimiert + kurzlebig) */}
        <div className="mb-5 rounded-3xl bg-surface p-5 shadow-2xl ring-1 ring-black/5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">🧭 Eignungs-Check ({ergebnisse.length})</h2>
            <button onClick={ladeErgebnisse} className="text-sm text-ink-soft hover:text-ink">↻ Aktualisieren</button>
          </div>
          {ergebnisse.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">Noch keine Ergebnisse. Sobald jemand die Berufswahl-Analyse abschliesst, erscheint hier Vorname + Kennzahlen – als Gesprächs-Hilfe.</p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {ergebnisse.map((e) => (
                <div key={e.id} className="rounded-2xl border border-line p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate font-semibold text-ink">{e.vorname}</span>
                    <span className="shrink-0 text-sm font-bold tabular-nums text-green">{e.passung}% Passung</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-soft">
                    <span>✅ {e.selbststaendig}/{e.total} selbstständig</span>
                    <span>💡 {e.tipps} Tipps</span>
                    {e.bonusGemacht && <span>🔥 Bonus {e.bonusSelbststaendig}/{e.bonusTotal}</span>}
                    {e.topFeld && <span>🏅 {e.topFeld}</span>}
                  </div>
                  {e.starkeTeile.length > 0 && (
                    <p className="mt-1.5 text-xs text-ink-soft">Stark in: {e.starkeTeile.join(", ")}</p>
                  )}
                  <button
                    onClick={() => bewertungAusErgebnis(e)}
                    className="mt-3 w-full rounded-full bg-green/10 px-3 py-1.5 text-xs font-semibold text-green-dark transition hover:bg-green/20"
                  >
                    → Bewertung anlegen
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-xs text-ink-soft">
            🔒 Nur Vorname + Kennzahlen (keine Einzelantworten). Wird automatisch nach ~48 h und mit «Tag abschliessen» gelöscht.
          </p>
        </div>

        {/* Abgaben der Kinder (Server-Box, kurzlebig) */}
        <div className="mb-5 rounded-3xl bg-surface p-5 shadow-2xl ring-1 ring-black/5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">📤 Abgaben ({abgaben.length})</h2>
            <button onClick={ladeAbgaben} className="text-sm text-ink-soft hover:text-ink">↻ Aktualisieren</button>
          </div>
          {abgaben.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">Noch keine Abgaben. Sobald ein Kind Dateien hochlädt, erscheinen sie hier – lade dann pro Kind die ZIP herunter und gib sie mit.</p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {abgaben.map((a) => (
                <div key={a.key} className="rounded-2xl border border-line p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-semibold text-ink">{a.name}</span>
                    <a
                      href={`/api/abgabe/zip?key=${encodeURIComponent(a.key)}`}
                      className="shrink-0 rounded-full bg-green px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-dark"
                    >
                      ⬇ ZIP
                    </a>
                  </div>
                  <ul className="mt-2 space-y-0.5 text-xs text-ink-soft">
                    {a.dateien.map((f) => (
                      <li key={f.name} className="truncate">📄 {f.name} <span className="text-ink-soft/60">({Math.max(1, Math.round(f.size / 1024))} KB)</span></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-5 md:grid-cols-[300px_1fr]">
          {/* Liste */}
          <div className="rounded-3xl bg-surface p-4 shadow-2xl ring-1 ring-black/5">
            <div className="mb-2 flex justify-end">
              <button onClick={aktualisiereListe} title="Stand vom Server / anderen Gerät laden" className="text-xs text-ink-soft hover:text-ink">↻ Aktualisieren</button>
            </div>
            <button onClick={anlegen} className="w-full rounded-2xl bg-green px-4 py-3 text-sm font-semibold text-white hover:bg-green-dark">+ Neue:r Teilnehmer:in</button>
            <div className="mt-3 space-y-1.5">
              {liste.length === 0 && <p className="px-2 py-6 text-center text-sm text-ink-soft">Noch niemand erfasst.</p>}
              {liste.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={"w-full rounded-2xl px-3 py-2.5 text-left transition " + (t.id === selectedId ? "bg-green-soft" : "hover:bg-black/5")}
                >
                  <span className="block truncate text-sm font-semibold text-ink">{vollerName(t)}</span>
                  <span className="block text-xs text-ink-soft">{formatDatum(t.datum)} · {t.stationen.length} Stationen</span>
                </button>
              ))}
            </div>
          </div>

          {/* Detail */}
          <div className="rounded-3xl bg-surface p-6 shadow-2xl ring-1 ring-black/5 sm:p-8">
            {!selected ? (
              <div className="grid h-full place-items-center py-16 text-center text-ink-soft">
                <div>
                  <div className="text-4xl">🗂️</div>
                  <p className="mt-3">Wähle links eine:n Teilnehmer:in oder lege neu an.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Vorname" value={selected.vorname} onChange={(v) => aktualisiere({ vorname: v })} />
                  <Field label="Nachname" value={selected.nachname} onChange={(v) => aktualisiere({ nachname: v })} />
                  <Field label="E-Mail" value={selected.email} onChange={(v) => aktualisiere({ email: v })} type="email" />
                  <Field label="Schule" value={selected.schule} onChange={(v) => aktualisiere({ schule: v })} />
                  <Field label="Datum" value={selected.datum} onChange={(v) => aktualisiere({ datum: v })} type="date" />
                  <Field label="Betreuer:in" value={selected.betreuer} onChange={(v) => aktualisiere({ betreuer: v })} />
                </div>

                <div className="mt-6">
                  <p className="mb-3 text-sm font-semibold text-ink">Bearbeitete Stationen</p>
                  {([1, 2] as const).map((tag) => (
                    <div key={tag} className="mb-3">
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">Tag {tag}</p>
                      <div className="grid gap-1.5 sm:grid-cols-2">
                        {STATIONEN.filter((s) => s.tag === tag).map((s) => {
                          const on = selected.stationen.includes(s.id);
                          return (
                            <label key={s.id} className={"flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition " + (on ? "border-green bg-green-soft text-green-dark" : "border-line hover:border-green/40")}>
                              <input type="checkbox" checked={on} onChange={() => toggleStation(s.id)} className="h-4 w-4 accent-[var(--green)]" />
                              {s.label}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <label className="mb-1 block text-sm font-medium text-ink">Bemerkung (für Bestätigung optional)</label>
                  <textarea value={selected.bemerkung} onChange={(e) => aktualisiere({ bemerkung: e.target.value })} rows={3} className="w-full rounded-2xl border border-line px-4 py-3 text-sm outline-none focus:border-green focus:ring-4 focus:ring-green/20" />
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <button onClick={loeschen} className="text-sm text-red-500 hover:text-red-600">Löschen</button>
                  <div className="flex flex-wrap gap-2.5">
                    <button onClick={() => setModal("mail")} className="rounded-full bg-black/5 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-black/10">✉ Mails</button>
                    <button onClick={oeffneBericht} className="rounded-full bg-black/5 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-black/10">📝 Schnupperbericht</button>
                    <button onClick={oeffneBewertung} className="rounded-full bg-black/5 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-black/10">📋 Bewertung</button>
                    <button onClick={() => setModal("bestaetigung")} className="rounded-full bg-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-dark">📄 Bestätigung</button>
                  </div>
                </div>
                <p className="mt-3 text-xs text-ink-soft">💾 Auf dem Server gespeichert – du &amp; Gioele teilen denselben Stand. Bericht/Bestätigung per Drucken → «Als PDF speichern» ablegen.</p>
              </>
            )}
          </div>
        </div>
      </div>

      {selected && modal === "bestaetigung" && <Bestaetigung t={selected} onClose={() => setModal("none")} />}
      {selected && modal === "mail" && <MailVorlagen t={selected} onClose={() => setModal("none")} />}
      {selected && modal === "bewertung" && (
        <Bewertungsbogen t={selected} bewertung={selected.bewertung ?? leereBewertung()} onChange={aktualisiereBewertung} onChangeT={aktualisiere} onClose={() => setModal("none")} />
      )}
      {selected && modal === "bericht" && (
        <Schnupperbericht t={selected} onChange={aktualisiere} onClose={() => setModal("none")} />
      )}
    </main>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-ink">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-2xl border border-line px-4 py-2.5 text-sm outline-none focus:border-green focus:ring-4 focus:ring-green/20" />
    </div>
  );
}
