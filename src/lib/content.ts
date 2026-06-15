// =============================================================================
//  Inhalte & Auswertungs-Logik der Berufswahl-Analyse
//  Plattformentwicklung EFZ · IDS Stadt St. Gallen
//
//  Alles, was sich am Inhalt ändern lässt, liegt hier — bewusst getrennt von
//  der Darstellung, damit Fragen/Texte ohne Code-Kenntnisse anpassbar sind.
// =============================================================================

// --- Dimensionen, auf die der Selbsttest misst --------------------------------
// Plattformentwicklung lebt von Hardware-Affinität, systematischem Tüfteln,
// Service-Haltung, Sorgfalt und Technik-Neugier. Genau diese fünf prüfen wir.

export type DimId =
  | "hardware" | "tuefteln" | "service" | "sorgfalt" | "neugier"
  | "netzwerk" | "verantwortung" | "belastbarkeit";

export interface Dimension {
  id: DimId;
  label: string;
  emoji: string;
  /** Stärke-Text, wenn der/die Jugendliche hier hoch punktet */
  staerke: string;
  /** Ehrlicher Wachstums-Text, wenn hier wenig Punkte */
  wachstum: string;
  /** Wie wichtig diese Dimension für Plattformentwicklung ist (Gewicht) */
  gewicht: number;
}

export const DIMENSIONS: Record<DimId, Dimension> = {
  hardware: {
    id: "hardware",
    label: "Hardware & Hände",
    emoji: "🔧",
    staerke:
      "Du arbeitest gern mit den Händen und an echten Geräten. Genau das machst du bei uns täglich — Notebooks aufsetzen, Festplatten tauschen, Peripherie verbinden.",
    wachstum:
      "Mit Geräten zu hantieren ist (noch) nicht dein Ding. In der Plattformentwicklung schraubst du viel — probier am Schnuppertag aus, ob es dir mit etwas Übung Spass macht.",
    gewicht: 1.3,
  },
  tuefteln: {
    id: "tuefteln",
    label: "Tüfteln & Logik",
    emoji: "🧩",
    staerke:
      "Du lässt nicht locker, bis ein Problem gelöst ist. Fehlersuche ist der Kern des Berufs — vom 'PC startet nicht' bis zum verzwickten Netzwerk-Problem.",
    wachstum:
      "Systematisches Fehlersuchen darfst du noch üben. Das lernt man — wichtig ist die Neugier, der Ursache auf den Grund zu gehen statt zu raten.",
    gewicht: 1.3,
  },
  service: {
    id: "service",
    label: "Menschen helfen",
    emoji: "🤝",
    staerke:
      "Du hilfst anderen gern und bleibst dabei ruhig. Im ServiceDesk hast du täglich mit Kundinnen und Kunden zu tun, die ein Problem haben — deine Geduld zählt.",
    wachstum:
      "Der Umgang mit gestressten Leuten liegt dir noch nicht so. Im ServiceDesk gehört das dazu — Freundlichkeit unter Druck kann man trainieren.",
    gewicht: 1.0,
  },
  sorgfalt: {
    id: "sorgfalt",
    label: "Sorgfalt & Ordnung",
    emoji: "📋",
    staerke:
      "Du arbeitest sauber und zuverlässig — auch bei Routine. In der IT ist das Gold wert: dokumentieren, Prozesse einhalten, nichts vergessen.",
    wachstum:
      "Genauigkeit und Dokumentation sind nicht deine Lieblingsthemen. In der IT entscheidet oft ein vergessenes Detail über Erfolg oder Fehler — daran lohnt sich zu arbeiten.",
    gewicht: 1.1,
  },
  neugier: {
    id: "neugier",
    label: "Technik-Neugier",
    emoji: "💡",
    staerke:
      "Du willst verstehen, wie Technik zusammenhängt, und lernst gern Neues. Perfekt — die IT verändert sich ständig, Stillstand gibt es nicht.",
    wachstum:
      "Dich tief in Technik einzulesen reizt dich (noch) nicht stark. Ein Grundinteresse an Computern, Netzwerken & Systemen hilft im Berufsalltag sehr.",
    gewicht: 1.0,
  },
  netzwerk: {
    id: "netzwerk",
    label: "Systeme & Netzwerke",
    emoji: "🌐",
    staerke:
      "Du willst verstehen, wie Computer, Server und Netzwerke zusammenspielen. Genau darum dreht sich Plattformentwicklung – vom Einzel-PC bis zum Rechenzentrum.",
    wachstum:
      "Wie Systeme & Netzwerke zusammenhängen, hat dich noch nicht gepackt. Dieses Verständnis baust du in der Lehre Schritt für Schritt auf.",
    gewicht: 1.2,
  },
  verantwortung: {
    id: "verantwortung",
    label: "Verantwortung & Sicherheit",
    emoji: "🔒",
    staerke:
      "Du gehst sorgsam mit Zugängen und Daten um und denkst an Sicherheit. In der IT vertraut man dir viel an – das ist Gold wert.",
    wachstum:
      "Sicherheit und sorgsamer Umgang mit Daten sind noch nicht dein Fokus. In der IT trägst du schnell Verantwortung – das wächst mit der Erfahrung.",
    gewicht: 1.0,
  },
  belastbarkeit: {
    id: "belastbarkeit",
    label: "Geduld & Ruhe",
    emoji: "💪",
    staerke:
      "Du bleibst ruhig und geduldig, auch wenn etwas nicht klappt. In der IT geht oft etwas schief – genau dann zählt dein kühler Kopf.",
    wachstum:
      "Wenn etwas klemmt, verlierst du schnell die Geduld. In der IT gehört Frust dazu – Gelassenheit kann man trainieren.",
    gewicht: 1.0,
  },
};

// --- Selbsttest-Fragen --------------------------------------------------------
// Aussagen, denen man auf einer 4er-Skala zustimmt. Je 2 Aussagen pro Dimension.

export interface Frage {
  id: string;
  text: string;
  dim: DimId;
}

export const FRAGEN: Frage[] = [
  { id: "q1", text: "Ich nehme gerne Geräte auseinander, um zu verstehen, wie sie funktionieren.", dim: "hardware" },
  { id: "q2", text: "Mit den Händen arbeiten (Kabel, Schrauben, Komponenten) liegt mir mehr, als nur am Bildschirm zu sitzen.", dim: "hardware" },
  { id: "q3", text: "Wenn etwas nicht funktioniert, probiere ich systematisch, bis ich die Ursache gefunden habe.", dim: "tuefteln" },
  { id: "q4", text: "Ein kniffliges Logik-Rätsel lässt mir keine Ruhe, bis ich es gelöst habe.", dim: "tuefteln" },
  { id: "q5", text: "Es macht mir Freude, anderen bei technischen Problemen zu helfen.", dim: "service" },
  { id: "q6", text: "Ich bleibe ruhig, wenn jemand gestresst ist und schnell Hilfe braucht.", dim: "service" },
  { id: "q7", text: "Ich arbeite gern sauber und schreibe auf, was ich gemacht habe.", dim: "sorgfalt" },
  { id: "q8", text: "Auch wiederkehrende oder weniger spannende Aufgaben erledige ich zuverlässig.", dim: "sorgfalt" },
  { id: "q9", text: "Neue Technik – Computer, Netzwerke, Systeme – finde ich spannend.", dim: "neugier" },
  { id: "q10", text: "Ich lerne lieber ständig Neues dazu, als immer das Gleiche zu machen.", dim: "neugier" },
  { id: "q11", text: "Mich interessiert, wie das Internet und Netzwerke eigentlich funktionieren.", dim: "netzwerk" },
  { id: "q12", text: "Ich würde gern verstehen, wie viele Computer in einer Firma zu einem System zusammenspielen.", dim: "netzwerk" },
  { id: "q13", text: "Mit Passwörtern und Zugängen gehe ich verantwortungsvoll und vorsichtig um.", dim: "verantwortung" },
  { id: "q14", text: "Mir ist wichtig, dass Daten sicher sind und nicht in falsche Hände geraten.", dim: "verantwortung" },
  { id: "q15", text: "Wenn etwas nicht funktioniert, bleibe ich ruhig und probiere weiter.", dim: "belastbarkeit" },
  { id: "q16", text: "Auch wenn es stressig wird, behalte ich einen kühlen Kopf.", dim: "belastbarkeit" },
];

export const SKALA = [
  { wert: 3, label: "Trifft genau zu" },
  { wert: 2, label: "Eher ja" },
  { wert: 1, label: "Eher nein" },
  { wert: 0, label: "Gar nicht" },
];

// --- Auswertung ---------------------------------------------------------------

export interface DimScore {
  dim: Dimension;
  /** 0..1 normalisiert */
  anteil: number;
}

export interface Auswertung {
  /** Gesamt-Passung 0..100, gewichtet */
  passung: number;
  scores: DimScore[];
  staerken: DimScore[]; // höchste Dimensionen
  wachstum: DimScore[]; // tiefste Dimensionen
  fazit: string;
}

export function auswerten(antworten: Record<string, number>): Auswertung {
  const proDim: Record<DimId, number[]> = {
    hardware: [], tuefteln: [], service: [], sorgfalt: [], neugier: [],
    netzwerk: [], verantwortung: [], belastbarkeit: [],
  };
  for (const frage of FRAGEN) {
    const a = antworten[frage.id];
    if (typeof a === "number") proDim[frage.dim].push(a);
  }

  const scores: DimScore[] = (Object.keys(proDim) as DimId[]).map((id) => {
    const werte = proDim[id];
    const max = werte.length * 3;
    const summe = werte.reduce((s, v) => s + v, 0);
    return { dim: DIMENSIONS[id], anteil: max > 0 ? summe / max : 0 };
  });

  // Gewichtete Gesamt-Passung
  const gewichtSumme = scores.reduce((s, x) => s + x.dim.gewicht, 0);
  const gewichtet = scores.reduce((s, x) => s + x.anteil * x.dim.gewicht, 0);
  const passung = Math.round((gewichtet / gewichtSumme) * 100);

  const sortiert = [...scores].sort((a, b) => b.anteil - a.anteil);
  const staerken = sortiert.slice(0, 2);
  const wachstum = sortiert.slice(-2).reverse();

  let fazit: string;
  if (passung >= 75) {
    fazit =
      "Das passt richtig gut! Deine Antworten zeigen viel von dem, was Plattformentwicklung ausmacht. Schau am Schnuppertag genau hin – die Chancen stehen gut, dass dir der Beruf liegt.";
  } else if (passung >= 55) {
    fazit =
      "Da steckt einiges drin! Mehrere deiner Stärken passen gut zur Plattformentwicklung. Nutze den Schnuppertag, um die offenen Punkte für dich zu klären.";
  } else if (passung >= 35) {
    fazit =
      "Ein paar Berührungspunkte sind da. Ob der Beruf wirklich zu dir passt, findest du am besten heraus, indem du den Schnuppertag praktisch ausprobierst – Theorie und Gefühl sind oft zwei verschiedene Dinge.";
  } else {
    fazit =
      "Auf dem Papier sieht es nach wenig Überschneidung aus – aber ein Test ist kein Urteil. Vielleicht entdeckst du am Schnuppertag eine Seite an dir, die du noch nicht kanntest. Bleib offen und probier es aus.";
  }

  return { passung, scores, staerken, wachstum, fazit };
}

// =============================================================================
//  Mini-Aufgaben
// =============================================================================

// --- 1) Bit-Uhr (eure Aufgabe von Slide 30: 32 16 8 4 2 1) --------------------
export const BIT_WERTE = [32, 16, 8, 4, 2, 1];
export const BIT_ZIELE = [
  { ziel: 27, hinweis: "27 Minuten – welche Lämpchen ergeben zusammen 27?" },
  { ziel: 41, hinweis: "41 Sekunden – tüftle dich an die richtige Kombination heran." },
];

// --- 2) ServiceDesk-Triage "PC startet nicht" (Slide 26) ----------------------
export interface TriageSchritt {
  frage: string;
  optionen: { text: string; richtig: boolean; feedback: string }[];
}

export const TRIAGE: TriageSchritt[] = [
  {
    frage:
      "Eine Kundin ruft an: «Mein Computer startet nicht mehr!» Was machst du als Erstes?",
    optionen: [
      {
        text: "Sofort die Festplatte austauschen.",
        richtig: false,
        feedback:
          "Zu schnell! Du weisst ja noch gar nicht, woran es liegt. Erst eingrenzen, dann handeln.",
      },
      {
        text: "Nachfragen: Leuchtet etwas? Kommt ein Bild oder ein Ton? Was passiert genau?",
        richtig: true,
        feedback:
          "Genau so. Im ServiceDesk grenzt du das Problem mit gezielten Fragen ein, bevor du etwas anpackst.",
      },
      {
        text: "Den Computer komplett neu installieren.",
        richtig: false,
        feedback:
          "Das wäre mit Kanonen auf Spatzen geschossen – und alle Daten wären weg. Erst die Ursache suchen.",
      },
    ],
  },
  {
    frage:
      "Die Kundin sagt: «Es leuchtet kein einziges Lämpchen, gar nichts tut sich.» Worauf tippst du zuerst?",
    optionen: [
      {
        text: "Auf die Stromversorgung – Kabel, Steckdose, Netzteil prüfen.",
        richtig: true,
        feedback:
          "Stark. Vom Einfachen zum Komplizierten: kein Lämpchen = oft kein Strom. Das prüft man zuerst.",
      },
      {
        text: "Auf einen Virus.",
        richtig: false,
        feedback:
          "Ein Virus würde den PC nicht komplett tot machen. Wenn nichts leuchtet, fehlt meist schlicht der Strom.",
      },
      {
        text: "Auf ein kaputtes Betriebssystem.",
        richtig: false,
        feedback:
          "Dann würde der PC zumindest kurz anlaufen. Tot = zuerst an den Strom denken.",
      },
    ],
  },
];

// --- 3) Gerät / Auftrag → Kunde (echte IDS-Kunden, Slide 6) -------------------
export const KUNDEN = [
  "Feuerwehr", "Schulen", "Stadtpolizei", "KJZK", "Stadtwerke", "Tiefbauamt",
];

export interface ZuordnungFrage {
  auftrag: string;
  richtig: string;
  erklaerung: string;
}

export const ZUORDNUNG: ZuordnungFrage[] = [
  {
    auftrag: "Hunderte Computer in Klassenzimmern und Computerräumen einrichten.",
    richtig: "Schulen",
    erklaerung: "Schulen brauchen viele, einheitlich aufgesetzte Geräte – ideal fürs Aufsetzen über Netzwerk (SCCM).",
  },
  {
    auftrag: "Robuste, einsatztaugliche Tablets für Fahrzeuge im Ernstfall.",
    richtig: "Feuerwehr",
    erklaerung: "Die Feuerwehr braucht zuverlässige Technik, die auch im Einsatz funktioniert.",
  },
  {
    auftrag: "Spezielle Computer in den Behandlungsräumen einer Zahnklinik für Kinder.",
    richtig: "KJZK",
    erklaerung: "Das KJZK (Kinder- & Jugend-Zahnklinik) ist eine unserer Kundinnen – auch medizinische Arbeitsplätze betreuen wir.",
  },
];

// =============================================================================
//  «Das erwartet dich» — Tagesablauf & Tätigkeiten
// =============================================================================

export const TAGESABLAUF = [
  { zeit: "08:30", text: "Begrüssung & Vorstellungsrunde" },
  { zeit: "08:50", text: "Notebook mit Windows 11 aufsetzen + diese Analyse" },
  { zeit: "10:15", text: "Rundgang durch IDS & Warenlager" },
  { zeit: "11:15", text: "ServiceDesk-Portal & erster Fall: «PC startet nicht»" },
  { zeit: "13:30", text: "Regelmässige Aufgaben, Occasionsgeräte & Entsorgung" },
  { zeit: "14:15", text: "Uhrzeit berechnen & Festplatte ausbauen" },
  { zeit: "14:45", text: "Eigene Probleme erzeugen – und gegenseitig lösen" },
  { zeit: "15:45", text: "Computer über das Netzwerk aufsetzen" },
  { zeit: "16:15", text: "Infos zum 2. Tag & Abschluss" },
];

export interface Taetigkeit {
  emoji: string;
  titel: string;
  text: string;
  ehrlich: string; // die ehrliche Kehrseite
}

export const TAETIGKEITEN: Taetigkeit[] = [
  {
    emoji: "💻", titel: "Computer aufsetzen",
    text: "Notebooks und PCs einrichten – einzeln oder gleich Dutzende über das Netzwerk (SCCM).",
    ehrlich: "Das Gleiche oft viele Male sauber zu machen, gehört dazu.",
  },
  {
    emoji: "🎧", titel: "ServiceDesk",
    text: "Anfragen entgegennehmen, Probleme eingrenzen, Fälle lösen – du bist die erste Hilfe für die ganze Stadtverwaltung.",
    ehrlich: "Manche Kund:innen sind gestresst. Ruhig und freundlich bleiben ist Teil des Jobs.",
  },
  {
    emoji: "🔧", titel: "Hardware",
    text: "Festplatten tauschen, Peripherie anschliessen, Geräte reparieren und aufrüsten.",
    ehrlich: "Auch das Entsorgen alter Geräte und das Verwalten von Occasionen gehört dazu.",
  },
  {
    emoji: "🌐", titel: "Netzwerk & Systeme",
    text: "Verstehen, wie Geräte, Server und Netzwerke zusammenspielen – und Computer übers Netzwerk verteilen.",
    ehrlich: "Da steckt viel Theorie dahinter, die man sich erarbeiten muss.",
  },
  {
    emoji: "📄", titel: "Dokumentation",
    text: "Sauber festhalten, was du gemacht hast, damit andere es nachvollziehen können.",
    ehrlich: "Schreibkram – aber ohne ihn bricht im Betrieb schnell Chaos aus.",
  },
  {
    emoji: "🔁", titel: "Regelmässige Aufgaben",
    text: "Wiederkehrende Wartungen und Kontrollen, die den Laden am Laufen halten.",
    ehrlich: "Nicht jeden Tag ein Abenteuer – Zuverlässigkeit zählt mehr als Action.",
  },
];

export const AUSBILDUNGSWEG = [
  { dauer: "3 Jahre", titel: "Oberstufe (Sek)", aktiv: false },
  { dauer: "4 Jahre", titel: "Lehre Informatiker/in EFZ – Plattformentwicklung", aktiv: true },
  { dauer: "+1 Jahr", titel: "Berufsmaturität (BMS, evtl. berufsbegleitend)", aktiv: false },
  { dauer: "ca. 4 Jahre", titel: "Fachhochschule (optional)", aktiv: false },
];

// =============================================================================
//  HUB — Zeitpläne, Aufgaben & Downloads (beide Schnuppertage)
// =============================================================================

export interface TagInfo {
  tag: 1 | 2;
  titel: string;
  leitung: string;
  ablauf: { zeit: string; text: string }[];
}

// Tag 1 = Nicolas (Grundlagen, Hardware, ServiceDesk) · Tag 2 = Gioele (Server)
export const TAGE: TagInfo[] = [
  {
    tag: 1,
    titel: "Tag 1 · Grundlagen & Hardware",
    leitung: "Nicolas Rick",
    ablauf: [
      { zeit: "08:30", text: "Begrüssung & Vorstellungsrunde" },
      { zeit: "08:50", text: "Notebook mit Windows 11 aufsetzen + Berufswahl-Analyse" },
      { zeit: "10:15", text: "Rundgang durch IDS & Warenlager" },
      { zeit: "10:30", text: "Notebook fertig einrichten, Peripherie verbinden" },
      { zeit: "11:15", text: "ServiceDesk-Portal & Fall «PC startet nicht», Dokumentformatierung" },
      { zeit: "12:00", text: "Mittagessen" },
      { zeit: "13:30", text: "Regelmässige Aufgaben, Occasionsgeräte & Entsorgung" },
      { zeit: "14:15", text: "Uhrzeit berechnen & Festplatte ausbauen" },
      { zeit: "14:45", text: "Eigene Probleme erzeugen – und gegenseitig lösen" },
      { zeit: "15:45", text: "Computer über das Netzwerk aufsetzen (OSD/SCCM)" },
      { zeit: "16:15", text: "Infos zum 2. Tag, Abschluss & Verabschiedung" },
    ],
  },
  {
    tag: 2,
    titel: "Tag 2 · Server & selbständiges Arbeiten",
    leitung: "Gioele Parenti",
    ablauf: [
      { zeit: "08:30", text: "Infos zum Tag, morgendliche Arbeiten eines 2.-Jahr-Lernenden" },
      { zeit: "08:45", text: "Vorstellung der Aufgaben & selbständiges Arbeiten" },
      { zeit: "10:00", text: "Pause, weiter an den Aufgaben" },
      { zeit: "11:00", text: "Auftrag eines 2.-Jahr-Lernenden · Serverinstallation" },
      { zeit: "12:00", text: "Mittagspause" },
      { zeit: "13:00", text: "Besichtigung Serverraum" },
      { zeit: "14:00", text: "Weiter an den Aufgaben, Bewertungsbogen ausfüllen" },
      { zeit: "15:00", text: "Pause & Schlussgespräche" },
      { zeit: "16:30", text: "Fragen / Verabschiedung" },
    ],
  },
];

export type AufgabeTool = "OnlyOffice" | "Browser" | "PowerShell" | "Scratch" | "Hardware";

export interface Aufgabe {
  id: string;
  tag: 1 | 2;
  emoji: string;
  titel: string;
  ziel: string;
  schritte: string[];
  hinweise: string[];
  tool: AufgabeTool;
  /** Dateinamen aus dem Download-Manifest, die zu dieser Aufgabe gehören */
  downloads: string[];
}

export const AUFGABEN: Aufgabe[] = [
  // ---- Tag 1 (Nicolas) ----
  {
    id: "t1-doku", tag: 1, emoji: "📄", titel: "Dokumentformatierung", tool: "OnlyOffice",
    ziel: "Formatiere ein unsauberes Dokument sauber – wie im IT-Alltag, wenn andere darauf weiterarbeiten.",
    schritte: [
      "Lade das Übungsdokument herunter und öffne es im Office (OnlyOffice im Browser).",
      "Setze Überschriften, Absätze und einheitliche Schrift.",
      "Speichere als «Vorname_Nachname».",
    ],
    hinweise: ["Kein lokales Word nötig – läuft im Browser.", "Sauberkeit zählt mehr als Tempo."],
    downloads: ["uebung-dokument.docx"],
  },
  {
    id: "t1-uhr", tag: 1, emoji: "🕐", titel: "Uhrzeit berechnen (Bit-Uhr)", tool: "Hardware",
    ziel: "Verstehe, wie Computer Zahlen im Binärsystem darstellen (32-16-8-4-2-1).",
    schritte: [
      "Übe direkt in der Berufswahl-Analyse (Mini-Aufgabe Bit-Uhr).",
      "Lies eine Binäruhr ab und rechne Stunden/Minuten/Sekunden.",
    ],
    hinweise: ["Jedes Lämpchen hat einen Wert – zusammenzählen ergibt die Zahl."],
    downloads: [],
  },
  {
    id: "t1-festplatte", tag: 1, emoji: "🔧", titel: "Festplatte wechseln", tool: "Hardware",
    ziel: "Tausche die Festplatte/SSD eines Notebooks fachgerecht aus.",
    schritte: [
      "Notebook stromlos machen, Gehäuse öffnen.",
      "Alte Festplatte ausbauen, neue einsetzen.",
      "Zusammenbauen und Funktion prüfen.",
    ],
    hinweise: ["Auf statische Entladung achten.", "Schrauben geordnet ablegen."],
    downloads: [],
  },
  {
    id: "t1-fehler", tag: 1, emoji: "🐞", titel: "9 Fehler lösen & eigene erzeugen", tool: "Hardware",
    ziel: "Finde und behebe vorbereitete Fehler – und stelle gegenseitig neue.",
    schritte: [
      "Arbeite die 9 Fehler am Notebook systematisch ab.",
      "Erzeuge anschliessend eigene Problemstellungen für deine Kolleg:innen.",
    ],
    hinweise: ["Erst eingrenzen, dann handeln – wie im ServiceDesk."],
    downloads: [],
  },
  // ---- Tag 2 (Gioele) ----
  {
    id: "t2-webserver", tag: 2, emoji: "🖥️", titel: "Aufgabe 1: Webserver", tool: "Browser",
    ziel: "Lerne, wie man einen einfachen Webserver aufsetzt und eine erste Webseite veröffentlicht.",
    schritte: [
      "VM erstellen (siehe «Aufgabe 0 – VM erstellen»).",
      "Webserver installieren (IIS), starten & im Browser testen.",
      "HTML-Datei erstellen (z. B. index.html) und auf dem Server platzieren.",
      "www.test.com auf http://IP-des-Geräts weiterleiten und testen.",
    ],
    hinweise: ["HTML lässt sich mit Notepad bearbeiten.", "Achte auf Verzeichnisstruktur & Dateinamen."],
    downloads: ["Aufgabe-0-VM-erstellen.md", "index-starter.html"],
  },
  {
    id: "t2-gamingpc", tag: 2, emoji: "🎮", titel: "Aufgabe 2: Gaming-PC zusammenstellen", tool: "OnlyOffice",
    ziel: "Stelle einen leistungsfähigen Gaming-PC virtuell zusammen und begründe deine Komponentenwahl.",
    schritte: [
      "Halte das Budget ein: maximal CHF 2'000.",
      "Komponenten zusammenstellen, Preise & technische Details notieren.",
      "Sicherstellen, dass alle Teile kompatibel sind (v. a. GPU/CPU).",
      "Erstelle eine Excel-Tabelle mit deinen Komponenten (evtl. mit Bildern).",
    ],
    hinweise: ["Nutze digitec.ch, brack.ch, toppreise.ch.", "Tabelle läuft im Browser (OnlyOffice) – keine Excel-Lizenz nötig."],
    downloads: ["gaming-pc-vorlage.xlsx"],
  },
  {
    id: "t2-powershell", tag: 2, emoji: "⚙️", titel: "Aufgabe 3: PowerShell-Skript", tool: "PowerShell",
    ziel: "Erstelle ein PowerShell-Skript, das PC-Infos anzeigt und einfache Berechnungen durchführt.",
    schritte: [
      "Zeige Computername, Benutzername und Anzahl Prozessoren an.",
      "Frage zwei Zahlen und die Rechenart (+, -, *, /) ab.",
      "Gib das Resultat aus.",
    ],
    hinweise: ["Bearbeite das Grundgerüst im PowerShell-ISE-Editor.", "Download enthält das fertige Gerüst mit TODOs."],
    downloads: ["schnupper_geruest.ps1"],
  },
  {
    id: "t2-scratch", tag: 2, emoji: "🧩", titel: "Aufgabe 4: Scratch (Pac-Man)", tool: "Scratch",
    ziel: "Programmiere in Scratch ein einfaches Spiel ähnlich «Pac-Man».",
    schritte: [
      "Öffne das Gerüst «pacman_gerüst» – Spielbrett & Figuren sind vorhanden.",
      "Geister bewegen sich frei und wechseln an blauen Linien die Richtung.",
      "Steuere Pac-Man mit den Pfeiltasten; Linie oder Geist berühren = Spielende.",
      "Speichere/exportiere dein Spiel oder mache einen Screenshot.",
    ],
    hinweise: ["Nutze die installierte Scratch-App.", "Bonus: Punkte zum Sammeln oder Soundeffekte."],
    downloads: ["pacman_geruest.sb3"],
  },
];

export interface Download {
  file: string;
  label: string;
  desc: string;
  /** true = echte Datei liegt bei; false = Platzhalter, Berufsbildner muss sie hochladen */
  vorhanden: boolean;
  tag: 1 | 2;
}

export const DOWNLOADS: Download[] = [
  { file: "schnupper_geruest.ps1", label: "PowerShell-Gerüst", desc: "Grundgerüst für Aufgabe 3 mit TODOs.", vorhanden: true, tag: 2 },
  { file: "index-starter.html", label: "HTML-Starter", desc: "Start-Seite für den Webserver (Aufgabe 1).", vorhanden: true, tag: 2 },
  { file: "Aufgabe-0-VM-erstellen.md", label: "Aufgabe 0: VM erstellen", desc: "Schritt-für-Schritt-Anleitung zur VM.", vorhanden: true, tag: 2 },
  { file: "gaming-pc-vorlage.xlsx", label: "Gaming-PC-Vorlage", desc: "Excel-Vorlage für die Komponentenliste.", vorhanden: false, tag: 2 },
  { file: "pacman_geruest.sb3", label: "Scratch Pac-Man-Gerüst", desc: "Scratch-Projekt mit Spielbrett & Figuren.", vorhanden: false, tag: 2 },
  { file: "uebung-dokument.docx", label: "Übungsdokument", desc: "Unformatiertes Dokument für die Dokumentformatierung.", vorhanden: false, tag: 1 },
];
