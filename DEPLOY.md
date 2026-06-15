# Deployment (Coolify / Hetzner)

Der Schnupper-Hub ist eine Next.js-App mit kleinem JSON-Server-Store. Eine
Instanz, eine URL – alle Laptops rufen dieselbe Adresse auf, der Modus wird
zentral im Dashboard gesteuert.

## Umgebungsvariablen (Datenschutz – unbedingt setzen!)
| Variable | Zweck | Default (NUR Dev) |
|---|---|---|
| `ADMIN_PASSWORT` | Passwort fürs Dashboard | `schnuppern` ← **ÄNDERN** |
| `ADMIN_TOKEN` | interner Cookie-Token, langer Zufallswert | Platzhalter ← **ÄNDERN** |
| `RETENTION_TAGE` | Auto-Löschung der Teilnehmer nach X Tagen | `30` |
| `DATA_DIR` | Daten-Verzeichnis (Volume) | `/app/data` (im Image) |

- **Schutz:** Dashboard (`/admin`) und sensible API (Liste lesen, löschen, Modus setzen) sind hinter dem Passwort. Offen bleiben nur: Kinder-Hub, Modus *lesen*, eigene Analyse *speichern*.
- **User auf offenem Internet:** Schutz = Passwort + **HTTPS** (Coolify-Domain mit TLS) + Datensparsamkeit. Kein internes Netz nötig.
- **Datensparsamkeit:** Jugendliche geben nur den Vornamen ein. Sensible Felder (Name/Mail/Schule/Bewertung) erfasst nur der/die Betreuer:in – und «Tag abschliessen» exportiert alles und löscht es sofort.

## DATENARM: keine Personendaten auf dem Server
Der Server speichert **nur den zentralen Anlass/Modus** (`config.json` in `DATA_DIR`,
im Image `/app/data`) – das sind **keine Personendaten**. Namen, Analyse-Resultate,
Schnupperbericht und Bewertung bleiben **lokal im Browser** des jeweiligen Geräts
und werden heruntergeladen (Kinder speichern lokal, Abholung z. B. per Stick).

→ Volume auf `/app/data` empfohlen: dort liegen (a) der gewählte Modus (`config.json`,
nicht-personenbezogen) und (b) **kurzlebig die Abgabe-Dateien der Kinder**
(`/app/data/abgaben/…`). Letztere sind Arbeits-Dokumente (mit Namen), liegen nur
während des Tages dort, werden **automatisch nach 24 h** und per **«Tag abschliessen»**
gelöscht. Der Betreuer lädt sie als ZIP herunter und gibt sie mit. Das ist die bewusst
gewählte Ausnahme zur sonst datenarmen Architektur (akzeptiertes, kurzlebiges Sammeln).

## Variante A – Dockerfile (empfohlen)
Coolify erkennt das `Dockerfile` automatisch.
1. Neue Application → Quelle = dieses Repo/Verzeichnis.
2. Build Pack: **Dockerfile**.
3. Port: **3000**.
4. Persistent Storage: Volume → Mount Path `/app/data`.
5. Domain zuweisen (z. B. `schnuppertag.…`).

## Variante B – Nixpacks (ohne Dockerfile)
1. Build Pack: **Nixpacks** (erkennt Next.js).
2. Start Command: `npm start` (läuft `next start`, Port 3000).
3. Env: `DATA_DIR=/data` setzen + Volume auf `/data` mounten.

## Hinweis Skalierung
Der JSON-Store ist für **eine** Instanz gedacht (eine Handvoll Teilnehmer pro
Tag – völlig ausreichend). Nicht horizontal skalieren. Wird später mehr
gebraucht, ist der Umstieg auf SQLite/Postgres klein (nur `src/lib/store.ts`).

## OnlyOffice (separat)
Für die Office-Aufgaben (Dokumentformatierung, Excel) kann ein OnlyOffice/
Collabora-Container daneben laufen und im Hub eingebunden werden – eigene
Anleitung folgt bei Bedarf.
