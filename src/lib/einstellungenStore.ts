// Server-Store für die Einstellungen (Datei auf DATA_DIR, gleiches Muster wie
// teilnehmerStore/ergebnisse). Keine Secrets hier – die kommen in Phase 2 separat.

import { promises as fs } from "fs";
import path from "path";
import { Einstellungen, DEFAULT_EINSTELLUNGEN, mitDefaults } from "@/lib/einstellungen";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "einstellungen.json");

let queue: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(() => undefined, () => undefined);
  return run;
}

export async function readEinstellungen(): Promise<Einstellungen> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    return mitDefaults(JSON.parse(raw));
  } catch {
    return DEFAULT_EINSTELLUNGEN;
  }
}

export async function writeEinstellungen(roh: unknown): Promise<Einstellungen> {
  const safe = mitDefaults(roh);
  await withLock(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(safe, null, 2), "utf8");
  });
  return safe;
}
