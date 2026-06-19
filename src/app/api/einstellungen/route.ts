import { NextResponse } from "next/server";
import { readEinstellungen, writeEinstellungen } from "@/lib/einstellungenStore";

export const dynamic = "force-dynamic";

// GET ist offen (keine Secrets) – Admin & App lesen die Konfiguration.
export async function GET() {
  return NextResponse.json(await readEinstellungen());
}

// PUT nur eingeloggt (Middleware) – Konfiguration ändern.
export async function PUT(req: Request) {
  const body = await req.json().catch(() => null);
  const saved = await writeEinstellungen(body);
  return NextResponse.json(saved);
}
