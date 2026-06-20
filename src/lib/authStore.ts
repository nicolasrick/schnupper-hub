// Auth-Store (serverseitig, Datei auf Volume) – im Admin änderbar ohne Redeploy.
//  - Schüler-Zugangscode: Klartext (muss im Admin lesbar sein), Default env ZUGANGSCODE.
//  - Admin-Passwort: NUR als Hash (scrypt + Salt), nie im Klartext gespeichert.
// Bewusst NICHT im öffentlichen /api/einstellungen-GET.

import { promises as fs } from "fs";
import path from "path";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "auth.json");

type AuthDaten = { zugangscode?: string; adminSalt?: string; adminHash?: string };

let queue: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(() => undefined, () => undefined);
  return run;
}

async function lese(): Promise<AuthDaten> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as AuthDaten;
  } catch {
    return {};
  }
}

// Read-modify-write unter Lock, damit Zugangscode/Passwort sich nicht überschreiben.
async function merge(patch: Partial<AuthDaten>): Promise<AuthDaten> {
  return withLock(async () => {
    const aktuell = await lese();
    const next = { ...aktuell, ...patch };
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(next, null, 2), "utf8");
    return next;
  });
}

// --- Schüler-Zugangscode ------------------------------------------------------

export async function leseZugangscode(): Promise<string> {
  const d = await lese();
  if (typeof d.zugangscode === "string" && d.zugangscode) return d.zugangscode;
  return process.env.ZUGANGSCODE || "";
}

export async function setzeZugangscode(code: unknown): Promise<string> {
  const safe = String(code ?? "").trim().slice(0, 80);
  await merge({ zugangscode: safe });
  return safe;
}

// --- Admin-Passwort (gehasht) -------------------------------------------------

function hashPw(pw: string): { salt: string; hash: string } {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pw, salt, 64).toString("hex");
  return { salt, hash };
}

/** Prüft das Admin-Passwort: gegen den gespeicherten Hash, sonst gegen die Env. */
export async function pruefeAdminPasswort(pw: string): Promise<boolean> {
  const d = await lese();
  if (d.adminSalt && d.adminHash) {
    const kandidat = scryptSync(String(pw ?? ""), d.adminSalt, 64);
    const gespeichert = Buffer.from(d.adminHash, "hex");
    return kandidat.length === gespeichert.length && timingSafeEqual(kandidat, gespeichert);
  }
  // Noch kein eigenes Passwort gesetzt → Env-Default (Konstantzeit über Hash).
  const env = process.env.ADMIN_PASSWORT || "schnuppern";
  const a = scryptSync(String(pw ?? ""), "env", 64);
  const b = scryptSync(env, "env", 64);
  return timingSafeEqual(a, b);
}

/** Eigenes Admin-Passwort setzen (Hash speichern). */
export async function setzeAdminPasswort(pw: string): Promise<void> {
  const { salt, hash } = hashPw(String(pw));
  await merge({ adminSalt: salt, adminHash: hash });
}
