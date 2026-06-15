// =============================================================================
//  Server-Speicher – DATENARM.
//
//  Der Server hält bewusst NUR den zentralen Modus (Anlass). Das sind KEINE
//  Personendaten. Alles Persönliche (Namen, Analyse-Resultate, Bericht,
//  Bewertung) bleibt lokal auf dem jeweiligen Gerät und wird heruntergeladen –
//  nichts davon wird hier gespeichert. So gibt es serverseitig nichts
//  Schützenswertes zu verwalten.
//  Daten-Verzeichnis via DATA_DIR überschreibbar (Coolify-Volume).
// =============================================================================

import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "config.json");

interface Config {
  modus: string;
}
const DEFAULT: Config = { modus: "schnuppertag" };

async function read(): Promise<Config> {
  try {
    const raw = await fs.readFile(DB_FILE, "utf8");
    const p = JSON.parse(raw);
    return { modus: p?.modus ?? "schnuppertag" };
  } catch {
    return { ...DEFAULT };
  }
}

let queue: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(() => undefined, () => undefined);
  return run;
}

export async function getConfig(): Promise<Config> {
  return read();
}

export async function setModus(modus: string): Promise<Config> {
  return withLock(async () => {
    const cfg = await read();
    cfg.modus = modus;
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DB_FILE, JSON.stringify(cfg, null, 2), "utf8");
    return cfg;
  });
}
