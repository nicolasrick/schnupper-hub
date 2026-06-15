"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ZugangPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [fehler, setFehler] = useState(false);
  const [laden, setLaden] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLaden(true);
    setFehler(false);
    try {
      const r = await fetch("/api/zugang", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (r.ok) router.push("/");
      else setFehler(true);
    } catch {
      setFehler(true);
    } finally {
      setLaden(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <form onSubmit={submit} className="anim-in w-full max-w-sm rounded-3xl bg-surface p-8 text-ink shadow-2xl ring-1 ring-black/5">
        <div className="text-4xl">🔑</div>
        <h1 className="mt-3 text-2xl font-bold">Zugangscode</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Gib den Code ein, den du von deiner Berufsbildnerin / deinem
          Berufsbildner bekommen hast.
        </p>

        <input
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Code"
          className="mt-5 w-full rounded-2xl border border-line px-4 py-3 text-center text-lg tracking-widest outline-none focus:border-green focus:ring-4 focus:ring-green/20"
        />
        {fehler && <p className="mt-2 text-sm text-red-500">Code stimmt nicht.</p>}

        <button
          type="submit"
          disabled={laden || code.trim().length < 1}
          className="mt-5 w-full rounded-full bg-green px-6 py-3 font-semibold text-white hover:bg-green-dark disabled:opacity-40"
        >
          {laden ? "…" : "Los geht's →"}
        </button>
      </form>
    </main>
  );
}
