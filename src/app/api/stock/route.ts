import { NextResponse } from "next/server";
import { db, parseBranch } from "@/lib/db";
import type { StockRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const branch = parseBranch(searchParams.get("branch"));
    const date = searchParams.get("date");
    if (!branch) return NextResponse.json({ error: "branch ต้องเป็น SND หรือ NVP" }, { status: 400 });
    if (!date) return NextResponse.json({ error: "date จำเป็น" }, { status: 400 });

    const rows = await db.getStock(branch, date);
    return NextResponse.json({ rows });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "getStock failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { branch?: string; date?: string; rows?: StockRow[] };
    const branch = parseBranch(body.branch ?? null);
    const date = body.date;
    if (!branch) return NextResponse.json({ error: "branch ต้องเป็น SND หรือ NVP" }, { status: 400 });
    if (!date) return NextResponse.json({ error: "date จำเป็น" }, { status: 400 });
    if (!Array.isArray(body.rows)) return NextResponse.json({ error: "rows จำเป็น" }, { status: 400 });

    const result = await db.saveStock(branch, date, body.rows);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "saveStock failed" }, { status: 500 });
  }
}
