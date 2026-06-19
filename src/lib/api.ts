// Client-Helfer für die Server-API: Modus + (minimiertes) Check-Ergebnis.
// Gespeichert wird nur Vorname + Kennzahlen, kurzlebig + auto-gelöscht.

async function j<T>(url: string, opts?: RequestInit): Promise<T> {
  const r = await fetch(url, { cache: "no-store", ...opts });
  if (!r.ok) throw new Error(`${url} → ${r.status}`);
  return r.json() as Promise<T>;
}

export const api = {
  getModus: () => j<{ modus: string }>("/api/config").then((c) => c.modus),
  setModus: (modus: string) =>
    j<{ modus: string }>("/api/config", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ modus }),
    }),
  logout: () => fetch("/api/login", { method: "DELETE" }),

  // Check-Ergebnis (nur Vorname + Kennzahlen) an den Server – Fire-and-forget.
  saveErgebnis: (entry: Record<string, unknown>) =>
    fetch("/api/ergebnis", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(entry),
    }).catch(() => {}),

  // Gemeinsame Teilnehmer-Liste (Admin) – geräteübergreifend auf dem Server.
  ladeTeilnehmer: <T = unknown>() => j<T[]>("/api/teilnehmer"),
  speichereTeilnehmer: (liste: unknown[]) =>
    fetch("/api/teilnehmer", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(liste),
    }),
};
