"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "หน้าหลัก", icon: "🏠" },
  { href: "/stock", label: "สต็อก", icon: "📝" },
  { href: "/restock", label: "ต้องเติม", icon: "📦" },
  { href: "/sales", label: "ยอดขาย", icon: "💰" },
  { href: "/cups", label: "ถ้วย", icon: "🥤" },
];

export function TopBar() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/50 bg-white/50 backdrop-blur-xl">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-red to-brand-orange text-sm font-bold text-white">YC</div>
        <div className="leading-tight">
          <div className="text-[15px] font-semibold">Yogurt Culture</div>
          <div className="text-[11px] text-brand-ink/50">ระบบจัดการสต็อก</div>
        </div>
        <Link href="/settings" aria-label="ตั้งค่า"
          className="ml-auto grid h-9 w-9 place-items-center rounded-xl border border-white/60 bg-white/50 text-lg">⚙️</Link>
      </div>
    </header>
  );
}

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="sticky bottom-0 z-30 border-t border-white/50 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-3xl">
        {TABS.map((t) => {
          const on = t.href === "/" ? path === "/" : path.startsWith(t.href);
          return (
            <Link key={t.href} href={t.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] transition ${on ? "text-brand-red" : "text-brand-ink/55"}`}>
              <span className="text-lg leading-none">{t.icon}</span>
              <span className={on ? "font-semibold" : ""}>{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
