// =============================================================================
//  Abgabe-Box (Sammeln der Arbeits-Dateien während des Tages)
//
//  Die Kinder laden ihre Werke hoch (Gerät wird ggf. gewipt). Am Ende lädt
//  der/die Betreuer:in pro Kind eine ZIP herunter und gibt sie mit.
//  Kurzlebig: «Tag abschliessen» löscht alles, ausserdem Auto-Prune.
//  Liegt unter DATA_DIR/abgaben/<key>/ (Volume auf Coolify mounten).
// =============================================================================

import { promises as fs } from "fs";
import path from "path";
import JSZip from "jszip";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), ".data");
const ROOT = path.join(DATA_DIR, "abgaben");

export function safeKey(name: string): string {
  const k = (name || "").trim().toLowerCase().replace(/[^a-z0-9äöü]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
  return k || "ohne-name";
}
function safeFile(name: string): string {
  return path.basename(name || "datei").replace(/[^\w.\- äöüÄÖÜ]+/g, "_").slice(0, 120) || "datei";
}

export async function saveAbgabe(name: string, filename: string, buf: Buffer): Promise<void> {
  const key = safeKey(name);
  const dir = path.join(ROOT, key);
  await fs.mkdir(dir, { recursive: true });
  // Anzeigenamen merken
  await fs.writeFile(path.join(dir, "_name.txt"), name.trim(), "utf8").catch(() => {});
  // Kollisionen vermeiden: bei gleichem Namen Suffix anhängen
  let target = safeFile(filename);
  let i = 1;
  while (await fs.access(path.join(dir, target)).then(() => true).catch(() => false)) {
    const ext = path.extname(target);
    const base = target.slice(0, target.length - ext.length);
    target = `${base}-${i}${ext}`;
    i++;
  }
  await fs.writeFile(path.join(dir, target), buf);
}

export async function listForKey(key: string): Promise<string[]> {
  try {
    const files = await fs.readdir(path.join(ROOT, safeKey(key)));
    return files.filter((f) => f !== "_name.txt");
  } catch {
    return [];
  }
}

export interface AbgabeEintrag {
  key: string;
  name: string;
  dateien: { name: string; size: number }[];
}

export async function listAll(): Promise<AbgabeEintrag[]> {
  let keys: string[];
  try {
    keys = await fs.readdir(ROOT);
  } catch {
    return [];
  }
  const out: AbgabeEintrag[] = [];
  for (const key of keys) {
    const dir = path.join(ROOT, key);
    const stat = await fs.stat(dir).catch(() => null);
    if (!stat?.isDirectory()) continue;
    const name = await fs.readFile(path.join(dir, "_name.txt"), "utf8").catch(() => key);
    const files = (await fs.readdir(dir)).filter((f) => f !== "_name.txt");
    const dateien = await Promise.all(
      files.map(async (f) => ({ name: f, size: (await fs.stat(path.join(dir, f)).catch(() => null))?.size ?? 0 }))
    );
    out.push({ key, name: name.trim() || key, dateien });
  }
  return out;
}

export async function zipForKey(key: string): Promise<Buffer | null> {
  const k = safeKey(key);
  const dir = path.join(ROOT, k);
  let files: string[];
  try {
    files = (await fs.readdir(dir)).filter((f) => f !== "_name.txt");
  } catch {
    return null;
  }
  if (files.length === 0) return null;
  const zip = new JSZip();
  for (const f of files) {
    zip.file(f, await fs.readFile(path.join(dir, f)));
  }
  return zip.generateAsync({ type: "nodebuffer" });
}

export async function deleteAllAbgaben(): Promise<void> {
  await fs.rm(ROOT, { recursive: true, force: true });
}

/** Auto-Prune: Abgabe-Ordner älter als `stunden` entfernen. */
export async function pruneAbgaben(stunden: number): Promise<void> {
  let keys: string[];
  try {
    keys = await fs.readdir(ROOT);
  } catch {
    return;
  }
  const cutoff = Date.now() - stunden * 3_600_000;
  for (const key of keys) {
    const dir = path.join(ROOT, key);
    const stat = await fs.stat(dir).catch(() => null);
    if (stat && stat.mtimeMs < cutoff) await fs.rm(dir, { recursive: true, force: true });
  }
}
