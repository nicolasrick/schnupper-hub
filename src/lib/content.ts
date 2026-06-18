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
  /** Umgekehrt gepolt: hier ist „trifft genau zu" die schlechte Antwort.
   *  Verhindert, dass blindes „immer trifft genau zu" gewinnt – man muss lesen. */
  reverse?: boolean;
}

// Echte Berufswahl-Analyse: Interessen, Arbeitsweise & Situationen – jede Frage
// einmal, kein „Anfang = Ende umgekehrt". Wenige umgekehrt gepolte Fragen sind
// VERSTREUT und situativ formuliert (gegen blindes Durchklicken).
export const FRAGEN: Frage[] = [
  { id: "q1", text: "Ich baue, repariere oder bastle gern an Geräten – auch in der Freizeit.", dim: "hardware" },
  { id: "q2", text: "Ich will oft wissen, wie ein Gerät oder ein Programm im Inneren funktioniert.", dim: "neugier" },
  { id: "q3", text: "Knobel-, Logik- oder Strategiespiele machen mir Spass.", dim: "tuefteln" },
  { id: "q4", text: "Es macht mir Freude, jemandem bei einem Problem zu helfen.", dim: "service" },
  { id: "q5", text: "Immer dasselbe sauber und genau zu erledigen, finde ich eher langweilig.", dim: "sorgfalt", reverse: true },
  { id: "q6", text: "Mich interessiert, wie Computer, Handys und das Internet zusammenhängen.", dim: "netzwerk" },
  { id: "q7", text: "Auch wenn eine Aufgabe mühsam wird, bleibe ich dran.", dim: "belastbarkeit" },
  { id: "q8", text: "Ich packe gern mit den Händen an, statt nur am Bildschirm zu sitzen.", dim: "hardware" },
  { id: "q9", text: "Mit Passwörtern und persönlichen Daten gehe ich sorgfältig um.", dim: "verantwortung" },
  { id: "q10", text: "Bei einem schwierigen Problem hole ich lieber sofort Hilfe, statt selbst zu suchen.", dim: "tuefteln", reverse: true },
  { id: "q11", text: "Neue Technik auszuprobieren reizt mich.", dim: "neugier" },
  { id: "q12", text: "Ich kann gut erklären, damit andere etwas verstehen.", dim: "service" },
  { id: "q13", text: "Mir fällt auf, wenn ein kleines Detail nicht stimmt.", dim: "sorgfalt" },
  { id: "q14", text: "Wenn ein Fehler nach mehreren Versuchen immer noch da ist, würde ich am liebsten aufhören.", dim: "belastbarkeit", reverse: true },
  { id: "q15", text: "Wie in einer Firma viele Geräte zu einem System zusammenarbeiten, finde ich spannend.", dim: "netzwerk" },
  { id: "q16", text: "Wenn etwas nicht funktioniert, suche ich selber nach der Ursache, bevor ich aufgebe.", dim: "tuefteln" },
  { id: "q17", text: "Wenn man sich auf mich verlässt, gebe ich mein Bestes.", dim: "verantwortung" },
  { id: "q18", text: "Technik interessiert mich eigentlich nur, solange sie einfach von allein funktioniert.", dim: "neugier", reverse: true },
  { id: "q19", text: "Ich arbeite lieber genau und sauber als schnell und ungefähr.", dim: "sorgfalt" },
  { id: "q20", text: "Wenn etwas schiefgeht, bleibe ich ruhig statt mich zu ärgern.", dim: "belastbarkeit" },
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
    // Umgekehrt gepolte Fragen invertieren (3 - a): „trifft genau zu" zieht hier ab.
    if (typeof a === "number") proDim[frage.dim].push(frage.reverse ? 3 - a : a);
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
//  Bausteine für Mini-Aufgaben (vom Eignungs-Check weiter unten genutzt)
// =============================================================================

// Bit-Uhr / Binär (eure Aufgabe von Slide 30: 32 16 8 4 2 1)
export const BIT_WERTE = [32, 16, 8, 4, 2, 1];

// Echte IDS-Kundschaft (Slide 6) – für die Zuordnungs-Aufgaben
export const KUNDEN = [
  "Feuerwehr", "Schulen", "Stadtpolizei", "KJZK", "Stadtwerke", "Tiefbauamt",
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
      "Lade das Übungsdokument herunter und öffne es in Office 2016 (Word) auf dem PC.",
      "Setze Überschriften, Absätze und einheitliche Schrift.",
      "Speichere als «Vorname_Nachname».",
    ],
    hinweise: ["Word ist auf dem Gerät installiert (Office 2016).", "Sauberkeit zählt mehr als Tempo."],
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
    hinweise: ["Nutze digitec.ch, brack.ch, toppreise.ch.", "Erstelle die Tabelle in Excel (Office 2016 auf dem PC)."],
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

// =============================================================================
//  EIGNUNGS-CHECK — der „richtige" Teil: denken, einordnen, ausprobieren.
//
//  Ein flacher, durchgezählter Aufgaben-Stream in vier Teilen. Bewusst KEINE
//  reine Programmierung (Plattformentwicklung = Infrastruktur), aber eine
//  ehrliche Kostprobe vom „wie ein Computer denkt". Jede Aufgabe = ein Screen,
//  darum stimmt der Fortschritt (X von N) immer.
// =============================================================================

export type CheckTeil =
  | "Logik & Muster"
  | "Wie ein Computer denkt"
  | "Einordnen & Priorisieren"
  | "Praxis im ServiceDesk"
  | "Sicherheit im Blick"
  | "Vertiefung";

/** Professionelle Kurz-Erklärung pro Bereich: was wird hier erfasst, warum ist
 *  es berufsrelevant. Wird über jeder Aufgabe gezeigt – so ist die Aufgabe
 *  verständlich, auch wenn man sie (noch) nicht lösen kann. */
export const TEIL_INFO: Record<CheckTeil, string> = {
  "Logik & Muster":
    "Hier geht es um Mustererkennung und logisches Denken. In der IT erkennst du laufend wiederkehrende Abläufe und Fehlerbilder – wer Muster sieht, findet Ursachen schneller.",
  "Wie ein Computer denkt":
    "Hier zählt strukturiertes, schrittweises Denken. Systeme führen Anweisungen exakt der Reihe nach aus – diese Denkweise ist die Grundlage jeder IT-Tätigkeit.",
  "Einordnen & Priorisieren":
    "Hier geht es ums Priorisieren. Treffen mehrere Störungen gleichzeitig ein, entscheidet die richtige Reihenfolge über Wirkung und Zeit.",
  "Praxis im ServiceDesk":
    "Hier zählt dein Urteilsvermögen in echten Situationen: erst verstehen, dann handeln – die Grundhaltung im Anwendersupport.",
  "Sicherheit im Blick":
    "Hier geht es um IT-Sicherheit und Aufmerksamkeit. In der IT trägst du Verantwortung für fremde Daten – Betrugsversuche erkennen und sichere Passwörter wählen gehört zum Handwerk.",
  "Vertiefung":
    "Aufgaben für Fortgeschrittene. Sie gehen bewusst tiefer und sind freiwillig – verstehen reicht, lösen ist die Kür.",
};

interface CheckBasis {
  id: string;
  teil: CheckTeil;
  /** Kurzes Intro über der Aufgabe: worum geht es, was ist zu tun. */
  intro?: string;
  /** Optionaler Tipp – per „Hilfe"-Knopf abrufbar. Genutzte Hilfe fliesst ins Ergebnis ein. */
  tipp?: string;
}

/** Binär einstellen (32-16-8-4-2-1) — wie Computer Zahlen speichern. */
export interface CheckBituhr extends CheckBasis {
  typ: "bituhr"; ziel: number; hinweis: string;
}
/** Zahlenfolge fortsetzen — Muster erkennen. */
export interface CheckSequenz extends CheckBasis {
  typ: "sequenz"; frage: string; folge: number[]; loesung: number; hinweis: string;
}
/** Pseudocode lesen — was kommt raus? (Algorithmus-Denken, keine Syntax) */
export interface CheckPseudocode extends CheckBasis {
  typ: "pseudocode"; frage: string; zeilen: string[];
  optionen: { text: string; richtig: boolean }[]; aufloesung: string;
}
/** Fehler in einer Befehlsfolge finden — systematisch hinschauen. */
export interface CheckFehler extends CheckBasis {
  typ: "fehler"; intro: string; frage: string;
  zeilen: { text: string; defekt: boolean }[]; feedback: string;
}
/** Nach Wichtigkeit/Reihenfolge ordnen — Einordnen & Priorisieren. */
export interface CheckRanking extends CheckBasis {
  typ: "ranking"; intro: string; frage: string;
  /** Aussagen in der KORREKTEN Reihenfolge (Index 0 = zuoberst). */
  items: string[];
  /** Anfangs-Anzeige als Index-Reihenfolge (gemischt). */
  start: number[];
  hintOben: string; hintUnten: string; erklaerung: string;
}
/** ServiceDesk-Entscheidung. */
export interface CheckTriage extends CheckBasis {
  typ: "triage"; intro?: string; frage: string;
  optionen: { text: string; richtig: boolean; feedback: string }[];
}
/** Auftrag → richtige Kundin der Stadt. */
export interface CheckZuordnung extends CheckBasis {
  typ: "zuordnung"; auftrag: string; richtig: string; erklaerung: string;
}
/** Caesar-Geheimschrift entschlüsseln – Verschlüsselung/IT-Sicherheit als Kostprobe. */
export interface CheckCipher extends CheckBasis {
  typ: "cipher"; frage: string; chiffre: string; loesung: string[]; hinweis: string;
}
/** Roboter-Befehle aneinanderreihen – algorithmisches Denken („programmieren in klein").
 *  Gitter mit 0,0 = oben links; der Roboter folgt der Befehlsfolge Schritt für Schritt. */
export interface CheckBefehle extends CheckBasis {
  typ: "befehle"; intro: string; frage: string;
  breite: number; hoehe: number;
  start: { x: number; y: number };
  ziel: { x: number; y: number };
  /** Optionale Hindernisse, die der Roboter nicht betreten darf. */
  wand?: { x: number; y: number }[];
  /** Erfolgs-Text nach gelöstem Lauf. */
  erklaerung: string;
}
export type CheckItem =
  | CheckBituhr | CheckSequenz | CheckPseudocode | CheckFehler
  | CheckRanking | CheckTriage | CheckZuordnung | CheckCipher | CheckBefehle;

export const CHECK_ITEMS: CheckItem[] = [
  // ---------- Teil 1: Logik & Muster ----------
  {
    id: "seq1", teil: "Logik & Muster", typ: "sequenz",
    intro: "Erkenne das Muster: Welche Zahl setzt die Reihe logisch fort? Tipp die nächste Zahl ein.",
    frage: "Wie geht die Reihe weiter?",
    folge: [2, 4, 8, 16], loesung: 32,
    hinweis: "Jede Zahl ist das Doppelte der vorherigen.",
  },
  {
    id: "seq2", teil: "Logik & Muster", typ: "sequenz",
    frage: "Und diese Reihe?",
    folge: [1, 2, 4, 7, 11], loesung: 16,
    hinweis: "Schau die Abstände an: +1, +2, +3, +4 …",
  },
  {
    id: "bit1", teil: "Logik & Muster", typ: "bituhr",
    ziel: 27, hinweis: "Welche Lämpchen ergeben zusammen 27?",
  },
  {
    id: "bit2", teil: "Logik & Muster", typ: "bituhr",
    ziel: 41, hinweis: "Tüftle dich an die richtige Kombination heran.",
  },
  // ---------- Teil 2: Wie ein Computer denkt ----------
  {
    id: "pc2", teil: "Wie ein Computer denkt", typ: "pseudocode",
    intro: "«Pseudocode» ist ein Rezept in einfachen Schritten. Eine «Schleife» wiederholt einen Schritt mehrmals. Beispiel: Du installierst 4 PCs und rechnest die Gesamtzeit zusammen – sie dauern 1, 2, 3 und 4 Minuten.",
    frage: "Wie viele Minuten dauern alle 4 zusammen?",
    zeilen: ["Gesamtzeit = 0 Minuten", "Für jeden der 4 PCs (1, 2, 3, 4 Min):", "    zähle seine Minuten zur Gesamtzeit dazu", "Zeige die Gesamtzeit"],
    optionen: [
      { text: "10", richtig: true },
      { text: "4", richtig: false },
      { text: "7", richtig: false },
    ],
    aufloesung: "1 + 2 + 3 + 4 = 10 Minuten. Eine Schleife wiederholt denselben Schritt für jeden PC.",
  },
  {
    id: "pc3", teil: "Wie ein Computer denkt", typ: "pseudocode",
    intro: "Eine «Bedingung» (wenn … sonst …) lässt das Programm abzweigen – nur EIN Weg wird genommen. Beispiel: ein Quiz vergibt Punkte, je nachdem ob die Antwort richtig war.",
    frage: "Wie viele Punkte gibt es hier?",
    zeilen: ["Du startest mit 0 Punkten", "Wenn die Antwort richtig ist:", "    gib 10 Punkte dazu", "Sonst:", "    gib 1 Punkt dazu", "Die Antwort war richtig."],
    optionen: [
      { text: "10", richtig: true },
      { text: "1", richtig: false },
      { text: "11", richtig: false },
    ],
    aufloesung: "Die Antwort war richtig → nur der erste Weg greift → 10 Punkte. Der «Sonst»-Weg wird nicht betreten.",
  },
  {
    id: "err1", teil: "Wie ein Computer denkt", typ: "fehler",
    intro: "Mit dem Befehl «ping» prüft man, ob ein Gerät im Netzwerk erreichbar ist – jedes Gerät hat dafür eine Adresse (IP) aus vier Zahlen. Dieses Skript pingt drei Geräte der Reihe nach an.",
    frage: "Welche Zeile kann unmöglich funktionieren?",
    zeilen: [
      { text: "ping 192.168.0.1", defekt: false },
      { text: "ping 192.168.0.256", defekt: true },
      { text: "ping 192.168.0.10", defekt: false },
    ],
    feedback: "Genau. In einer IP-Adresse geht jede Zahl nur von 0 bis 255 – eine 256 gibt es nicht.",
  },
  {
    id: "cipher", teil: "Wie ein Computer denkt", typ: "cipher",
    intro: "In der IT werden Daten verschlüsselt, damit sie niemand mitlesen kann. Eine ganz alte Methode: jeder Buchstabe wird um 3 Stellen verschoben (A→D, B→E …).",
    frage: "Entschlüssle das Wort – schieb jeden Buchstaben 3 Stellen ZURÜCK:",
    chiffre: "VWDGW",
    loesung: ["stadt"],
    hinweis: "V → U → T → S. Mach das mit jedem Buchstaben. Nutz die Alphabet-Leiste unten.",
    tipp: "Geh pro Buchstabe 3 Schritte im Alphabet zurück. V wird zu S, W wird zu T …",
  },
  {
    id: "robo1", teil: "Wie ein Computer denkt", typ: "befehle",
    intro: "Ein Roboter folgt Befehlen – einen nach dem anderen, genau in der Reihenfolge, die du vorgibst. Das ist Programmieren in klein.",
    frage: "Stell die Befehle so zusammen, dass der Roboter zur Kiste läuft – dann starte ihn.",
    breite: 4, hoehe: 3, start: { x: 0, y: 2 }, ziel: { x: 3, y: 0 },
    erklaerung: "Genau. Der Roboter macht exakt das, was du ihm der Reihe nach sagst – die Reihenfolge entscheidet.",
    tipp: "Zähl die Schritte: 3-mal nach rechts und 2-mal nach oben bringen ihn zur Kiste. Reihenfolge egal, solange er ankommt.",
  },
  // ---------- Teil 3: Einordnen & Priorisieren ----------
  {
    id: "rank1", teil: "Einordnen & Priorisieren", typ: "ranking",
    intro: "Vier Meldungen treffen fast gleichzeitig im ServiceDesk ein.",
    frage: "Ordne sie nach Dringlichkeit – das Wichtigste zuoberst.",
    items: [
      "Die Feuerwehr-Leitstelle ist komplett offline",
      "Ein ganzes Schulzimmer hat kein Internet",
      "Bei einer Mitarbeiterin druckt der Drucker nicht",
      "Jemand wünscht sich ein neues Mauspad",
    ],
    start: [2, 0, 3, 1],
    hintOben: "dringend", hintUnten: "kann warten",
    erklaerung: "Je grösser der Schaden und je mehr Menschen betroffen, desto höher die Priorität: Notdienste zuerst, Komfort zuletzt.",
  },
  {
    id: "rank2", teil: "Einordnen & Priorisieren", typ: "ranking",
    intro: "Ein PC zeigt kein Bild.",
    frage: "In welcher Reihenfolge prüfst du? Vom Einfachsten zum Aufwändigsten.",
    items: [
      "Ist der Bildschirm ein und das Kabel eingesteckt?",
      "Läuft der Computer überhaupt (Lüfter, Lämpchen)?",
      "Den Bildschirm an einem anderen PC testen",
      "Die Grafikkarte ausbauen und prüfen",
    ],
    start: [1, 3, 0, 2],
    hintOben: "zuerst", hintUnten: "zuletzt",
    erklaerung: "Immer vom Einfachen zum Komplizierten – das spart Zeit und vermeidet unnötiges Schrauben.",
  },
  // ---------- Teil 4: Praxis im ServiceDesk ----------
  {
    id: "tri1", teil: "Praxis im ServiceDesk", typ: "triage",
    intro: "Eine Kundin ruft an: «Mein Computer startet nicht mehr!»",
    frage: "Was machst du als Erstes?",
    optionen: [
      { text: "Sofort die Festplatte austauschen.", richtig: false, feedback: "Zu schnell! Du weisst ja noch gar nicht, woran es liegt. Erst eingrenzen, dann handeln." },
      { text: "Nachfragen: Leuchtet etwas? Kommt ein Bild oder ein Ton? Was passiert genau?", richtig: true, feedback: "Genau so. Im ServiceDesk grenzt du das Problem mit gezielten Fragen ein, bevor du etwas anpackst." },
      { text: "Den Computer komplett neu installieren.", richtig: false, feedback: "Mit Kanonen auf Spatzen – und alle Daten wären weg. Erst die Ursache suchen." },
    ],
  },
  {
    id: "tri2", teil: "Praxis im ServiceDesk", typ: "triage",
    intro: "Die Kundin sagt: «Es leuchtet kein einziges Lämpchen, gar nichts tut sich.»",
    frage: "Worauf tippst du zuerst?",
    optionen: [
      { text: "Auf die Stromversorgung – Kabel, Steckdose, Netzteil prüfen.", richtig: true, feedback: "Stark. Kein Lämpchen = oft schlicht kein Strom. Das prüft man zuerst." },
      { text: "Auf einen Virus.", richtig: false, feedback: "Ein Virus würde den PC nicht komplett tot machen." },
      { text: "Auf ein kaputtes Betriebssystem.", richtig: false, feedback: "Dann würde der PC zumindest kurz anlaufen. Tot = zuerst an den Strom denken." },
    ],
  },
  {
    id: "zu1", teil: "Praxis im ServiceDesk", typ: "zuordnung",
    intro: "Die IDS betreut die ganze Stadt – von der Feuerwehr bis zu den Schulen. Ordne den Auftrag der richtigen Stelle zu.",
    auftrag: "Hunderte Computer in Klassenzimmern und Computerräumen einrichten.",
    richtig: "Schulen",
    erklaerung: "Schulen brauchen viele, einheitlich aufgesetzte Geräte – ideal fürs Aufsetzen über Netzwerk (SCCM).",
  },
  {
    id: "zu2", teil: "Praxis im ServiceDesk", typ: "zuordnung",
    auftrag: "Robuste, einsatztaugliche Tablets für Fahrzeuge im Ernstfall.",
    richtig: "Feuerwehr",
    erklaerung: "Die Feuerwehr braucht zuverlässige Technik, die auch im Einsatz funktioniert.",
  },
  // ---------- Teil 5: Sicherheit im Blick ----------
  {
    id: "sec-phish", teil: "Sicherheit im Blick", typ: "triage",
    intro: "Drei E-Mails landen im Postfach der Stadtverwaltung. Eine ist eine Fälschung («Phishing») und will an ein Passwort.",
    frage: "Welche Mail ist die gefährliche Fälschung?",
    optionen: [
      { text: "it-support@stadt.sg.ch – «Wartung heute Abend, du musst nichts tun.»", richtig: false, feedback: "Die ist echt: bekannte Stadt-Adresse und sie will nichts von dir." },
      { text: "sicherheit@stadt-sg-login.com – «Ihr Konto wird gesperrt! Sofort hier klicken und Passwort eingeben.»", richtig: true, feedback: "Richtig erkannt. Fremde Adresse (stadt-sg-login.com statt stadt.sg.ch), Drohung, Zeitdruck und Passwort-Abfrage – die typischen Phishing-Zeichen." },
      { text: "kollegin@stadt.sg.ch – «Hast du das Protokoll von gestern?»", richtig: false, feedback: "Harmlose interne Mail von einer bekannten Adresse." },
    ],
    tipp: "Schau auf die Absender-Adresse und ob die Mail dich unter Druck setzt, schnell ein Passwort einzugeben.",
  },
  {
    id: "sec-pw", teil: "Sicherheit im Blick", typ: "triage",
    intro: "Du richtest ein neues Konto ein und musst ein Passwort vergeben.",
    frage: "Welches Passwort ist am sichersten?",
    optionen: [
      { text: "passwort123", richtig: false, feedback: "Steht auf jeder Liste der schlechtesten Passwörter – in Sekunden geknackt." },
      { text: "Sommer2026", richtig: false, feedback: "Zu kurz und zu erratbar: ein Wort plus Jahreszahl knacken Programme schnell." },
      { text: "7Koffer!blau-Velo", richtig: true, feedback: "Stark: lang, mischt Wörter, Zahlen und Zeichen und ergibt für Fremde keinen Sinn – du selbst kannst es dir aber als Bild merken." },
    ],
    tipp: "Je länger und je weniger erratbar (kein echtes Wort, kein Geburtsjahr), desto besser.",
  },
];

// Freiwillige, schwerere Bonus-Runde – fordert die schon Erfahrenen.
export const BONUS_ITEMS: CheckItem[] = [
  {
    id: "b-pc", teil: "Vertiefung", typ: "pseudocode",
    frage: "Eine Schleife mit Bedingung. Welche Zahl steht am Ende in der Summe?",
    zeilen: ["Setze Summe auf 0", "Für jede Zahl von 1 bis 3:", "    wenn die Zahl gerade ist: Summe = Summe + 10", "    sonst: Summe = Summe + 1", "Gib Summe aus"],
    optionen: [
      { text: "12", richtig: true },
      { text: "30", richtig: false },
      { text: "33", richtig: false },
    ],
    aufloesung: "1 ist ungerade (+1 → 1), 2 ist gerade (+10 → 11), 3 ist ungerade (+1 → 12). Bedingung pro Durchgang neu prüfen!",
    tipp: "Geh die Zahlen 1, 2, 3 einzeln durch und entscheide jedes Mal: gerade (+10) oder ungerade (+1)?",
  },
  {
    id: "b-net", teil: "Vertiefung", typ: "triage",
    intro: "Dein PC hat die Adresse 192.168.1.50. Drei andere Geräte hängen am Netz.",
    frage: "Welches Gerät ist NICHT im selben Netzwerk wie dein PC?",
    optionen: [
      { text: "Drucker: 192.168.1.20", richtig: false, feedback: "Der ist im selben Netz (192.168.1.x) – gleiche ersten drei Blöcke wie dein PC." },
      { text: "Server: 192.168.2.10", richtig: true, feedback: "Richtig. Bei 192.168.2.x ist der dritte Block anders (2 statt 1) – ein anderes Netz. Dorthin kommst du nicht direkt." },
      { text: "Kollege: 192.168.1.99", richtig: false, feedback: "Der ist im selben Netz (192.168.1.x)." },
    ],
    tipp: "Vergleiche die ersten drei Zahlen-Blöcke (192.168.1). Wo weicht einer ab?",
  },
  {
    id: "b-seq", teil: "Vertiefung", typ: "sequenz",
    frage: "Wie geht diese Reihe weiter?",
    folge: [1, 1, 2, 3, 5, 8],
    loesung: 13,
    hinweis: "Zähl die letzten zwei Zahlen zusammen: 5 + 8 = ?",
    tipp: "Jede Zahl ist die Summe der beiden vorherigen (das ist die berühmte Fibonacci-Reihe).",
  },
  {
    id: "robo2", teil: "Vertiefung", typ: "befehle",
    intro: "Diesmal steht eine Wand im Weg. Der direkte Weg ist versperrt – der Roboter muss aussen herum.",
    frage: "Führ den Roboter um die Wand herum zur Kiste.",
    breite: 4, hoehe: 3, start: { x: 0, y: 0 }, ziel: { x: 3, y: 0 },
    wand: [{ x: 1, y: 0 }, { x: 2, y: 0 }],
    erklaerung: "Sauber umschifft. Manchmal ist der direkte Weg blockiert und du musst einen Umweg planen – genau so denkt man in der IT.",
    tipp: "Nach rechts geht nicht (Wand). Geh erst runter, dann nach rechts, dann wieder hoch.",
  },
];

export interface CheckErgebnis {
  total: number;            // Pflicht-Aufgaben gesamt
  selbststaendig: number;   // davon ohne Fehlversuch UND ohne Tipp gelöst
  tipps: number;            // wie oft die Hilfe genutzt wurde
  /** Teile, in denen alles selbstständig sass */
  starkeTeile: string[];
  bonusGemacht: boolean;
  bonusTotal: number;
  bonusSelbststaendig: number;
}
