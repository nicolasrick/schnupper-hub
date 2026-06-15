import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Zugangscode für die ganze Teilnehmer-Seite. Aktiv nur, wenn die
// Umgebungsvariable ZUGANGSCODE gesetzt ist. So lässt sich die URL nicht
// einfach weitergeben – ohne Code kommt man nicht rein.
export async function POST(req: Request) {
  const { code } = await req.json().catch(() => ({ code: "" }));
  const expected = process.env.ZUGANGSCODE || "";
  if (!expected || String(code).trim() !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("sh_access", expected, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 1 Tag
  });
  return res;
}
