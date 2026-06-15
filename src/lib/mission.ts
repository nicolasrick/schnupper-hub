// =============================================================================
//  Mission «Einsatz IDS» – Story-Quiz mit Einsätzen, Punkten, Code-Fragmenten
//
//  Datenarm: läuft komplett im Browser, nichts wird gespeichert. Solo spielbar
//  (Team kann zusammen vor einem Gerät sitzen). Der Rang am Ende kann in die
//  Schnupperauswertung übernommen werden.
// =============================================================================

export const MISSION_STORY = {
  titel: "Einsatz IDS",
  kicker: "🚨 Notfall-Einsatz",
  intro:
    "08:14 Uhr – Alarm im ServiceDesk! Bei mehreren Dienststellen der Stadt fällt die IT aus: " +
    "Die Feuerwehr-Tablets sind offline, die Schulen kommen nicht ins Netz. " +
    "Du bist das Notfall-Team der IDS. Löse die Einsätze, schalte den Wiederherstellungs-Code frei " +
    "und bring die Stadt wieder online!",
};

export const BIT_WERTE = [32, 16, 8, 4, 2, 1];

export interface TriageOption { text: string; richtig: boolean; feedback: string; }

export interface EinsatzTriage {
  typ: "triage";
  nr: number; titel: string; intro: string; fragment: string;
  frage: string; optionen: TriageOption[];
}
export interface EinsatzBinaer {
  typ: "binaer";
  nr: number; titel: string; intro: string; fragment: string;
  ziel: number; hinweis: string;
}
export interface EinsatzMatching {
  typ: "matching";
  nr: number; titel: string; intro: string; fragment: string;
  auftrag: string; optionen: string[]; richtig: string; erklaerung: string;
}
export type Einsatz = EinsatzTriage | EinsatzBinaer | EinsatzMatching;

export const EINSAETZE: Einsatz[] = [
  {
    typ: "triage", nr: 1, titel: "Der Notruf", fragment: "4",
    intro: "Die Stadtpolizei meldet: «Unsere Einsatz-Software startet nicht mehr.»",
    frage: "Was machst du als Erstes?",
    optionen: [
      { text: "Sofort den Server neu starten.", richtig: false, feedback: "Zu schnell – du weisst noch nicht, woran es liegt. Erst eingrenzen." },
      { text: "Nachfragen: Seit wann? Betrifft es alle oder nur ein Gerät?", richtig: true, feedback: "Genau. Erst eingrenzen, dann handeln – wie im echten ServiceDesk." },
      { text: "Neue Software bestellen.", richtig: false, feedback: "Viel zu früh. Zuerst die Ursache finden." },
    ],
  },
  {
    typ: "binaer", nr: 2, titel: "Der Fehlercode", fragment: "2",
    intro: "Das System zeigt einen binären Fehlercode. Entschlüssle ihn, um weiterzukommen.",
    ziel: 22, hinweis: "Schalte die Lämpchen so, dass sie zusammen 22 ergeben.",
  },
  {
    typ: "matching", nr: 3, titel: "Wo brennt's?", fragment: "9",
    intro: "Eine Dienststelle braucht zuerst Hilfe. Ordne den Notfall richtig zu.",
    auftrag: "«Die Einsatz-Planung für den nächsten Brand-Einsatz ist nicht abrufbar!»",
    optionen: ["Schulen", "Feuerwehr", "Musikschule", "Tiefbauamt"],
    richtig: "Feuerwehr",
    erklaerung: "Richtig – die Feuerwehr ist eine unserer wichtigsten Kundinnen, da zählt jede Minute.",
  },
];

/** Master-Code aus den Fragmenten der gelösten Einsätze */
export const MASTER_CODE = EINSAETZE.map((e) => e.fragment).join("");

// --- Punkte & Rang ------------------------------------------------------------
export const MAX_PUNKTE = EINSAETZE.length * 100;

/** Punkte eines Einsatzes je nach Fehlversuchen */
export function punkteFuer(fehlversuche: number): number {
  return Math.max(25, 100 - fehlversuche * 25);
}

export interface Rang { emoji: string; titel: string; }
export function rangFuer(punkte: number): Rang {
  const p = punkte / MAX_PUNKTE;
  if (p >= 0.9) return { emoji: "🏆", titel: "IT-Spezialist:in der Stadt" };
  if (p >= 0.7) return { emoji: "⭐", titel: "Nachwuchs-Profi" };
  if (p >= 0.5) return { emoji: "🚀", titel: "Talent im Anflug" };
  return { emoji: "🔧", titel: "Mutige:r Entdecker:in" };
}
