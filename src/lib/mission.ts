// =============================================================================
//  Mission «Einsatz IDS» – Story-Schnitzeljagd mit echten Einsätzen.
//
//  Läuft im Browser, nichts wird gespeichert (datenarm). Solo spielbar – Team
//  (2–3) ist nur eine Ebene obendrauf: zusammen vor dem Gerät, der Kern ist
//  solo lösbar. Modus-aware: Schnuppertag = volle, schwerere Mission;
//  Zukunftstag = kürzer & sanfter (siehe PLAYLISTS unten).
// =============================================================================

export const MISSION_STORY = {
  titel: "Einsatz IDS",
  kicker: "Notfall-Einsatz",
  intro:
    "08:14 Uhr. Im ServiceDesk gehen die Alarme los: Bei mehreren Stellen der Stadt fällt die IT aus. " +
    "Die Feuerwehr hat keine Tablets mehr, die Schulen kein Internet. Du bist heute im Notfall-Team. " +
    "Löse die Einsätze, knack die Codes und bring die Systeme der Stadt wieder online.",
};

export const BIT_WERTE = [32, 16, 8, 4, 2, 1];

// -----------------------------------------------------------------------------
//  Einsatz-Typen (Puzzle-Pool). Das Code-Fragment wird NICHT hier vergeben,
//  sondern von der Playlist – so kann derselbe Einsatz in verschiedenen Modi
//  ein anderes Fragment beitragen.
// -----------------------------------------------------------------------------
interface Basis { id: string; titel: string; intro: string; }

export interface EinsatzTriage extends Basis {
  typ: "triage"; frage: string; optionen: { text: string; richtig: boolean; feedback: string }[];
}
export interface EinsatzQuiz extends Basis {
  typ: "quiz"; frage: string; optionen: { text: string; richtig: boolean }[]; aufloesung: string;
}
export interface EinsatzBinaer extends Basis {
  typ: "binaer"; ziel: number; hinweis: string;
  /** Wenn gesetzt: zweistufig – erst Alphabet-Position des Buchstabens finden, dann als Bits einstellen. */
  buchstabe?: string;
}
export interface EinsatzCode extends Basis {
  typ: "code"; frage: string; loesung: string[]; hinweis: string;
}
export interface EinsatzMatching extends Basis {
  typ: "matching"; auftrag: string; optionen: string[]; richtig: string; erklaerung: string;
}
export interface EinsatzCipher extends Basis {
  typ: "cipher"; frage: string; chiffre: string; shift: number; loesung: string[]; hinweis: string;
}
export interface EinsatzFehler extends Basis {
  typ: "fehler"; frage: string; zeilen: { text: string; defekt: boolean }[]; feedback: string;
}
export interface EinsatzSequenz extends Basis {
  typ: "sequenz"; frage: string; folge: number[]; loesung: number; hinweis: string;
}
export type Einsatz =
  | EinsatzTriage | EinsatzQuiz | EinsatzBinaer | EinsatzCode
  | EinsatzMatching | EinsatzCipher | EinsatzFehler | EinsatzSequenz;

// -----------------------------------------------------------------------------
//  Puzzle-Pool – jeder Einsatz einmal definiert, per id referenziert.
// -----------------------------------------------------------------------------
const POOL: Record<string, Einsatz> = {
  triage: {
    typ: "triage", id: "triage", titel: "Der erste Anruf",
    intro: "Die Stadtpolizei ruft an: «Unsere Einsatz-Software startet nicht.»",
    frage: "Was machst du zuerst?",
    optionen: [
      { text: "Den Server sofort neu starten.", richtig: false, feedback: "Zu schnell. Du weisst ja noch nicht, woran es liegt." },
      { text: "Nachfragen: seit wann, und sind alle betroffen oder nur ein Gerät?", richtig: true, feedback: "So macht man das. Erst eingrenzen, dann anfassen." },
      { text: "Neue Software bestellen.", richtig: false, feedback: "Viel zu früh – erst die Ursache suchen." },
    ],
  },
  quizBinaer: {
    typ: "quiz", id: "quizBinaer", titel: "Kurzer Check",
    intro: "Bevor es weitergeht – kennst du das?",
    frage: "Womit arbeitet ein Computer ganz tief drin?",
    optionen: [
      { text: "Mit Wörtern", richtig: false },
      { text: "Mit Nullen und Einsen", richtig: true },
      { text: "Mit Bildern", richtig: false },
    ],
    aufloesung: "Genau. Am Ende ist alles nur 0 und 1 – das nennt man binär. Gleich brauchst du das.",
  },
  matchingFeuerwehr: {
    typ: "matching", id: "matchingFeuerwehr", titel: "Wo zuerst?",
    intro: "Mehrere Stellen sind offline. Du hast nur zwei Hände – eine kann nicht warten.",
    auftrag: "«Wir kriegen die Einsatz-Planung für den nächsten Brand nicht auf!»",
    optionen: ["Schulen", "Feuerwehr", "Musikschule", "Tiefbauamt"],
    richtig: "Feuerwehr",
    erklaerung: "Richtig. Bei der Feuerwehr zählt jede Minute – die kommt zuerst dran. Priorisieren ist halber Job im ServiceDesk.",
  },
  binaer22: {
    typ: "binaer", id: "binaer22", titel: "Der Fehlercode",
    intro: "Das System zeigt einen Code in Binär. Stell ihn ein, dann kommst du weiter.",
    ziel: 22, hinweis: "Welche Lämpchen ergeben zusammen 22?",
  },
  binaerBuchstabe: {
    typ: "binaer", id: "binaerBuchstabe", titel: "Der verschlüsselte Buchstabe",
    intro: "Computer speichern Buchstaben als Zahlen. Der gesuchte Buchstabe ist «K». Finde seine Stelle im Alphabet und stell sie als Bit-Code ein.",
    buchstabe: "K", ziel: 11,
    hinweis: "A=1, B=2, C=3 … zähl bis K. Welche Lämpchen ergeben diese Zahl?",
  },
  codeServer: {
    typ: "code", id: "codeServer", titel: "Die versteckte Datei",
    intro: "Der nächste Code liegt als Datei auf dem Computer. Such sie und tipp rein, was drinsteht.",
    frage: "Öffne den Ordner «Einsatz» auf dem Desktop, dann die Datei «codewort.txt». Wie lautet das Codewort?",
    loesung: ["server", "der server", "server läuft"],
    hinweis: "Doppelklick auf den Ordner, dann auf die Datei. Gross-/Kleinschreibung egal.",
  },
  cipherServer: {
    typ: "cipher", id: "cipherServer", titel: "Die Geheimschrift",
    intro: "Ein Systemteil ist verschlüsselt – mit einer uralten Geheimschrift: jeder Buchstabe ist um 3 Stellen verschoben (A→D, B→E …).",
    frage: "Entschlüssle das Codewort. Schieb jeden Buchstaben 3 Stellen ZURÜCK:",
    chiffre: "VHUYHU", shift: 3, loesung: ["server"],
    hinweis: "V → U → T → S. Mach das mit jedem Buchstaben. Tipp: nutz die Alphabet-Leiste unten.",
  },
  fehlerIp: {
    typ: "fehler", id: "fehlerIp", titel: "Der kaputte Befehl",
    intro: "Ein Kollege hat drei Befehle getippt, um die Server zu erreichen. Einer kann unmöglich funktionieren.",
    frage: "Welche Zeile ist kaputt?",
    zeilen: [
      { text: "ping 192.168.1.10", defekt: false },
      { text: "ping 10.0.0.20", defekt: false },
      { text: "ping 192.168.1.300", defekt: true },
    ],
    feedback: "Genau. In einer IP-Adresse geht jede Zahl nur von 0 bis 255 – eine «300» gibt es nicht. Deshalb läuft der Befehl ins Leere.",
  },
  sequenzVerdopplung: {
    typ: "sequenz", id: "sequenzVerdopplung", titel: "Das Notfall-Protokoll",
    intro: "Im Protokoll steht eine Zahlenreihe. Tipp ein, wie sie weitergeht – das gibt das letzte Fragment frei.",
    frage: "Wie geht die Reihe weiter?",
    folge: [2, 4, 8, 16],
    loesung: 32,
    hinweis: "Jede Zahl ist das Doppelte der vorherigen – genau wie die Bit-Werte 1, 2, 4, 8 …",
  },
};

// -----------------------------------------------------------------------------
//  Schritte: ein Einsatz (mit zugewiesenem Fragment) ODER ein Story-Beat.
// -----------------------------------------------------------------------------
export interface EinsatzSchritt { kind: "einsatz"; einsatz: Einsatz; fragment: string; }
export interface BeatSchritt { kind: "beat"; emoji: string; titel: string; text: string; }
export type Schritt = EinsatzSchritt | BeatSchritt;

const e = (id: keyof typeof POOL, fragment: string): EinsatzSchritt => ({ kind: "einsatz", einsatz: POOL[id], fragment });
const beat = (emoji: string, titel: string, text: string): BeatSchritt => ({ kind: "beat", emoji, titel, text });

export interface Playlist { masterWort: string; schritte: Schritt[]; }

// Voll (Schnuppertag / Nachmittag / Triebwerk) – 8 Einsätze, eskalierend,
// Master-Code «NEUSTART». Mit Story-Beats (Eskalation + Ursache-Reveal).
const PLAYLIST_VOLL: Playlist = {
  masterWort: "NEUSTART",
  schritte: [
    e("triage", "N"),
    e("quizBinaer", "E"),
    e("matchingFeuerwehr", "U"),
    beat("📟", "Die Lage spitzt sich zu",
      "Während du arbeitest, fallen weitere Stellen aus: die St.Galler Stadtwerke, dann das Tiefbauamt. Im ServiceDesk wird es laut. Jetzt wird's kniffliger – bleib ruhig und denk mit."),
    e("cipherServer", "S"),
    e("codeServer", "T"),
    e("binaerBuchstabe", "A"),
    beat("🔎", "Die Ursache",
      "Du findest es heraus: Es war kein Hacker. Ein Update für die ganze Stadtverwaltung lief letzte Nacht schief und hat die Server überlastet. Jetzt weisst du, was zu tun ist – zwei Einsätze noch."),
    e("fehlerIp", "R"),
    e("sequenzVerdopplung", "T"),
  ],
};

// Kurz (Zukunftstag – jünger, weniger Zeit) – 5 Einsätze, sanfter,
// Master-Code «START». Keine schweren Cipher/Fehler-Rätsel.
const PLAYLIST_KURZ: Playlist = {
  masterWort: "START",
  schritte: [
    e("triage", "S"),
    e("quizBinaer", "T"),
    e("matchingFeuerwehr", "A"),
    e("binaer22", "R"),
    e("codeServer", "T"),
  ],
};

/** Welche Playlist für welchen Modus. Default = volle Mission. */
export function playlistFuerModus(modusId: string | null | undefined): Playlist {
  return modusId === "zukunftstag" ? PLAYLIST_KURZ : PLAYLIST_VOLL;
}

// -----------------------------------------------------------------------------
//  Punkte, Rang, Zeit-Badge
// -----------------------------------------------------------------------------
export function punkteFuer(fehlversuche: number): number {
  return Math.max(25, 100 - fehlversuche * 25);
}

export function einsatzAnzahl(pl: Playlist): number {
  return pl.schritte.filter((s) => s.kind === "einsatz").length;
}
export function maxPunkte(pl: Playlist): number {
  return einsatzAnzahl(pl) * 100;
}

export interface Rang { emoji: string; titel: string; }
export function rangFuer(punkte: number, max: number): Rang {
  const p = max > 0 ? punkte / max : 0;
  if (p >= 0.9) return { emoji: "🏆", titel: "IT-Profi der Stadt" };
  if (p >= 0.7) return { emoji: "⭐", titel: "Starkes Notfall-Team" };
  if (p >= 0.5) return { emoji: "🚀", titel: "Auf gutem Weg" };
  return { emoji: "🔧", titel: "Drangeblieben" };
}

/** Speed-Badge fürs Finale – Zeitdruck als Belohnung, niemals als Strafe. */
export interface SpeedBadge { emoji: string; titel: string; }
export function speedBadge(sekunden: number, einsaetze: number): SpeedBadge {
  const proEinsatz = einsaetze > 0 ? sekunden / einsaetze : sekunden;
  if (proEinsatz <= 45) return { emoji: "⚡", titel: "Blitz-Einsatz" };
  if (proEinsatz <= 90) return { emoji: "🎯", titel: "Souverän gelöst" };
  return { emoji: "🧠", titel: "Gründlich drangeblieben" };
}

export function zeitText(sekunden: number): string {
  const m = Math.floor(sekunden / 60);
  const s = sekunden % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
