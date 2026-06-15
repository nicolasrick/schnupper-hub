import { NextResponse } from "next/server";
import { zipForKey } from "@/lib/abgaben";

export const dynamic = "force-dynamic";

// ZIP einer Person (geschützt via middleware – Berufsbildner:in gibt sie mit)
export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("key") || "";
  const zip = await zipForKey(key);
  if (!zip) return NextResponse.json({ error: "leer" }, { status: 404 });
  return new NextResponse(new Uint8Array(zip), {
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="schnupper-mappe-${key}.zip"`,
    },
  });
}
