import { NextResponse } from "next/server";
import { pruefeAdminPasswort, setzeAdminPasswort } from "@/lib/authStore";
import { bremse } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

// Admin-only (Middleware): Admin-Passwort ändern. Braucht das aktuelle Passwort.
export async function PUT(req: Request) {
  const body = await req.json().catch(() => ({}));
  const aktuell = String(body?.aktuell ?? "");
  const neu = String(body?.neu ?? "");

  if (neu.trim().length < 6) {
    return NextResponse.json({ ok: false, error: "zu_kurz", message: "Neues Passwort: mindestens 6 Zeichen." }, { status: 400 });
  }
  if (!(await pruefeAdminPasswort(aktuell))) {
    await bremse();
    return NextResponse.json({ ok: false, error: "falsch", message: "Aktuelles Passwort stimmt nicht." }, { status: 401 });
  }

  await setzeAdminPasswort(neu.trim());
  return NextResponse.json({ ok: true });
}
