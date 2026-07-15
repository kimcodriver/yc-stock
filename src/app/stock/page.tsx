"use client";
// M1: Stock Entry — กรอกสต็อกรายวัน/สาขา (glass, mobile-first)
import React from "react";
import type { Branch, Item, Meta, StockRow } from "@/lib/types";
import { remainPieces, remainGrams, variance } from "@/lib/calc";
import { todayISO, thaiDate } from "@/lib/fmt";
import {
  GlassCard, Badge, Button, Segmented, Accordion, NumberField, Stat, SaveBar, PageTitle,
} from "@/components/ui";

const BRANCH_OPTS: { value: Branch; label: string }[] = [
  { value: "SND", label: "สาขา SND" },
  { value: "NVP", label: "สาขา NVP" },
];

const toNum = (raw: string): number => {
  const x = parseFloat(raw);
  return Number.isFinite(x) ? x : 0;
};
// ช่องกรอกล้วน: 0 → ว่าง (พิมพ์ง่าย) · ช่อง auto/ยกมา: โชว์ตัวเลขจริง
const blankZero = (v: number): number | string => (v === 0 ? "" : v);

const varianceOf = (r: StockRow): number =>
  variance(r.carryPack, r.inPack, r.used, r.returned, r.remainPack);

const isFilled = (r: StockRow): boolean =>
  r.inPack > 0 || r.used > 0 || r.inG > 0;

export default function StockPage() {
  const [branch, setBranch] = React.useState<Branch>("NVP");
  const [date, setDate] = React.useState<string>(todayISO());
  const [meta, setMeta] = React.useState<Meta | null>(null);
  const [rows, setRows] = React.useState<Record<string, StockRow>>({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  // meta โหลดครั้งเดียว
  React.useEffect(() => {
    let alive = true;
    fetch("/api/meta")
      .then((r) => r.json())
      .then((m: Meta) => { if (alive) setMeta(m); })
      .catch((e) => { if (alive) setErr(String(e?.message ?? e)); });
    return () => { alive = false; };
  }, []);

  // stock โหลดใหม่เมื่อเปลี่ยนสาขา/วันที่
  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);
    fetch(`/api/stock?branch=${branch}&date=${date}`)
      .then((r) => r.json())
      .then((data: { rows?: StockRow[]; error?: string }) => {
        if (!alive) return;
        if (data.error) { setErr(data.error); return; }
        const map: Record<string, StockRow> = {};
        for (const row of data.rows ?? []) map[row.itemId] = row;
        setRows(map);
      })
      .catch((e) => { if (alive) setErr(String(e?.message ?? e)); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [branch, date]);

  // รายการที่ stock ในสาขานี้ (par != null) จัดกลุ่มตาม category
  const groups = React.useMemo(() => {
    if (!meta) return [] as { category: string; items: Item[] }[];
    const shown = meta.items
      .filter((it) => meta.par[it.id]?.[branch] != null)
      .sort((a, b) => a.sort - b.sort);
    const out: { category: string; items: Item[] }[] = [];
    for (const it of shown) {
      let g = out.find((x) => x.category === it.category);
      if (!g) { g = { category: it.category, items: [] }; out.push(g); }
      g.items.push(it);
    }
    return out;
  }, [meta, branch]);

  const shownRows = React.useMemo(
    () => groups.flatMap((g) => g.items.map((it) => rows[it.id]).filter(Boolean)),
    [groups, rows],
  );
  const total = shownRows.length;
  const filledCount = shownRows.filter(isFilled).length;
  const varianceCount = shownRows.filter((r) => varianceOf(r) !== 0).length;

  type NumField = "inPack" | "used" | "remainPack" | "inG" | "remainG";
  function setField(itemId: string, field: NumField, raw: string) {
    setRows((prev) => {
      const cur = prev[itemId];
      if (!cur) return prev;
      const val = toNum(raw);
      const next: StockRow = { ...cur, [field]: val };
      if (field === "inPack" || field === "used") {
        next.remainPack = remainPieces(next.carryPack, next.inPack, next.used);
      }
      if (field === "inG" || field === "used") {
        next.remainG = remainGrams(next.carryG, next.inG, next.used);
      }
      next.variance = varianceOf(next);
      return { ...prev, [itemId]: next };
    });
  }

  async function handleSave() {
    if (varianceCount > 0) {
      const ok = window.confirm(`มี ${varianceCount} รายการยอดไม่ตรง (variance ≠ 0)\nต้องการบันทึกเลยไหม?`);
      if (!ok) return;
    }
    setSaving(true);
    try {
      const payload = shownRows.map((r) => ({ ...r, variance: varianceOf(r) }));
      const res = await fetch("/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch, date, rows: payload }),
      });
      const data = (await res.json()) as { ok?: boolean; updated?: number; inserted?: number; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "บันทึกไม่สำเร็จ");
      window.alert(`บันทึกสต็อกแล้ว ✓\nอัปเดต ${data.updated ?? 0} · เพิ่มใหม่ ${data.inserted ?? 0} รายการ`);
    } catch (e: any) {
      window.alert(`บันทึกไม่สำเร็จ: ${e?.message ?? e}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-4 pb-24">
      <PageTitle title="กรอกสต็อกรายวัน" right={<Badge tone="blue">{thaiDate(date)}</Badge>} />

      {/* แถบบน: สาขา + วันที่ */}
      <GlassCard className="mb-3">
        <div className="grid gap-3">
          <Segmented options={BRANCH_OPTS} value={branch} onChange={setBranch} />
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-brand-ink/50">วันที่</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="field"
            />
          </label>
        </div>
      </GlassCard>

      {/* แถบสรุป */}
      <div className="mb-3 grid grid-cols-2 gap-2.5">
        <Stat label="กรอกแล้ว" value={`${filledCount}/${total}`} />
        <Stat
          label="ยอดไม่ตรง"
          value={varianceCount > 0 ? `⚠️ ${varianceCount}` : "—"}
          tone={varianceCount > 0 ? "warn" : "default"}
        />
      </div>

      {err && (
        <GlassCard className="mb-3">
          <p className="text-sm text-warn">โหลดข้อมูลไม่สำเร็จ: {err}</p>
        </GlassCard>
      )}

      {loading ? (
        <GlassCard><p className="text-sm text-brand-ink/50">กำลังโหลด…</p></GlassCard>
      ) : groups.length === 0 ? (
        <GlassCard><p className="text-sm text-brand-ink/50">ไม่มีรายการสต็อกสำหรับสาขานี้</p></GlassCard>
      ) : (
        groups.map((g, gi) => (
          <Accordion
            key={g.category}
            title={g.category}
            count={`${g.items.length} รายการ`}
            defaultOpen={gi === 0}
          >
            <div className="grid gap-2 py-1">
              {g.items.map((it) => {
                const row = rows[it.id];
                if (!row) return null;
                const v = varianceOf(row);
                const filled = isFilled(row);
                return (
                  <div key={it.id} className="glass-soft px-3 py-2.5">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{it.name}</span>
                      <Badge>{it.unit}</Badge>
                    </div>

                    {it.hasRemainder && (
                      <div className="mb-1 text-[11px] font-medium text-brand-ink/50">เต็ม (แพ็ค)</div>
                    )}
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <NumberField label="ยกมา" value={row.carryPack} readOnly tone="ro" />
                      <NumberField
                        label="รับเข้า"
                        value={blankZero(row.inPack)}
                        onChange={(x) => setField(it.id, "inPack", x)}
                      />
                      <NumberField
                        label="ขาย/ใช้"
                        value={blankZero(row.used)}
                        onChange={(x) => setField(it.id, "used", x)}
                      />
                      <NumberField
                        label="คงเหลือ"
                        value={row.remainPack}
                        onChange={(x) => setField(it.id, "remainPack", x)}
                        tone="auto"
                      />
                    </div>

                    {it.hasRemainder && (
                      <>
                        <div className="mb-1 mt-2 text-[11px] font-medium text-brand-ink/50">เศษ (g)</div>
                        <div className="grid grid-cols-3 gap-2">
                          <NumberField label="ยกมา g" value={row.carryG} readOnly tone="ro" />
                          <NumberField
                            label="รับเข้า g"
                            value={blankZero(row.inG)}
                            onChange={(x) => setField(it.id, "inG", x)}
                          />
                          <NumberField label="คงเหลือ g" value={row.remainG} tone="auto" readOnly />
                        </div>
                      </>
                    )}

                    {v !== 0 ? (
                      <div className="mt-2 rounded-lg bg-warn/15 px-2.5 py-1.5 text-xs font-medium text-warn">
                        ⚠️ ยอดไม่ตรง (ต่าง {v > 0 ? "+" : ""}{v})
                      </div>
                    ) : filled ? (
                      <div className="mt-2 rounded-lg bg-ok/15 px-2.5 py-1.5 text-xs font-medium text-ok">
                        ✓ ยอดตรง
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </Accordion>
        ))
      )}

      <SaveBar>
        <Button onClick={handleSave} disabled={saving || loading}>
          {saving ? "กำลังบันทึก…" : "บันทึกสต็อกวันนี้"}
        </Button>
      </SaveBar>
    </div>
  );
}
