import { zipAlles } from "@/lib/abgaben";
import { listErgebnisse } from "@/lib/ergebnisse";

export const dynamic = "force-dynamic";

// Alles als EINE ZIP (geschützt via middleware): Eignungs-Check-Ergebnisse als
// CSV + alle hochgeladenen Abgaben. Praktisch fürs Einsammeln am Tagesende.
export async function GET() {
  const ergebnisse = await listErgebnisse();
  const cols = ["Vorname", "Passung %", "selbststaendig", "Aufgaben", "Tipps", "Bonus", "starke Teile", "staerkstes Feld"];
  const rows = ergebnisse.map((e) => [
    e.vorname,
    e.passung,
    e.selbststaendig,
    e.total,
    e.tipps,
    e.bonusGemacht ? `${e.bonusSelbststaendig}/${e.bonusTotal}` : "—",
    e.starkeTeile.join(" / "),
    e.topFeld,
  ]);
  const csv = [cols, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";"))
    .join("\n");

  const extra = ergebnisse.length
    ? [{ path: "eignungs-check-ergebnisse.csv", content: "﻿" + csv }]
    : [];
  const buf = await zipAlles(extra);

  return new Response(new Uint8Array(buf), {
    headers: {
      "content-type": "application/zip",
      "content-disposition": 'attachment; filename="schnuppertag-export.zip"',
      "cache-control": "no-store",
    },
  });
}
