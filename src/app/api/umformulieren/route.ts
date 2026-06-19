import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";

// Geschützt (Middleware): formuliert die Begründung flüssiger und variiert sie.
// Braucht ANTHROPIC_API_KEY in der Umgebung (Coolify-Env). Ohne Key → 503.
export async function POST(req: Request) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "kein_key", message: "Kein ANTHROPIC_API_KEY gesetzt – KI-Umformulieren ist deaktiviert." },
      { status: 503 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "leer", message: "Kein Text zum Umformulieren." }, { status: 400 });
  }
  if (text.length > 4000) {
    return NextResponse.json({ error: "zu_lang", message: "Text ist zu lang." }, { status: 400 });
  }

  const client = new Anthropic({ apiKey: key });

  const system =
    "Du formulierst die kurze Begründung in einer Schnupperlehre-Auswertung (Schweizer Berufsbildung, Beruf «Informatiker/in Plattformentwicklung EFZ») flüssiger und natürlicher. " +
    "Regeln: Behalte alle inhaltlichen Aussagen und die Wertung exakt bei – nichts dazuerfinden, nichts weglassen, nichts beschönigen. " +
    "Schweizer Hochdeutsch (kein ß, sondern ss). Sachlich-wohlwollender Ton wie auf einem kantonalen Beurteilungsbogen. " +
    "2–4 zusammenhängende Sätze, kein Listenformat, keine Anrede, keine Einleitung wie «Hier ist». " +
    "Variiere die Formulierung bei jedem Aufruf etwas, damit nicht bei allen Jugendlichen derselbe Text steht. " +
    "Gib NUR den umformulierten Text zurück, ohne Anführungszeichen.";

  const user =
    (name ? `Name der jugendlichen Person: ${name}\n\n` : "") +
    `Begründung (umformulieren):\n${text}`;

  try {
    const res = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1000,
      system,
      messages: [{ role: "user", content: user }],
    });
    if (res.stop_reason === "refusal") {
      return NextResponse.json(
        { error: "abgelehnt", message: "Die KI hat die Anfrage abgelehnt." },
        { status: 422 },
      );
    }
    const out = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    if (!out) {
      return NextResponse.json({ error: "leer_antwort", message: "Keine Antwort erhalten." }, { status: 502 });
    }
    return NextResponse.json({ text: out });
  } catch (e) {
    const message = e instanceof Anthropic.APIError ? e.message : "Unbekannter Fehler.";
    const status = e instanceof Anthropic.APIError && typeof e.status === "number" ? e.status : 502;
    return NextResponse.json({ error: "api_fehler", message }, { status });
  }
}
