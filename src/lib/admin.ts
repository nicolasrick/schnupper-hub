// =============================================================================
//  Back-Office: Teilnehmer-Datenmodell, Stationen, Mailvorlagen
//
//  Prototyp persistiert im Browser (localStorage). Das Modell ist bewusst so
//  geschnitten, dass es 1:1 auf eine spätere Datenbank (Postgres) übertragbar
//  ist — dieselben Felder nutzt danach auch das Berufsbildner-Dashboard.
// =============================================================================

export interface Teilnehmer {
  id: string;
  vorname: string;
  nachname: string;
  email: string;
  schule: string;
  /** Datum des Schnuppertags, ISO yyyy-mm-dd */
  datum: string;
  betreuer: string;
  /** IDs der absolvierten Stationen (siehe STATIONEN) */
  stationen: string[];
  bemerkung: string;
  /** ISO-Zeitstempel der Erfassung */
  erstellt: string;
  /** Anlass/Modus, in dem die Person teilgenommen hat */
  modus?: string;
  /** Ergebnis der Berufswahl-Analyse (vom Jugendlichen selbst befüllt) */
  analyse?: {
    passung: number;
    profil: { id: string; label: string; emoji: string; anteil: number }[];
    fazit: string;
  };
  /** Resultat der Mini-Aufgaben */
  aufgaben?: { bitUhr: boolean; triage: boolean; zuordnung: boolean };
  /** Anrede für den personalisierten Bericht */
  geschlecht?: "m" | "w" | "d";
  /** Auswahl für den Schnupperbericht */
  bericht?: { beobachtungen: string[]; freitext: string };
  /** Digitaler Bewertungsbogen (optional, erst beim Ausfüllen angelegt) */
  bewertung?: Bewertung;
}

export interface Station {
  id: string;
  tag: 1 | 2;
  label: string;
}

// Stationen/Tätigkeiten, die auf der Bestätigung angekreuzt werden können.
export const STATIONEN: Station[] = [
  { id: "s-setup", tag: 1, label: "Notebook mit Windows 11 aufgesetzt" },
  { id: "s-analyse", tag: 1, label: "Berufswahl-Analyse durchgeführt" },
  { id: "s-servicedesk", tag: 1, label: "ServiceDesk-Fall bearbeitet" },
  { id: "s-doku", tag: 1, label: "Dokument formatiert" },
  { id: "s-festplatte", tag: 1, label: "Festplatte gewechselt" },
  { id: "s-fehler", tag: 1, label: "Fehler am Notebook gelöst" },
  { id: "s-netzwerk", tag: 1, label: "Computer über Netzwerk aufgesetzt" },
  { id: "s-webserver", tag: 2, label: "Webserver (IIS) aufgesetzt" },
  { id: "s-gamingpc", tag: 2, label: "Gaming-PC zusammengestellt" },
  { id: "s-powershell", tag: 2, label: "PowerShell-Skript erstellt" },
  { id: "s-scratch", tag: 2, label: "Scratch-Spiel programmiert" },
  { id: "s-serverraum", tag: 2, label: "Serverraum besichtigt" },
];

export const ORGANISATION = {
  name: "Informatikdienste der Stadt St. Gallen (IDS)",
  beruf: "Informatiker/in Plattformentwicklung EFZ",
  ort: "St. Gallen",
  kontaktMail: "nicolas.rick@stadt.sg.ch",
};

// --- localStorage ------------------------------------------------------------

const KEY = "schnupper_teilnehmer";

export function ladeTeilnehmer(): Teilnehmer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Teilnehmer[]) : [];
  } catch {
    return [];
  }
}

export function speichereTeilnehmer(liste: Teilnehmer[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(liste));
}

export function neuerTeilnehmer(): Teilnehmer {
  const heute = new Date().toISOString().slice(0, 10);
  return {
    id: crypto.randomUUID(),
    vorname: "",
    nachname: "",
    email: "",
    schule: "",
    datum: heute,
    betreuer: "Nicolas Rick",
    stationen: [],
    bemerkung: "",
    erstellt: new Date().toISOString(),
  };
}

// --- Hilfen ------------------------------------------------------------------

export function vollerName(t: Teilnehmer): string {
  return `${t.vorname} ${t.nachname}`.trim() || "(ohne Namen)";
}

export function formatDatum(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return d && m && y ? `${d}.${m}.${y}` : iso;
}

/** Standard-Schnuppertage: gestern – heute (2-tägige Schnupperlehre), z.B. «18.–19.06.2026». */
export function schnuppertageRange(): string {
  const heute = new Date();
  const gestern = new Date(heute.getTime() - 86_400_000);
  const p = (n: number) => String(n).padStart(2, "0");
  const sameMonth = gestern.getMonth() === heute.getMonth() && gestern.getFullYear() === heute.getFullYear();
  if (sameMonth) {
    return `${p(gestern.getDate())}.–${p(heute.getDate())}.${p(heute.getMonth() + 1)}.${heute.getFullYear()}`;
  }
  return `${p(gestern.getDate())}.${p(gestern.getMonth() + 1)}.${gestern.getFullYear()}–${p(heute.getDate())}.${p(heute.getMonth() + 1)}.${heute.getFullYear()}`;
}

// --- Mailvorlagen ------------------------------------------------------------

export interface MailVorlage {
  id: string;
  name: string;
  betreff: string;
  text: string;
}

export function mailVorlagen(t: Teilnehmer): MailVorlage[] {
  const name = t.vorname || "…";
  const datum = formatDatum(t.datum) || "…";
  const grussZeile = "Freundliche Grüsse\nNicolas Rick\nInformatikdienste der Stadt St. Gallen";

  return [
    {
      id: "einladung",
      name: "Einladung",
      betreff: `Einladung zum Schnuppertag bei den IDS – ${datum}`,
      text:
        `Hallo ${name}\n\n` +
        `Schön, dass du dich für die Lehre als Informatiker/in EFZ Plattformentwicklung interessierst! ` +
        `Wir freuen uns, dich am ${datum} bei uns begrüssen zu dürfen.\n\n` +
        `Wichtige Infos:\n` +
        `• Start: 08:30 Uhr\n` +
        `• Ort: Informatikdienste der Stadt St. Gallen\n` +
        `• Dauer: bis ca. 16:30 Uhr\n` +
        `• Bitte mitbringen: gute Laune und Neugier – alles Weitere stellen wir bereit.\n\n` +
        `Bei Fragen kannst du dich jederzeit melden.\n\n` +
        grussZeile,
    },
    {
      id: "bestaetigung",
      name: "Bestätigung",
      betreff: `Deine Schnupperbestätigung – Schnuppertag vom ${datum}`,
      text:
        `Hallo ${name}\n\n` +
        `Vielen Dank für deinen Besuch am Schnuppertag vom ${datum}. Es hat uns gefreut, dich kennenzulernen!\n\n` +
        `Im Anhang findest du deine Schnupperbestätigung als PDF.\n\n` +
        `Wenn du dir eine Lehrstelle bei uns vorstellen kannst, freuen wir uns über deine Bewerbung an ${ORGANISATION.kontaktMail}.\n\n` +
        grussZeile,
    },
    {
      id: "bewerbung",
      name: "Bewerbungseingang",
      betreff: `Eingang deiner Bewerbung – Plattformentwicklung`,
      text:
        `Hallo ${name}\n\n` +
        `Vielen Dank für deine Bewerbung für die Lehrstelle als Informatiker/in EFZ Plattformentwicklung. ` +
        `Wir haben deine Unterlagen erhalten und melden uns nach der Sichtung bei dir.\n\n` +
        `Bitte habe etwas Geduld – wir nehmen uns Zeit für jede Bewerbung.\n\n` +
        grussZeile,
    },
    {
      id: "danke",
      name: "Danke / Feedback",
      betreff: `Danke für deinen Schnuppertag`,
      text:
        `Hallo ${name}\n\n` +
        `Danke nochmals für deinen Einsatz am ${datum}. Wir haben uns über dein Interesse und deine Mitarbeit gefreut.\n\n` +
        `Falls du Rückfragen zum Beruf oder zur Lehrstelle hast, melde dich gern jederzeit.\n\n` +
        grussZeile,
    },
  ];
}

/** mailto:-Link mit vorbefülltem Betreff & Text */
export function mailtoLink(t: Teilnehmer, v: MailVorlage): string {
  const params = new URLSearchParams({ subject: v.betreff, body: v.text });
  return `mailto:${t.email}?${params.toString()}`;
}

// =============================================================================
//  Bewertungsbogen «Auswertung der Schnupperlehre durch den Betrieb»
//  Inhaltlich 1:1 wie die bisherige Vorlage, nur digital & vorausgefüllt.
// =============================================================================

/** Eine Einfachauswahl-Frage (theoretisch/praktisch + Ausführungs-Kriterien) */
export interface SkalaFrage {
  key: string;
  frage: string;
  /** "kopf" = die zwei oberen Fragen, "ausfuehrung" = der 4er-Block */
  gruppe: "kopf" | "ausfuehrung";
  optionen: { v: string; l: string }[];
}

export const SKALA_FRAGEN: SkalaFrage[] = [
  {
    key: "theorie", gruppe: "kopf", frage: "Wie wurden theoretische Aufgaben erfasst?",
    optionen: [
      { v: "schnell", l: "schnell" }, { v: "gut", l: "gut" },
      { v: "folgt", l: "kann folgen" }, { v: "muehe", l: "hat Mühe" },
    ],
  },
  {
    key: "praxis", gruppe: "kopf", frage: "Wie wurden praktische Arbeiten angepackt?",
    optionen: [
      { v: "geschickt", l: "geschickt" }, { v: "zweckmaessig", l: "zweckmässig" },
      { v: "umstaendlich", l: "umständlich" }, { v: "planlos", l: "planlos" },
    ],
  },
  {
    key: "genauigkeit", gruppe: "ausfuehrung", frage: "Genauigkeit",
    optionen: [
      { v: "sehr_genau", l: "sehr genau" }, { v: "sorgfaeltig", l: "sorgfältig" },
      { v: "ordentlich", l: "ordentlich" }, { v: "fluechtig", l: "flüchtig" },
    ],
  },
  {
    key: "tempo", gruppe: "ausfuehrung", frage: "Tempo",
    optionen: [
      { v: "sehr_rasch", l: "sehr rasch" }, { v: "zuegig", l: "zügig" },
      { v: "angemessen", l: "angemessen" }, { v: "langsam", l: "langsam" },
    ],
  },
  {
    key: "ausdauer", gruppe: "ausfuehrung", frage: "Ausdauer",
    optionen: [
      { v: "unermuedlich", l: "unermüdlich" }, { v: "beharrlich", l: "beharrlich" },
      { v: "konstant", l: "konstant" }, { v: "gibt_auf", l: "gibt schnell auf" },
    ],
  },
  {
    key: "konzentration", gruppe: "ausfuehrung", frage: "Konzentrationsfähigkeit",
    optionen: [
      { v: "sehr_hoch", l: "sehr hoch" }, { v: "gut_dabei", l: "gut dabei" },
      { v: "maessig", l: "mässig" }, { v: "unkonzentriert", l: "unkonzentriert" },
    ],
  },
];

export const EIGNUNG_KRITERIEN: { id: string; label: string }[] = [
  { id: "interesse", label: "Interesse, Motivation" },
  { id: "auftreten", label: "Auftreten, Umgangsformen" },
  { id: "kontakt", label: "Kontaktfähigkeit, Offenheit" },
  { id: "team", label: "Teamfähigkeit" },
  { id: "puenktlich", label: "Pünktlichkeit, Zuverlässigkeit" },
  { id: "selbstaendig", label: "Selbständigkeit" },
  { id: "praktisch", label: "Praktische / körperliche Eignung" },
  { id: "intellektuell", label: "Intellektuelle / schulische Eignung" },
];

export const EIGNUNG_STUFEN = ["Sehr gut", "Gut", "Genügend", "Ungenügend", "Nicht beurteilbar"];

export interface Bewertung {
  /** "Folgende Arbeiten hat die/der Jugendliche durchgeführt" */
  arbeiten: string;
  datumBis: string;
  /** key (siehe SKALA_FRAGEN) -> gewählter Wert v */
  skala: Record<string, string>;
  /** Kriterium-id -> gewählte Stufe */
  eignung: Record<string, string>;
  begruendung: string;
  besprochen: "" | "ja" | "nein";
}

export function leereBewertung(): Bewertung {
  return { arbeiten: "", datumBis: "", skala: {}, eignung: {}, begruendung: "", besprochen: "" };
}

// =============================================================================
//  Schnupperbericht – personalisierte Sätze mit Name & richtiger Anrede
// =============================================================================

type G = "m" | "w" | "d";
// Satzanfang (Er/Sie/Name) und Satzmitte (er/sie/Name)
function sStart(n: string, g: G) { return g === "m" ? "Er" : g === "w" ? "Sie" : n; }
function sMid(n: string, g: G) { return g === "m" ? "er" : g === "w" ? "sie" : n; }
function poss(g: G) { return g === "m" ? "sein" : g === "w" ? "ihr" : "das"; }

export interface Beobachtung {
  id: string;
  label: string;
  satz: (n: string, g: G) => string;
}

export const BEOBACHTUNGEN: Beobachtung[] = [
  { id: "sorgfalt", label: "Sorgfältig & genau", satz: (n) => `${n} hat sehr sorgfältig und genau gearbeitet.` },
  { id: "team", label: "Teamfähig", satz: (n, g) => `${sStart(n, g)} war ein wertvoller Teil des Teams und half anderen gern.` },
  { id: "neugier", label: "Neugierig & wissbegierig", satz: (n, g) => `${sStart(n, g)} zeigte grosse Neugier und stellte gute Fragen.` },
  { id: "ausdauer", label: "Ausdauernd", satz: (n, g) => `Auch bei kniffligen Aufgaben blieb ${sMid(n, g)} dran und gab nicht auf.` },
  { id: "hardware", label: "Freude an Hardware", satz: (n, g) => `Besonders beim Arbeiten an der Hardware war ${sMid(n, g)} mit Begeisterung dabei.` },
  { id: "selbststaendig", label: "Selbständig", satz: (n, g) => `${sStart(n, g)} arbeitete selbständig und packte Aufgaben eigeninitiativ an.` },
  { id: "freundlich", label: "Freundlich & hilfsbereit", satz: (n, g) => `Im Umgang war ${sMid(n, g)} stets freundlich und hilfsbereit.` },
  { id: "schnell", label: "Schnelle Auffassung", satz: (n, g) => `Neue Themen erfasste ${sMid(n, g)} schnell.` },
];

/** Baut die Absätze des Schnupperberichts mit Name & richtiger Anrede. */
export function generiereBericht(t: Teilnehmer): string[] {
  const n = t.vorname || "Die teilnehmende Person";
  const g: G = t.geschlecht || "d";
  const datum = formatDatum(t.datum);
  const para: string[] = [];
  para.push(
    `${n} hat ${datum ? `am ${datum} ` : ""}einen Schnuppertag im Beruf Informatiker/in EFZ – Plattformentwicklung bei den Informatikdiensten der Stadt St. Gallen verbracht.`
  );
  const saetze = BEOBACHTUNGEN.filter((b) => t.bericht?.beobachtungen?.includes(b.id)).map((b) => b.satz(n, g));
  if (saetze.length) para.push(saetze.join(" "));
  if (t.bericht?.freitext?.trim()) para.push(t.bericht.freitext.trim());
  para.push(`Wir danken ${n} für ${poss(g)} Engagement und wünschen alles Gute für die berufliche Zukunft.`);
  return para;
}

/** Standard-Text der durchgeführten Arbeiten (aus der bisherigen Vorlage) */
export function standardArbeiten(): string {
  return (
    "Tag 1: Computer selber aufsetzen, Hardware-Reparatur durchführen und Software-Probleme lösen, " +
    "Berufswahl-Analyse und binär rechnen.\n" +
    "Tag 2: Webserver auf Windows Server 2022 installieren, eigene Website bereitstellen, " +
    "Hardware-Komponenten für einen Gaming-PC zusammenstellen, programmieren mit Scratch und " +
    "Aufgaben mit PowerShell durchführen."
  );
}

// --- Auto-«Beurteilung in Worten» aus den angekreuzten Bewertungen -----------
const SKALA_PHRASE: Record<string, string> = {
  schnell: "erfasste theoretische Aufgaben schnell", gut: "erfasste theoretische Aufgaben gut",
  folgt: "konnte den theoretischen Aufgaben folgen", muehe: "hatte mit theoretischen Aufgaben noch Mühe",
  geschickt: "packte praktische Arbeiten geschickt an", zweckmaessig: "ging praktische Arbeiten zweckmässig an",
  umstaendlich: "löste praktische Arbeiten noch umständlich", planlos: "ging praktische Arbeiten eher planlos an",
};
const AUSF_PHRASE: Record<string, string> = {
  sehr_genau: "sehr genau", sorgfaeltig: "sorgfältig", ordentlich: "ordentlich", fluechtig: "eher flüchtig",
  sehr_rasch: "sehr rasch", zuegig: "zügig", angemessen: "in angemessenem Tempo", langsam: "eher langsam",
  unermuedlich: "unermüdlich", beharrlich: "beharrlich", konstant: "mit konstanter Ausdauer", gibt_auf: "wenig ausdauernd",
  sehr_hoch: "hoch konzentriert", gut_dabei: "konzentriert bei der Sache", maessig: "mit wechselnder Konzentration", unkonzentriert: "eher unkonzentriert",
};
const EIGNUNG_WORT: Record<string, string> = {
  interesse: "Motivation", auftreten: "Auftreten", kontakt: "Kontaktfreude", team: "Teamfähigkeit",
  puenktlich: "Zuverlässigkeit", selbstaendig: "Selbständigkeit", praktisch: "praktischer Eignung", intellektuell: "schulischer Eignung",
};
function joinUnd(a: string[]): string {
  return a.length <= 1 ? (a[0] || "") : a.slice(0, -1).join(", ") + " und " + a[a.length - 1];
}

/** Setzt aus den angekreuzten Skalen + der Eignungs-Matrix einen Fliesstext zusammen
 *  (Textbausteine, geschlechts-korrekt). Wird im Bewertungsbogen als Vorschlag gezeigt. */
export function generiereBegruendung(t: Teilnehmer, b: Bewertung): string {
  const name = t.vorname || "Die teilnehmende Person";
  const g: G = t.geschlecht || "d";
  const low = g === "m" ? "er" : g === "w" ? "sie" : name;
  const out: string[] = [];
  const subj = () => (out.length === 0 ? name : low);

  const tp = ["theorie", "praxis"].map((k) => b.skala[k]).filter(Boolean).map((v) => SKALA_PHRASE[v]).filter(Boolean);
  if (tp.length) out.push(`${name} ${joinUnd(tp)}.`);

  const cd = ["genauigkeit", "tempo", "ausdauer", "konzentration"].map((k) => b.skala[k]).filter(Boolean).map((v) => AUSF_PHRASE[v]).filter(Boolean);
  if (cd.length) out.push(`Die Arbeiten erledigte ${subj()} ${joinUnd(cd)}.`);

  const grp: Record<string, string[]> = { "Sehr gut": [], "Gut": [], "Genügend": [], "Ungenügend": [] };
  EIGNUNG_KRITERIEN.forEach((k) => { const s = b.eignung[k.id]; if (s && grp[s]) grp[s].push(EIGNUNG_WORT[k.id] || k.label); });
  if (grp["Sehr gut"].length) out.push(`Besonders überzeugte ${subj()} bei ${joinUnd(grp["Sehr gut"])}.`);
  if (grp["Gut"].length) out.push(`Gute Leistungen zeigte ${subj()} bei ${joinUnd(grp["Gut"])}.`);
  if (grp["Genügend"].length) out.push(`Solide, mit Luft nach oben, war ${subj()} bei ${joinUnd(grp["Genügend"])}.`);
  if (grp["Ungenügend"].length) out.push(`Entwicklungspotenzial besteht bei ${joinUnd(grp["Ungenügend"])}.`);

  return out.join(" ");
}
