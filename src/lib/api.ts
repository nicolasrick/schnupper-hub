// Client-Helfer für die (datenarme) Server-API: nur der zentrale Modus.
// Personendaten werden NICHT zum Server geschickt – sie bleiben lokal.

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
};
