"use client";
import React from "react";
import Link from "next/link";
import { GlassCard, Badge, Stat, PageTitle } from "@/components/ui";
import { baht, todayISO } from "@/lib/fmt";
import { BRANCHES, type Branch } from "@/lib/types";

type Dashboard = {
  lowStock: { branch: Branch; item: string; remain: number; par: number }[];
  salesToday: { branch: Branch; total: number }[];
  varianceAlerts: { branch: Branch; count: number }[];
};

const LINKS = [
  { href: "/stock", label: "กรอกสต็อก", icon: "📝" },
  { href: "/restock", label: "ต้องเติม", icon: "📦" },
  { href: "/sales", label: "ยอดขาย", icon: "💰" },
  { href: "/cups", label: "ถ้วย", icon: "🥤" },
];

const PREVIEW = 8; // จำนวนรายการใกล้หมดที่โชว์ต่อสาขา

export default function DashboardPage() {
  const [date, setDate] = React.useState(todayISO());
  const [data, setData] = React.useState<Dashboard | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);
    fetch(`/api/dashboard?date=${date}`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (d?.error) setErr(d.error);
        else setData(d);
      })
      .catch((e) => alive && setErr(e?.message ?? "โหลดไม่สำเร็จ"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [date]);

  const totalSales = data?.salesToday.reduce((s, x) => s + x.total, 0) ?? 0;
  const salesOf = (b: Branch) => data?.salesToday.find((x) => x.branch === b)?.total ?? 0;
  const lowOf = (b: Branch) => data?.lowStock.filter((x) => x.branch === b) ?? [];
  const varOf = (b: Branch) => data?.varianceAlerts.find((x) => x.branch === b)?.count ?? 0;

  return (
    <div>
      <PageTitle
        title="ภาพรวมร้าน"
        right={
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value || todayISO())}
            className="field w-auto text-sm"
          />
        }
      />

      {err && (
        <GlassCard className="mb-3">
          <div className="text-sm text-warn">โหลดข้อมูลไม่สำเร็จ: {err}</div>
        </GlassCard>
      )}

      {/* 2. ยอดขายวันนี้ */}
      <div className="mb-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        <div className="col-span-2 sm:col-span-1">
          <Stat label="ยอดขายวันนี้ (รวมทุกสาขา)" value={loading ? "…" : baht(totalSales)} />
        </div>
        {BRANCHES.map((b) => (
          <Stat key={b} label={`ยอดขาย ${b}`} value={loading ? "…" : baht(salesOf(b))} />
        ))}
      </div>

      {/* การ์ด grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* 3. ของใกล้หมด */}
        <GlassCard>
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold">📦 ของใกล้หมด (ต่ำกว่า Par)</h2>
          </div>
          {loading ? (
            <div className="py-4 text-center text-sm text-brand-ink/40">กำลังโหลด…</div>
          ) : (
            <div className="flex flex-col gap-3">
              {BRANCHES.map((b) => {
                const rows = lowOf(b);
                return (
                  <div key={b}>
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="text-sm font-medium">{b}</span>
                      <Badge tone={rows.length ? "warn" : "ok"}>
                        {rows.length ? `${rows.length} รายการ` : "ครบ"}
                      </Badge>
                    </div>
                    {rows.length > 0 && (
                      <ul className="flex flex-col gap-1">
                        {rows.slice(0, PREVIEW).map((r, i) => (
                          <li
                            key={i}
                            className="glass-soft flex items-center justify-between px-2.5 py-1.5 text-sm"
                          >
                            <span className="truncate pr-2">{r.item}</span>
                            <span className="shrink-0 font-medium text-warn">
                              {r.remain}
                              <span className="text-brand-ink/40">/{r.par}</span>
                            </span>
                          </li>
                        ))}
                        {rows.length > PREVIEW && (
                          <li className="px-2.5 pt-0.5 text-xs text-brand-ink/50">
                            และอีก {rows.length - PREVIEW} รายการ
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        {/* 4. ยอดไม่ตรง (variance) */}
        <GlassCard>
          <div className="mb-2.5 flex items-center justify-between">
            <h2 className="text-[15px] font-semibold">⚠️ ยอดไม่ตรง (variance)</h2>
          </div>
          {loading ? (
            <div className="py-4 text-center text-sm text-brand-ink/40">กำลังโหลด…</div>
          ) : (
            <div className="flex flex-col gap-2">
              {BRANCHES.map((b) => {
                const c = varOf(b);
                return (
                  <div
                    key={b}
                    className="glass-soft flex items-center justify-between px-3 py-2.5"
                  >
                    <span className="text-sm font-medium">{b}</span>
                    <Badge tone={c === 0 ? "ok" : "warn"}>
                      {c === 0 ? "ตรงหมด" : `${c} รายการไม่ตรง`}
                    </Badge>
                  </div>
                );
              })}
              <p className="px-0.5 pt-0.5 text-xs text-brand-ink/45">
                นับจากรายการที่ยอดคงเหลือไม่ตรงกับที่ระบบคำนวณในวันนี้
              </p>
            </div>
          )}
        </GlassCard>
      </div>

      {/* 5. Quick links */}
      <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="glass flex flex-col items-center gap-1 px-3 py-4 text-center transition active:scale-[.98]"
          >
            <span className="text-2xl leading-none">{l.icon}</span>
            <span className="text-sm font-medium">{l.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
