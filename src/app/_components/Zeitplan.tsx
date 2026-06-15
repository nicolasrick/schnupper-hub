"use client";

import { TAGE } from "@/lib/content";
import { Card, BackBar } from "./ui";

export function Zeitplan({ onBack }: { onBack: () => void }) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <BackBar title="Zeitplan" onBack={onBack} />

      <div className="grid gap-6 sm:grid-cols-2">
        {TAGE.map((t) => (
          <Card key={t.tag} className="p-6 sm:p-7">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-bold">{t.titel}</h2>
              <span className="text-xs font-semibold text-green">Tag {t.tag}</span>
            </div>
            <p className="mt-0.5 text-sm text-ink-soft">Leitung: {t.leitung}</p>

            <ol className="mt-5 space-y-2.5">
              {t.ablauf.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-12 shrink-0 text-sm font-bold tabular-nums text-green">
                    {s.zeit}
                  </span>
                  <span className="text-sm leading-snug text-ink">{s.text}</span>
                </li>
              ))}
            </ol>
          </Card>
        ))}
      </div>
    </div>
  );
}
