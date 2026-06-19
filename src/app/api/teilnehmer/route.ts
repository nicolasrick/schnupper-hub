import { NextResponse } from "next/server";
import { readTeilnehmer, writeTeilnehmer } from "@/lib/teilnehmerStore";

export const dynamic = "force-dynamic";

// Geschützt (Middleware: nur eingeloggt). Gemeinsame Teilnehmer-Liste.
export async function GET() {
  return NextResponse.json(await readTeilnehmer());
}

// Ganze Liste ersetzen (entspricht persist() im Admin – Last-Write-Wins).
export async function PUT(req: Request) {
  const body = await req.json().catch(() => null);
  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "erwarte_array" }, { status: 400 });
  }
  const saved = await writeTeilnehmer(body);
  return NextResponse.json({ ok: true, anzahl: saved.length });
}
