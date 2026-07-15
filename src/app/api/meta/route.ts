import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const meta = await db.getMeta();
    return NextResponse.json(meta);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "meta failed" }, { status: 500 });
  }
}
