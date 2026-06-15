import { NextResponse, NextRequest } from "next/server";
import { AUTH_COOKIE, ADMIN_TOKEN } from "@/lib/auth";

// Schützt das Dashboard (UI) und das Setzen des Modus.
// Personendaten gibt es serverseitig nicht – darum nur diese zwei Dinge.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = req.cookies.get(AUTH_COOKIE)?.value === ADMIN_TOKEN;

  if (pathname.startsWith("/admin")) {
    if (pathname.startsWith("/admin/login")) return NextResponse.next();
    if (!authed) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Modus setzen nur eingeloggt (GET /api/config bleibt offen, damit der Hub liest)
  if (pathname === "/api/config" && req.method === "POST" && !authed) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Abgaben: Übersicht/ZIP/Löschen nur eingeloggt.
  // Offen bleiben: POST /api/abgabe (Upload) und GET /api/abgabe?key (eigene Liste).
  const abgabeSensitive =
    pathname.startsWith("/api/abgabe/list") ||
    pathname.startsWith("/api/abgabe/zip") ||
    (pathname === "/api/abgabe" && (req.method === "DELETE" || req.method === "PATCH"));
  if (abgabeSensitive && !authed) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/config", "/api/abgabe", "/api/abgabe/:path*"],
};
