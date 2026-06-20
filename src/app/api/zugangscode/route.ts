import { NextResponse } from "next/server";
import { leseZugangscode, setzeZugangscode } from "@/lib/authStore";

export const dynamic = "force-dynamic";

// Admin-only (Middleware): Schüler-Zugangscode lesen + ändern.
// Bewusst NICHT Teil des öffentlichen /api/einstellungen-GET.
export async function GET() {
  return NextResponse.json({ zugangscode: await leseZugangscode() });
}

export async function PUT(req: Request) {
  const body = await req.json().catch(() => ({}));
  const code = await setzeZugangscode(body?.zugangscode);
  return NextResponse.json({ ok: true, zugangscode: code });
}
