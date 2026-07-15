import { NextResponse } from "next/server";
import { db, parseBranch } from "@/lib/db";
import type { SalesRow } from "@/lib/types";

export const dynamic = "force-dynamic";

const isDate = (v: string | null): v is string => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);

// รวมยอด: In-store = cash+qr+edc · Delivery = grab+lineman · Total = In-store+Delivery
function shape(row: SalesRow) {
  const inStore = row.cash + row.qr + row.edc;
  const delivery = row.grab + row.lineman;
  return { row, inStore, delivery, total: inStore + delivery };
}

// GET /api/sales?branch=NVP&date=YYYY-MM-DD → { row, inStore, delivery, total }
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const branch = parseBranch(searchParams.get("branch"));
    const date = searchParams.get("date");
    if (!branch) return NextResponse.json({ error: "branch ไม่ถูกต้อง (SND|NVP)" }, { status: 400 });
    if (!isDate(date)) return NextResponse.json({ error: "date ไม่ถูกต้อง (YYYY-MM-DD)" }, { status: 400 });

    const row = await db.getSales(branch, date);
    return NextResponse.json(shape(row));
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "sales failed" }, { status: 500 });
  }
}

// POST /api/sales { branch, date, row: SalesRow } → { ok }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const branch = parseBranch(body?.branch ?? null);
    const date = body?.date ?? null;
    if (!branch) return NextResponse.json({ error: "branch ไม่ถูกต้อง (SND|NVP)" }, { status: 400 });
    if (!isDate(date)) return NextResponse.json({ error: "date ไม่ถูกต้อง (YYYY-MM-DD)" }, { status: 400 });
    if (!body?.row || typeof body.row !== "object")
      return NextResponse.json({ error: "row ไม่ถูกต้อง" }, { status: 400 });

    const r = body.row;
    const num = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0);
    const row: SalesRow = {
      cash: num(r.cash),
      qr: num(r.qr),
      edc: num(r.edc),
      grab: num(r.grab),
      lineman: num(r.lineman),
    };

    const res = await db.saveSales(branch, date, row);
    return NextResponse.json(res);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "sales save failed" }, { status: 500 });
  }
}
