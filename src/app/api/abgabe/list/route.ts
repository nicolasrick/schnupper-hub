import { NextResponse } from "next/server";
import { listAll, pruneAbgaben } from "@/lib/abgaben";

export const dynamic = "force-dynamic";

// Alle Abgaben (geschützt via middleware – nur Berufsbildner:in)
export async function GET() {
  await pruneAbgaben(48); // Datensparsamkeit: alte Abgaben automatisch entfernen (2 Schnuppertage)
  return NextResponse.json(await listAll());
}
