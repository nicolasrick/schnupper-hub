// Schüler-Zugangscode – serverseitig & im Admin änderbar (kein Redeploy nötig).
// Bewusst NICHT im öffentlichen /api/einstellungen-GET (das ist ein Geheimnis).
// Default: Umgebungsvariable ZUGANGSCODE (bestehender Wert), sonst leer.

import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "auth.json");

let queue: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(() => undefined, () => undefined);
  return run;
}

export async function leseZugangscode(): Promise<string> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const obj = JSON.parse(raw);
    const code = typeof obj?.zugangscode === "string" ? obj.zugangscode : "";
    if (code) return code;
  } catch { /* keine Datei → Default */ }
  return process.env.ZUGANGSCODE || "";
}

export async function setzeZugangscode(code: unknown): Promise<string> {
  const safe = String(code ?? "").trim().slice(0, 80);
  await withLock(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(FILE, JSON.stringify({ zugangscode: safe }, null, 2), "utf8");
  });
  return safe;
}
