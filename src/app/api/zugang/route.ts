import { NextResponse } from "next/server";
import { ZUGANG_COOKIE, ZUGANG_TOKEN } from "@/lib/auth";
import { leseZugangscode } from "@/lib/authStore";
import { ipVon, gesperrt, fehlversuch, erfolg, sicherGleich, bremse } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

// Schüler-Zugangscode für die Teilnehmer-Seite. Code ist serverseitig im Admin
// änderbar (authStore). Bei Erfolg wird NICHT der Code, sondern ein Token-Cookie
// gesetzt – so kann der Code geändert werden, ohne die Middleware anzufassen.
export async function POST(req: Request) {
  const key = "zugang:" + ipVon(req);
  const warte = gesperrt(key);
  if (warte > 0) {
    return NextResponse.json(
      { ok: false, error: "gesperrt", retryAfter: warte },
      { status: 429, headers: { "Retry-After": String(warte) } },
    );
  }

  const { code } = await req.json().catch(() => ({ code: "" }));
  const expected = await leseZugangscode();
  if (!expected || !sicherGleich(String(code ?? "").trim(), expected)) {
    fehlversuch(key);
    await bremse();
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  erfolg(key);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ZUGANG_COOKIE, ZUGANG_TOKEN, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 Tag
  });
  return res;
}
