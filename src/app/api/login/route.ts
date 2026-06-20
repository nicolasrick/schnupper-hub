import { NextResponse } from "next/server";
import { ADMIN_TOKEN, AUTH_COOKIE } from "@/lib/auth";
import { pruefeAdminPasswort } from "@/lib/authStore";
import { ipVon, gesperrt, fehlversuch, erfolg, bremse } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const key = "login:" + ipVon(req);
  const warte = gesperrt(key);
  if (warte > 0) {
    return NextResponse.json(
      { ok: false, error: "gesperrt", retryAfter: warte },
      { status: 429, headers: { "Retry-After": String(warte) } },
    );
  }

  const { passwort } = await req.json().catch(() => ({ passwort: "" }));
  if (!(await pruefeAdminPasswort(String(passwort ?? "")))) {
    fehlversuch(key);
    await bremse(); // automatisiertes Raten zusätzlich bremsen
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  erfolg(key);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, ADMIN_TOKEN, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12, // 12 Stunden
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(AUTH_COOKIE);
  return res;
}
