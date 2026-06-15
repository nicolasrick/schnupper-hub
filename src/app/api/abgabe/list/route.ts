import { NextResponse } from "next/server";
import { listAll, pruneAbgaben } from "@/lib/abgaben";

export const dynamic = "force-dynamic";

// Alle Abgaben (geschützt via middleware – nur Berufsbildner:in)
export async function GET() {
  await pruneAbgaben(24); // Datensparsamkeit: alte Abgaben automatisch entfernen
  return NextResponse.json(await listAll());
}
