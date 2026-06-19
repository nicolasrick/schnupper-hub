// =============================================================================
//  Teilnehmer-Store (Server) — gemeinsame Quelle für Teilnehmer + Bewertungen.
//
//  Phase 1: löst die Admin-Daten vom Browser-localStorage (= 1 Gerät) und legt
//  sie serverseitig ab → Nicolas + Gioele sehen/bearbeiten denselben Stand,
//  geräteübergreifend. Gleiches bewährtes Muster wie ergebnisse.ts (Datei auf
//  dem Coolify-Volume DATA_DIR + Schreib-Lock). Später (produktiv) tauschbar
//  gegen Postgres — die API-Route /api/teilnehmer bleibt identisch.
// =============================================================================

import { promises as fs } from "fs";
import path from "path";
import type { Teilnehmer } from "@/lib/admin";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "teilnehmer.json");
const MAX = 2000; // Sicherheitskappe gegen Müll/Überlauf

let queue: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(() => undefined, () => undefined);
  return run;
}

export async function readTeilnehmer(): Promise<Teilnehmer[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/** Ganze Liste ersetzen (entspricht dem persist()-Muster im Admin). */
export async function writeTeilnehmer(list: unknown): Promise<Teilnehmer[]> {
  const safe = Array.isArray(list) ? (list as Teilnehmer[]).slice(0, MAX) : [];
  await withLock(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(safe, null, 2), "utf8");
  });
  return safe;
}
