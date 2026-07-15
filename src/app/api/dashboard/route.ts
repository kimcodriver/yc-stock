import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { todayISO } from "@/lib/fmt";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || todayISO();
    const data = await db.getDashboard(date);
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "dashboard failed" }, { status: 500 });
  }
}
