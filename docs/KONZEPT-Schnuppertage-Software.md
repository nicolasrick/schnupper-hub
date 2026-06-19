# Konzept: Schnuppertage-Software (rick.media · IDS Stadt St. Gallen)

> Stand 2026-06-19. Vom datenarmen Prototyp („Schnupper-Hub") zur **vollfunktionsfähigen,
> intern bedienbaren Schnuppertage-Software**. Eigenständiges Repo (`schnupper-hub`),
> kann später als Modul an rm-portal andocken.

## Festgelegte Richtung
- **KI-Engine: Azure OpenAI** im eigenen M365/Azure-Tenant (EU-Region). Daten bleiben in
  eurer Microsoft-Umgebung → sauber für Stadt-Datenschutz. (Anthropic/Claude wird abgelöst.)
- **Aufbau: eigenständig** (eigenes Repo/Deploy auf Coolify), entkoppelt von rm-portal (#1).
- **Nicht mehr datenarm**: Vor-/Nachname + Bewertungen dürfen intern gespeichert & an
  SharePoint angebunden werden.
- **Datenhaltung: noch offen** → Abwägung + Empfehlung unten.

---

## 1. Der Kern-Schritt: weg vom localStorage

Heute liegen Namen & Bewertungen **lokal auf einem Gerät** (Browser-localStorage). Das ist der
Grund, warum es ein „Prototyp" ist und keine Software:
- Zwei Betreuer (du + Gioele) auf zwei Geräten → keiner sieht die Daten des anderen.
- „Von überall bedienbar/editierbar" geht gar nicht.
- Gerät weg / Browser-Reset = Daten weg.

**Software = gemeinsames Server-Backend.** Alles andere hängt daran. Das ist Phase 1.

---

## 2. Datenhaltung — die offene Entscheidung

| | **A: Nur SharePoint (Graph)** | **B: Postgres-Kern + SharePoint-Akte (empfohlen)** |
|---|---|---|
| **Idee** | Alles direkt in SharePoint-Listen | Richtige DB als System-of-Record, SharePoint kriegt die fertige „Akte" (PDF + Zusammenfassung) |
| **Pro** | Nichts Neues betreiben; Team sieht alles im gewohnten SharePoint; „liegt alles bei uns" | Saubere Relationen (Teilnehmer↔Bewertung↔Stationen), schnell, Multi-User/Realtime, ihr betreibt Postgres schon (rm-portal/Supabase) |
| **Contra** | SharePoint-Listen als App-DB: 5000-Item-View-Limit, Throttling, schwache Queries, keine echten Relationen, fummelig | Zweites System; operative Daten leben primär ausserhalb SharePoint (Sync schliesst die Lücke) |
| **Datenresidenz** | M365-Tenant (EU) | Postgres EU-Region **oder self-hosted auf eurem Hetzner** → ebenfalls EU/eigene Hand |

**Empfehlung: B.** „Vollständig logisch bearbeitbar" + Mehrbenutzer + verknüpfte Daten ist genau
das, wofür eine DB da ist und wofür SharePoint-Listen schlecht sind. Ihr kennt Supabase/Postgres
schon. SharePoint bekommt das, was die **Stadt sehen will** (die fertige Auswertung/Akte pro
Schnupperlernendem), nicht die operative Datenbank. Self-hosted Postgres auf eurem Hetzner hält
zudem die Datenresidenz komplett in eurer Hand.

→ **Deine Entscheidung:** A oder B. Rest des Konzepts ist auf B ausgelegt, lässt sich aber auf A drehen.

---

## 3. Architektur-Überblick (Zielbild)

```
  Browser (Stift / Betreuer)
        │
  Next.js (bleibt) ── App-Router UI + /api-Routes        ← Coolify/Hetzner
        │
        ├── Postgres (System-of-Record)                  ← Teilnehmer, Bewertungen, Stationen, Ergebnisse
        ├── Azure OpenAI  ── KI-Texthilfe                ← /api/umformulieren (Swap von Claude)
        └── Microsoft Graph
              ├── SharePoint  ── Akte/Ablage (PDF + Zusammenfassung)
              └── Outlook/Mail ── Bestätigungs- & Auswertungs-Mails (statt Vorlagen-Copy/Paste)
        │
  Auth: Entra ID (Microsoft-Login für Betreuer) statt Passwort-Cookie
```

Microsoft-seitig nötig (einmalig, von dir/Stadt-Admin):
- **Entra ID App-Registrierung** (Client-Credentials) mit Graph-Berechtigungen `Sites.ReadWrite.All`
  (SharePoint) und ggf. `Mail.Send`. → für SharePoint-Akte + Mailversand.
- **Azure OpenAI Resource** (EU-Region, z.B. Sweden Central/West Europe) + ein Deployment
  (z.B. `gpt-4o`/`gpt-4o-mini`). → Endpoint + Key in Coolify-Env.
- **Entra ID App** für Betreuer-Login (Microsoft-Login statt `ids5099`-Passwort) — optional, Phase 2+.

---

## 4. Feature-Map (aus Sicht „ich leite die Tage")

Legende: ✅ existiert · 🟡 teils da · 🔲 neu

| Phase | Feature | Stand |
|---|---|---|
| **Vorbereitung** | Schnupperlernende erfassen (Name/Schule/Datum/Kontakt) | 🟡 (Teilnehmer-Modell da, Self-Entry) |
| | Tag planen: Stationen, Betreuer-Zuteilung, Ablaufplan | 🟡 (Stationen im Modell; Ablaufplan als PDF) |
| | Bestätigungs-Mail an Schule/Eltern | 🟡 (Vorlage da, manuell) → 🔲 via Graph senden |
| **Am Tag** | Check-in / Anwesenheit | 🔲 |
| | Eignungs-Check / Mission | ✅ |
| | Login Vor+Nachname + Resume bei Abbruch | ✅ (neu) |
| | Stationen abhaken (pro Kind, pro Betreuer) | 🟡 → 🔲 multi-user |
| | Datei-Abgaben | ✅ |
| **Bewertung** | Bewertungsbogen (Kantons-Stil) | ✅ (neu) |
| | Auto-Vorname/Nachname/Datum/Verantwortlich | ✅ (neu) |
| | KI-Texthilfe Begründung | 🟡 (gebaut auf Claude) → 🔲 Swap auf Azure OpenAI |
| | Auswertungs-PDF / Export | 🔲 (Backlog) |
| **Nachgang** | Auswertung an Schule/Eltern (Mail) | 🔲 |
| | Bewerbungs-Follow-up / Empfehlung | 🔲 |
| | Akte in SharePoint ablegen | 🔲 |
| | Statistik / Vergleich / Rangliste | 🔲 (Backlog) |
| **Verwaltung** | Alles editierbar (Teilnehmer/Stationen/Texte/Mails/Ablauf) | 🟡 → 🔲 |
| | Mehrbenutzer (Nicolas + Gioele), überall | 🔲 ← **hängt an Phase 1** |

---

## 5. Roadmap (inkrementell — es ist Produkt-Grösse)

- **Phase 0 — jetzt (erledigt):** Bewertungsbogen-Feinschliff, Kinder-Login+Resume, Nachname-Autofill.
  KI-Button gebaut (Claude), noch inaktiv. → **Anthropic-Key wird NICHT mehr gebraucht** (Azure kommt).
- **Phase 1 — Backend & Multi-User (das Fundament):**
  localStorage → Postgres. Betreuer-Login (erst weiter Passwort, dann Entra ID). Teilnehmer &
  Bewertungen serverseitig, von beiden Geräten editierbar. *Ohne diese Phase kein „Software".*
- **Phase 2 — Microsoft-Anbindung:**
  `/api/umformulieren` auf **Azure OpenAI** swappen. SharePoint-Akte schreiben (Graph). Mailversand
  via Graph statt Copy/Paste.
- **Phase 3 — Operativer Vollausbau:**
  Check-in, Stationen-Tracking multi-user, Auswertungs-PDF, Nachgang/Follow-up, Statistik.
- **Phase 4 — Feinschliff/Produkt:**
  Eignungs-Check/Mission inhaltlich ausbauen (waren am Event zu kurz/zu leicht), Rollen, evtl.
  Andocken an rm-portal.

---

## 6. Was ich von dir brauche, um Phase 1+2 zu starten
1. **Datenhaltung A oder B** entscheiden (Empfehlung B).
2. **Azure OpenAI Resource** (EU-Region) + Deployment → Endpoint + Key. *(Hinweis: braucht eine Azure-Subscription mit Azure-OpenAI-Zugang.)*
3. **Entra ID App-Registrierung** für Graph (SharePoint + ggf. Mail) → Tenant-ID, Client-ID, Secret.
4. Ziel-**SharePoint-Site/Bibliothek**, wo die Akten landen sollen.

> Sobald A/B steht, baue ich Phase 1 (Backend-Umzug) — das ist der grösste Hebel und entkoppelt
> sauber von rm-portal.
