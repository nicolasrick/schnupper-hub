// Einfacher Passwortschutz fürs Dashboard + sensible API.
// Passwort/Token via Umgebungsvariablen überschreibbar (in Produktion ÄNDERN!).

export const AUTH_COOKIE = "sh_auth";
export const ADMIN_PASSWORT = process.env.ADMIN_PASSWORT || "schnuppern";
// Cookie-Wert, der nach korrektem Login gesetzt wird (kein Klartext-Passwort im Cookie).
export const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "sg-hub-token-2026-bitte-aendern";

/** Cookie-Token aus einem rohen Cookie-Header prüfen (für Node-Route-Handler). */
export function istAuth(req: Request): boolean {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.match(/(?:^|;\s*)sh_auth=([^;]+)/);
  return m?.[1] === ADMIN_TOKEN;
}
