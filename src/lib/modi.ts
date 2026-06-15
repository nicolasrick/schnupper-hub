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
  /** Begrüssungstext im Hero */
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
    intro: "Deine Einsatzzentrale für die zwei Tage – alles, was du brauchst, jederzeit und von jedem Laptop.",
    karten: ["analyse", "mission", "aufgaben", "zeitplan", "abgabe"],
    analyseDauer: "ca. 10 Min",
  },
  {
    id: "nachmittag",
    label: "Schul-Nachmittag",
    emoji: "🏫",
    dauer: "ca. 2–3 Std.",
    intro: "Willkommen zu eurem IT-Nachmittag bei den IDS – schaut rein, probiert aus, fragt alles.",
    karten: ["analyse", "mission", "aufgaben", "abgabe"],
    analyseDauer: "ca. 10 Min",
  },
  {
    id: "zukunftstag",
    label: "Zukunftstag",
    emoji: "🚀",
    dauer: "ca. 2 Std.",
    intro: "Schön, dass du heute die IT der Stadt entdeckst – tauch ein in echte IT-Arbeit!",
    karten: ["analyse", "mission", "aufgaben", "abgabe"],
    analyseDauer: "ca. 10 Min",
    hinweis: "Für junge Entdecker:innen am Zukunftstag.",
  },
  {
    id: "triebwerk",
    label: "Triebwerk",
    emoji: "⚙️",
    dauer: "ca. 2–3 Std.",
    intro: "IT zum Anfassen – euer Workshop im Triebwerk. Los geht's mit deinem eigenen Profil.",
    karten: ["analyse", "mission", "aufgaben", "abgabe"],
    analyseDauer: "ca. 10 Min",
  },
];

export const STANDARD_MODUS = "schnuppertag";

export function modusById(id: string | null | undefined): Modus {
  return MODI.find((m) => m.id === id) ?? MODI[0];
}
