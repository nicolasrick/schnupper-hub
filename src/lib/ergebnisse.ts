// =============================================================================
//  Eignungs-Check-Ergebnisse — bewusst MINIMIERT + KURZLEBIG.
//
//  Gespeichert wird nur, was der/die Berufsbildner:in fürs Gespräch braucht:
//  Vor- + Nachname (für die Auswertung) + Kennzahlen des Checks (Passung,
//  selbstständig gelöst, Tipps, starke Teile, Bonus). KEINE Einzelantworten.
//  Auto-Prune nach PRUNE_STUNDEN; «Tag abschliessen» löscht alles.
//  Liegt unter DATA_DIR/ergebnisse.json (Coolify-Volume mounten!).
// =============================================================================

import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "ergebnisse.json");
const PRUNE_STUNDEN = Number(process.env.ERGEBNIS_STUNDEN || 48);

export interface ErgebnisEintrag {
  id: string;
  vorname: string;
  nachname: string;
  ts: number;
  passung: number;
  selbststaendig: number;
  total: number;
  tipps: number;
  starkeTeile: string[];
  topFeld: string;
  bonusGemacht: boolean;
  bonusSelbststaendig: number;
  bonusTotal: number;
}

function clampStr(v: unknown, max: number): string {
  return String(v ?? "").slice(0, max);
}
function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Eingehende (offene) Daten hart säubern – Datensparsamkeit + kein Müll. */
export function sanitize(raw: Record<string, unknown>): ErgebnisEintrag {
  const teile = Array.isArray(raw.starkeTeile) ? raw.starkeTeile.slice(0, 6).map((t) => clampStr(t, 40)) : [];
  return {
    id: clampStr(raw.id, 40) || Math.random().toString(36).slice(2),
    vorname: clampStr(raw.vorname, 40) || "—",
    nachname: clampStr(raw.nachname, 40),
    ts: Date.now(),
    passung: Math.max(0, Math.min(100, Math.round(num(raw.passung)))),
    selbststaendig: Math.max(0, Math.round(num(raw.selbststaendig))),
    total: Math.max(0, Math.round(num(raw.total))),
    tipps: Math.max(0, Math.round(num(raw.tipps))),
    starkeTeile: teile,
    topFeld: clampStr(raw.topFeld, 40),
    bonusGemacht: !!raw.bonusGemacht,
    bonusSelbststaendig: Math.max(0, Math.round(num(raw.bonusSelbststaendig))),
    bonusTotal: Math.max(0, Math.round(num(raw.bonusTotal))),
  };
}

async function read(): Promise<ErgebnisEintrag[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

let queue: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(() => undefined, () => undefined);
  return run;
}

function frisch(list: ErgebnisEintrag[]): ErgebnisEintrag[] {
  const cutoff = Date.now() - PRUNE_STUNDEN * 3_600_000;
  return list.filter((e) => typeof e.ts === "number" && e.ts >= cutoff);
}

export async function saveErgebnis(entry: ErgebnisEintrag): Promise<void> {
  await withLock(async () => {
    const list = frisch(await read());
    list.push(entry);
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(list, null, 2), "utf8");
  });
}

/** Liste fürs Dashboard – prunt nebenbei alte Einträge weg (neueste zuerst). */
export async function listErgebnisse(): Promise<ErgebnisEintrag[]> {
  return withLock(async () => {
    const list = await read();
    const fr = frisch(list);
    if (fr.length !== list.length) {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(FILE, JSON.stringify(fr, null, 2), "utf8");
    }
    return [...fr].sort((a, b) => b.ts - a.ts);
  });
}

export async function deleteAllErgebnisse(): Promise<void> {
  await withLock(async () => {
    await fs.rm(FILE, { force: true });
  });
}
