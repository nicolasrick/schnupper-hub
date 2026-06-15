"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [passwort, setPasswort] = useState("");
  const [fehler, setFehler] = useState(false);
  const [laden, setLaden] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLaden(true);
    setFehler(false);
    try {
      const r = await fetch("/api/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ passwort }),
      });
      if (r.ok) router.push("/admin");
      else setFehler(true);
    } catch {
      setFehler(true);
    } finally {
      setLaden(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <form
        onSubmit={submit}
        className="anim-in w-full max-w-sm rounded-3xl bg-surface p-8 text-ink shadow-2xl ring-1 ring-black/5"
      >
        <h1 className="text-2xl font-bold">Dashboard-Login</h1>
        <p className="mt-1 text-sm text-ink-soft">Nur für Berufsbildner:innen.</p>

        <label htmlFor="pw" className="mt-6 block text-sm font-medium">Passwort</label>
        <input
          id="pw"
          type="password"
          autoFocus
          value={passwort}
          onChange={(e) => setPasswort(e.target.value)}
          className="mt-1 w-full rounded-2xl border border-line px-4 py-3 text-base outline-none focus:border-green focus:ring-4 focus:ring-green/20"
        />
        {fehler && <p className="mt-2 text-sm text-red-500">Falsches Passwort.</p>}

        <button
          type="submit"
          disabled={laden || !passwort}
          className="mt-5 w-full rounded-full bg-green px-6 py-3 font-semibold text-white hover:bg-green-dark disabled:opacity-40"
        >
          {laden ? "…" : "Anmelden"}
        </button>
      </form>
    </main>
  );
}
