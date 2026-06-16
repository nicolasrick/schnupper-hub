import { NextResponse } from "next/server";
import { saveErgebnis, listErgebnisse, deleteAllErgebnisse, sanitize } from "@/lib/ergebnisse";

export const dynamic = "force-dynamic";

// Offen: das Kind schickt sein Check-Ergebnis (nur Vorname + Kennzahlen).
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  await saveErgebnis(sanitize(body || {}));
  return NextResponse.json({ ok: true });
}

// Geschützt (Middleware): Dashboard liest die Liste.
export async function GET() {
  return NextResponse.json(await listErgebnisse());
}

// Geschützt: «Tag abschliessen» löscht alles.
export async function DELETE() {
  await deleteAllErgebnisse();
  return NextResponse.json({ ok: true });
}
