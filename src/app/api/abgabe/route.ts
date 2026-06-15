import { NextResponse } from "next/server";
import { saveAbgabe, listForKey, deleteAllAbgaben, pruneAbgaben } from "@/lib/abgaben";

export const dynamic = "force-dynamic";

const MAX_FILE = 25 * 1024 * 1024; // 25 MB pro Datei

// Upload (offen – Kinder geben ihre Werke ab)
export async function POST(req: Request) {
  const form = await req.formData();
  const name = String(form.get("name") || "").trim();
  if (name.length < 2) return NextResponse.json({ error: "name fehlt" }, { status: 400 });

  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) return NextResponse.json({ error: "keine datei" }, { status: 400 });

  for (const f of files) {
    if (f.size > MAX_FILE) return NextResponse.json({ error: `${f.name} zu gross (max 25 MB)` }, { status: 413 });
    const buf = Buffer.from(await f.arrayBuffer());
    await saveAbgabe(name, f.name, buf);
  }
  return NextResponse.json({ ok: true, dateien: await listForKey(name) });
}

// Eigene Liste (offen – das Kind sieht, was es abgegeben hat)
export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("key") || "";
  return NextResponse.json({ dateien: await listForKey(key) });
}

// Alles löschen (geschützt via middleware) – «Tag abschliessen»
export async function DELETE() {
  await deleteAllAbgaben();
  return NextResponse.json({ ok: true });
}

// Auto-Prune bei Bedarf von aussen anstossbar (geschützt via middleware)
export async function PATCH() {
  await pruneAbgaben(24);
  return NextResponse.json({ ok: true });
}
