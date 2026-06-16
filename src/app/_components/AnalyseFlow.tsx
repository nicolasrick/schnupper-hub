"use client";

import { useState } from "react";
import { auswerten, Auswertung } from "@/lib/content";
import { api } from "@/lib/api";
import { Start } from "./Start";
import { Selbsttest } from "./Selbsttest";
import { FitProfil } from "./FitProfil";
import { EignungsCheck, AufgabenErgebnis } from "./EignungsCheck";
import { Abschluss } from "./Abschluss";

type Schritt = "start" | "test" | "profil" | "aufgaben" | "abschluss";

/** Die geführte Berufswahl-Analyse. DATENARM: alles bleibt lokal in der
 *  Browser-Session – es wird nichts zum Server geschickt. */
export function AnalyseFlow({ onExit }: { onExit: () => void }) {
  const [schritt, setSchritt] = useState<Schritt>("start");
  const [name, setName] = useState("");
  const [auswertung, setAuswertung] = useState<Auswertung | null>(null);
  const [aufgaben, setAufgaben] = useState<AufgabenErgebnis | null>(null);

  return (
    <>
      {schritt === "start" && (
        <Start onStart={(n) => { setName(n); setSchritt("test"); }} onBack={onExit} />
      )}

      {schritt === "test" && (
        <Selbsttest
          name={name}
          onDone={(antworten) => { setAuswertung(auswerten(antworten)); setSchritt("profil"); }}
        />
      )}

      {schritt === "profil" && auswertung && (
        <FitProfil name={name} auswertung={auswertung} onNext={() => setSchritt("aufgaben")} />
      )}

      {schritt === "aufgaben" && (
        <EignungsCheck
          onDone={(e) => {
            setAufgaben(e);
            setSchritt("abschluss");
            // Minimiertes Ergebnis an den Server (Vorname + Kennzahlen) – fürs Dashboard.
            if (auswertung) {
              api.saveErgebnis({
                vorname: name,
                passung: auswertung.passung,
                topFeld: auswertung.staerken[0]?.dim.label ?? "",
                selbststaendig: e.selbststaendig,
                total: e.total,
                tipps: e.tipps,
                starkeTeile: e.starkeTeile,
                bonusGemacht: e.bonusGemacht,
                bonusSelbststaendig: e.bonusSelbststaendig,
                bonusTotal: e.bonusTotal,
              });
            }
          }}
        />
      )}

      {schritt === "abschluss" && auswertung && aufgaben && (
        <Abschluss name={name} auswertung={auswertung} aufgaben={aufgaben} onRestart={onExit} />
      )}
    </>
  );
}
