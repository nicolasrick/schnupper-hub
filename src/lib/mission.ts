// =============================================================================
//  Mission «Einsatz IDS» – Story-Quiz mit echten Einsätzen.
//  Läuft im Browser, nichts wird gespeichert. Solo oder zu zweit am Gerät.
// =============================================================================

export const MISSION_STORY = {
  titel: "Einsatz IDS",
  kicker: "Notfall-Einsatz",
  intro:
    "08:14 Uhr. Im ServiceDesk gehen die Alarme los: Bei mehreren Stellen der Stadt fällt die IT aus. " +
    "Die Feuerwehr hat keine Tablets mehr, die Schulen kein Internet. Du bist heute im Notfall-Team. " +
    "Löse die Einsätze, sammle die Codes und bring die Systeme wieder zum Laufen.",
};

export const BIT_WERTE = [32, 16, 8, 4, 2, 1];

interface Basis { nr: number; titel: string; intro: string; fragment: string; }
export interface EinsatzTriage extends Basis {
  typ: "triage"; frage: string; optionen: { text: string; richtig: boolean; feedback: string }[];
}
export interface EinsatzQuiz extends Basis {
  typ: "quiz"; frage: string; optionen: { text: string; richtig: boolean }[]; aufloesung: string;
}
export interface EinsatzBinaer extends Basis {
  typ: "binaer"; ziel: number; hinweis: string;
}
export interface EinsatzCode extends Basis {
  typ: "code"; frage: string; loesung: string[]; hinweis: string;
}
export interface EinsatzMatching extends Basis {
  typ: "matching"; auftrag: string; optionen: string[]; richtig: string; erklaerung: string;
}
export type Einsatz = EinsatzTriage | EinsatzQuiz | EinsatzBinaer | EinsatzCode | EinsatzMatching;

export const EINSAETZE: Einsatz[] = [
  {
    typ: "triage", nr: 1, titel: "Der erste Anruf", fragment: "S",
    intro: "Die Stadtpolizei ruft an: «Unsere Einsatz-Software startet nicht.»",
    frage: "Was machst du zuerst?",
    optionen: [
      { text: "Den Server sofort neu starten.", richtig: false, feedback: "Zu schnell. Du weisst ja noch nicht, woran es liegt." },
      { text: "Nachfragen: seit wann, und sind alle betroffen oder nur ein Gerät?", richtig: true, feedback: "So macht man das. Erst eingrenzen, dann anfassen." },
      { text: "Neue Software bestellen.", richtig: false, feedback: "Viel zu früh – erst die Ursache suchen." },
    ],
  },
  {
    typ: "quiz", nr: 2, titel: "Kurze Frage", fragment: "E",
    intro: "Bevor es weitergeht – kennst du das?",
    frage: "Womit arbeitet ein Computer ganz tief drin?",
    optionen: [
      { text: "Mit Wörtern", richtig: false },
      { text: "Mit Nullen und Einsen", richtig: true },
      { text: "Mit Bildern", richtig: false },
    ],
    aufloesung: "Genau. Am Ende ist alles nur 0 und 1 – das nennt man binär.",
  },
  {
    typ: "binaer", nr: 3, titel: "Der Fehlercode", fragment: "R",
    intro: "Das System zeigt einen Code in Binär. Stell ihn ein, dann kommst du weiter.",
    ziel: 22, hinweis: "Welche Lämpchen ergeben zusammen 22?",
  },
  {
    typ: "code", nr: 4, titel: "Die versteckte Datei", fragment: "V",
    intro: "Der nächste Code liegt als Datei auf dem Computer. Such sie und tipp rein, was drinsteht.",
    frage: "Öffne den Ordner «Einsatz» auf dem Desktop, dann die Datei «codewort.txt». Wie lautet das Codewort?",
    loesung: ["server", "der server", "server läuft"],
    hinweis: "Doppelklick auf den Ordner, dann auf die Datei. Gross-/Kleinschreibung egal.",
  },
  {
    typ: "matching", nr: 5, titel: "Wo zuerst?", fragment: "E",
    intro: "Mehrere Stellen sind offline. Eine kann nicht warten.",
    auftrag: "«Wir kriegen die Einsatz-Planung für den nächsten Brand nicht auf!»",
    optionen: ["Schulen", "Feuerwehr", "Musikschule", "Tiefbauamt"],
    richtig: "Feuerwehr",
    erklaerung: "Richtig. Bei der Feuerwehr zählt jede Minute – die kommt zuerst dran.",
  },
  {
    typ: "quiz", nr: 6, titel: "Letzter Check", fragment: "R",
    intro: "Fast geschafft. Eine Frage noch.",
    frage: "Was davon ist KEINE Hardware?",
    optionen: [
      { text: "Die Festplatte", richtig: false },
      { text: "Der Bildschirm", richtig: false },
      { text: "Das Passwort", richtig: true },
    ],
    aufloesung: "Stimmt – ein Passwort kannst du nicht anfassen. Hardware ist alles, was du in der Hand hast.",
  },
];

// Fragmente ergeben das Schlusswort
export const MASTER_CODE = EINSAETZE.map((e) => e.fragment).join("");

export const MAX_PUNKTE = EINSAETZE.length * 100;

export function punkteFuer(fehlversuche: number): number {
  return Math.max(25, 100 - fehlversuche * 25);
}

export interface Rang { emoji: string; titel: string; }
export function rangFuer(punkte: number): Rang {
  const p = punkte / MAX_PUNKTE;
  if (p >= 0.9) return { emoji: "🏆", titel: "IT-Profi der Stadt" };
  if (p >= 0.7) return { emoji: "⭐", titel: "Starkes Notfall-Team" };
  if (p >= 0.5) return { emoji: "🚀", titel: "Auf gutem Weg" };
  return { emoji: "🔧", titel: "Drangeblieben" };
}
