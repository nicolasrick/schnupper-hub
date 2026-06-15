"use client";

import { useState } from "react";
import { Hub, HubZiel } from "./_components/Hub";
import { AnalyseFlow } from "./_components/AnalyseFlow";
import { Zeitplan } from "./_components/Zeitplan";
import { AufgabenDownloads } from "./_components/AufgabenDownloads";
import { Abgabe } from "./_components/Abgabe";
import { Mission } from "./_components/Mission";

type View = "hub" | HubZiel;

export default function Home() {
  const [view, setView] = useState<View>("hub");
  const zumHub = () => setView("hub");

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-16">
      {view === "hub" && <Hub onNavigate={(z) => setView(z)} />}
      {view === "analyse" && <AnalyseFlow onExit={zumHub} />}
      {view === "zeitplan" && <Zeitplan onBack={zumHub} />}
      {view === "aufgaben" && <AufgabenDownloads onBack={zumHub} />}
      {view === "abgabe" && <Abgabe onBack={zumHub} />}
      {view === "mission" && <Mission onBack={zumHub} />}
    </main>
  );
}
