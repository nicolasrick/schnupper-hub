// =============================================================================
//  Modi / Anlässe — ein Hub für verschiedene Formate
//
//  Statt für jeden Anlass ein eigenes Tool: der/die Betreuer:in wählt den Modus,
//  der Hub passt sich an (Begrüssung, aktive Bereiche, Zeit-Hinweis). Selbst-
//  gesteuert für die Jugendlichen – keine manuelle Schritt-für-Schritt-Steuerung.
// =============================================================================

export type HubZiel = "analyse" | "mission" | "zeitplan" | "aufgaben" | "abgabe";

export interface Modus {
  id: string;
  label: string;
  emoji: string;
  dauer: string;
  /** Begrüssung (Titel) im Hero – passt sich dem Anlass an */
  begruessung: string;
  /** Untertitel im Hero */
  intro: string;
  /** Welche Hub-Karten in diesem Modus sichtbar sind */
  karten: HubZiel[];
  /** Zeit-Hinweis auf der Analyse-Karte */
  analyseDauer: string;
  /** kurzer Hinweis-Chip (optional) */
  hinweis?: string;
}

export const MODI: Modus[] = [
  {
    id: "schnuppertag",
    label: "Schnuppertag",
    emoji: "🗓️",
    dauer: "2 Tage",
    begruessung: "Willkommen am Schnuppertag 👋",
    intro: "Hier findest du alles an einem Ort: Analyse, Mission und die Aufgaben.",
    karten: ["analyse", "mission", "aufgaben", "abgabe"],
    analyseDauer: "ca. 25 Min",
  },
  {
    id: "nachmittag",
    label: "Schul-Nachmittag",
    emoji: "🏫",
    dauer: "ca. 2–3 Std.",
    begruessung: "Willkommen zu eurem IT-Nachmittag 👋",
    intro: "Alles an einem Ort: Analyse, Mission und die Aufgaben.",
    karten: ["analyse", "mission", "aufgaben", "abgabe"],
    analyseDauer: "ca. 25 Min",
  },
  {
    id: "zukunftstag",
    label: "Zukunftstag",
    emoji: "🚀",
    dauer: "ca. 2 Std.",
    begruessung: "Willkommen am Zukunftstag 👋",
    intro: "Hier entdeckst du echte IT-Arbeit: dein Profil, die Mission und die Aufgaben.",
    karten: ["analyse", "mission", "aufgaben", "abgabe"],
    analyseDauer: "ca. 25 Min",
    hinweis: "Für junge Entdecker:innen am Zukunftstag.",
  },
  {
    id: "triebwerk",
    label: "Triebwerk",
    emoji: "⚙️",
    dauer: "ca. 2–3 Std.",
    begruessung: "Willkommen im Triebwerk 👋",
    intro: "IT zum Anfassen: dein Profil, die Mission und die Aufgaben.",
    karten: ["analyse", "mission", "aufgaben", "abgabe"],
    analyseDauer: "ca. 25 Min",
  },
];

export const STANDARD_MODUS = "schnuppertag";

export function modusById(id: string | null | undefined): Modus {
  return MODI.find((m) => m.id === id) ?? MODI[0];
}
