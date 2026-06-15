"use client";

import { useState } from "react";
import { auswerten, Auswertung } from "@/lib/content";
import { Start } from "./Start";
import { Selbsttest } from "./Selbsttest";
import { FitProfil } from "./FitProfil";
import { MiniAufgaben, AufgabenErgebnis } from "./MiniAufgaben";
import { DasErwartetDich } from "./DasErwartetDich";
import { Abschluss } from "./Abschluss";

type Schritt = "start" | "test" | "profil" | "aufgaben" | "erwartet" | "abschluss";

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
        <MiniAufgaben onDone={(e) => { setAufgaben(e); setSchritt("erwartet"); }} />
      )}

      {schritt === "erwartet" && <DasErwartetDich onNext={() => setSchritt("abschluss")} />}

      {schritt === "abschluss" && auswertung && aufgaben && (
        <Abschluss name={name} auswertung={auswertung} aufgaben={aufgaben} onRestart={onExit} />
      )}
    </>
  );
}
