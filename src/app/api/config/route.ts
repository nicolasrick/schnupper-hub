import { NextResponse } from "next/server";
import { getConfig, setModus } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getConfig());
}

export async function POST(req: Request) {
  const body = await req.json();
  const config = await setModus(String(body?.modus || "schnuppertag"));
  return NextResponse.json(config);
}
