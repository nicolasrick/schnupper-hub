// =============================================================================
//  Einstellungen — self-service Konfiguration (white-label / verkaufbar).
//
//  Was hier konfigurierbar ist, war früher im Code fest verdrahtet. Ein Kunde
//  trägt seine eigenen Daten ein (Betrieb, Verantwortliche, Stationen, Titel),
//  ohne dass jemand Code anfasst. Liegt serverseitig (DATA_DIR/einstellungen.json).
//  Phase 2: Integrationen (Azure-Key/Endpoint, SharePoint-URL) – als SECRETS
//  separat, nie über den öffentlichen GET ausliefern.
// =============================================================================

export interface Betrieb {
  name: string;
  adresse: string;
  beruf: string;
  ort: string;
  kontaktMail: string;
}

export interface EinStation {
  id: string;
  label: string;
}

export interface Einstellungen {
  betrieb: Betrieb;
  verantwortliche: string[];
  stationen: EinStation[];
  titel: string;
}

export const DEFAULT_EINSTELLUNGEN: Einstellungen = {
  betrieb: {
    name: "Informatikdienste der Stadt St. Gallen (IDS)",
    adresse: "Poststrasse 28 · 9000 St. Gallen",
    beruf: "Informatiker/in Plattformentwicklung EFZ",
    ort: "St. Gallen",
    kontaktMail: "nicolas.rick@stadt.sg.ch",
  },
  verantwortliche: ["Nicolas Rick", "Gioele Parenti"],
  stationen: [
    { id: "s-setup", label: "Notebook mit Windows 11 aufgesetzt" },
    { id: "s-analyse", label: "Berufswahl-Analyse durchgeführt" },
    { id: "s-servicedesk", label: "ServiceDesk-Fall bearbeitet" },
    { id: "s-doku", label: "Dokument formatiert" },
    { id: "s-festplatte", label: "Festplatte gewechselt" },
    { id: "s-fehler", label: "Fehler am Notebook gelöst" },
    { id: "s-netzwerk", label: "Computer über Netzwerk aufgesetzt" },
    { id: "s-webserver", label: "Webserver (IIS) aufgesetzt" },
    { id: "s-gamingpc", label: "Gaming-PC zusammengestellt" },
    { id: "s-powershell", label: "PowerShell-Skript erstellt" },
    { id: "s-scratch", label: "Scratch-Spiel programmiert" },
    { id: "s-serverraum", label: "Serverraum besichtigt" },
  ],
  titel: "Schnuppertage",
};

function str(v: unknown, fallback: string, max = 200): string {
  return typeof v === "string" && v.trim() ? v.slice(0, max) : fallback;
}

function slug(s: string): string {
  return (s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "station").slice(0, 40);
}

/** Teil-/Fremddaten robust mit Defaults mischen + säubern. */
export function mitDefaults(roh: unknown): Einstellungen {
  const r = (roh ?? {}) as Partial<Einstellungen>;
  const b = (r.betrieb ?? {}) as Partial<Betrieb>;
  const d = DEFAULT_EINSTELLUNGEN;

  const verantwortliche = Array.isArray(r.verantwortliche)
    ? r.verantwortliche.map((v) => String(v).slice(0, 80)).filter((v) => v.trim()).slice(0, 30)
    : d.verantwortliche;

  const stationen = Array.isArray(r.stationen)
    ? r.stationen
        .map((s) => {
          const o = (s ?? {}) as Partial<EinStation>;
          const label = String(o.label ?? "").slice(0, 120);
          if (!label.trim()) return null;
          return { id: String(o.id ?? "").slice(0, 40) || slug(label), label };
        })
        .filter((s): s is EinStation => !!s)
        .slice(0, 60)
    : d.stationen;

  return {
    betrieb: {
      name: str(b.name, d.betrieb.name),
      adresse: str(b.adresse, d.betrieb.adresse),
      beruf: str(b.beruf, d.betrieb.beruf),
      ort: str(b.ort, d.betrieb.ort),
      kontaktMail: str(b.kontaktMail, d.betrieb.kontaktMail),
    },
    verantwortliche: verantwortliche.length ? verantwortliche : d.verantwortliche,
    stationen: stationen.length ? stationen : d.stationen,
    titel: str(r.titel, d.titel, 80),
  };
}
