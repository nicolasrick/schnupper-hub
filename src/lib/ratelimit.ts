// Einfacher Brute-Force-Schutz für Login-Endpunkte (nur Node-Routes, nicht Middleware).
// In-Memory pro IP – reicht für die Einzel-Instanz auf Coolify.
import { createHash, timingSafeEqual } from "crypto";

type Eintrag = { fails: number; until: number; last: number };
const store = new Map<string, Eintrag>();

const FENSTER = 15 * 60_000;     // Zähl-Fenster: 15 min ohne Fehlversuch → Reset
const SCHWELLE = 5;              // ab dem 5. Fehlversuch wird gesperrt
const BASIS_SPERRE = 30_000;     // erste Sperre 30 s, danach Verdopplung
const MAX_SPERRE = 15 * 60_000;  // gedeckelt auf 15 min

function prune(now: number) {
  if (store.size < 5000) return;
  for (const [k, e] of store) if (e.until < now && now - e.last > FENSTER) store.delete(k);
}

/** Client-IP aus den Proxy-Headern (Coolify/Traefik setzt x-forwarded-for). */
export function ipVon(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unbekannt";
}

/** Verbleibende Sperrzeit in Sekunden (0 = nicht gesperrt). */
export function gesperrt(key: string): number {
  const e = store.get(key);
  if (!e) return 0;
  const now = Date.now();
  return e.until > now ? Math.ceil((e.until - now) / 1000) : 0;
}

export function fehlversuch(key: string): void {
  const now = Date.now();
  prune(now);
  const e = store.get(key);
  if (!e || now - e.last > FENSTER) {
    store.set(key, { fails: 1, until: 0, last: now });
    return;
  }
  e.fails += 1;
  e.last = now;
  if (e.fails >= SCHWELLE) {
    e.until = now + Math.min(MAX_SPERRE, BASIS_SPERRE * 2 ** (e.fails - SCHWELLE));
  }
}

export function erfolg(key: string): void {
  store.delete(key);
}

/** Konstantzeit-Vergleich (gegen Timing-Angriffe), längensicher via Hash. */
export function sicherGleich(a: string, b: string): boolean {
  const ha = createHash("sha256").update(String(a)).digest();
  const hb = createHash("sha256").update(String(b)).digest();
  return timingSafeEqual(ha, hb);
}

/** Kleine künstliche Verzögerung, um automatisiertes Raten zusätzlich zu bremsen. */
export function bremse(ms = 400): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
