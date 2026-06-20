import { NextResponse, NextRequest } from "next/server";
import { AUTH_COOKIE, ADMIN_TOKEN, ZUGANG_COOKIE, ZUGANG_TOKEN } from "@/lib/auth";

// Schützt das Dashboard (UI) und das Setzen des Modus.
// Personendaten gibt es serverseitig nicht – darum nur diese zwei Dinge.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = req.cookies.get(AUTH_COOKIE)?.value === ADMIN_TOKEN;

  // Zugangscode-Gate für die Teilnehmer-Startseite (aktiv, solange ZUGANGSCODE als
  // Flag gesetzt ist). Der echte Code ist im Admin änderbar (Server-Store); das
  // Cookie trägt nur den Token, darum prüft die Edge-Middleware gegen ZUGANG_TOKEN.
  const gateAktiv = !!(process.env.ZUGANGSCODE || "");
  if (gateAktiv && pathname === "/") {
    const hatZugang = req.cookies.get(ZUGANG_COOKIE)?.value === ZUGANG_TOKEN;
    if (!hatZugang) {
      const url = req.nextUrl.clone();
      url.pathname = "/zugang";
      return NextResponse.redirect(url);
    }
  }

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

  // Eignungs-Check-Ergebnisse: Liste/Löschen nur eingeloggt.
  // Offen bleibt nur POST /api/ergebnis (das Kind schickt sein Ergebnis).
  if (pathname === "/api/ergebnis" && req.method !== "POST" && !authed) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Gesamt-Export (ZIP) nur eingeloggt.
  if (pathname.startsWith("/api/export") && !authed) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // KI-Umformulieren nur eingeloggt (schützt den API-Key vor Missbrauch).
  if (pathname.startsWith("/api/umformulieren") && !authed) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Teilnehmer-Liste (Lesen + Schreiben) nur eingeloggt – enthält Namen & Bewertungen.
  if (pathname.startsWith("/api/teilnehmer") && !authed) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Einstellungen: Lesen offen (keine Secrets), Ändern nur eingeloggt.
  if (pathname.startsWith("/api/einstellungen") && req.method !== "GET" && !authed) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Schüler-Zugangscode (Geheimnis): Lesen UND Ändern nur eingeloggt.
  if (pathname.startsWith("/api/zugangscode") && !authed) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Admin-Passwort ändern nur eingeloggt.
  if (pathname.startsWith("/api/passwort") && !authed) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin", "/admin/:path*", "/api/config", "/api/abgabe", "/api/abgabe/:path*", "/api/ergebnis", "/api/export/:path*", "/api/umformulieren", "/api/teilnehmer", "/api/einstellungen", "/api/zugangscode", "/api/passwort"],
};
