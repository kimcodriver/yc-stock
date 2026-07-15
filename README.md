# YC Stock — ระบบจัดการสต็อก Yogurt Culture

เว็บแอปกรอกสต็อกสิ้นวัน + เติมของ (พุธ/เสาร์) + ยอดขาย + reconcile ถ้วย · mobile-first (iPad/มือถือ)

## Stack
Next.js 14 (App Router) · TypeScript · Tailwind (glassmorphism) · Supabase (Postgres) · **BFF = Route Handlers** · Deploy **Vercel**

## รันในเครื่อง (ไม่ต้องต่อ DB)
```bash
npm install
npm run dev        # http://localhost:3000  — ใช้ in-memory seeded store (ข้อมูลจริงจาก BackOffice)
```
> ไม่ตั้ง env → ระบบใช้ **memory store** (seeded, พร้อม demo/test ทันที)

## Deploy จริง (Vercel + Supabase)
1. สร้าง Supabase project → SQL editor รัน **ตามลำดับนี้** (สำคัญ — ผิดลำดับ FK จะ error):
   1. `supabase/migrations/0001_init.sql` — สร้างตาราง
   2. `supabase/seed.sql` — branches (SND, NVP)
   3. `supabase/seed-items.sql` — **items (112) + par_levels (224)** ← ต้องมาก่อน stock
   4. `supabase/seed-stock.sql` — สต็อกตั้งต้น (คงเหลือล่าสุด 2026-07-13 · 221 แถว · ฐาน carry-forward)
   > seed-items.sql เป็นไฟล์สำเร็จรูปแล้ว (regenerate ได้ด้วย `node --experimental-strip-types scripts/gen-seed.mjs > supabase/seed-items.sql`)
2. Vercel → import repo → ตั้ง Environment Variables:
   - `USE_SUPABASE=1`
   - `SUPABASE_URL=...`
   - `SUPABASE_SERVICE_ROLE_KEY=...`
3. Deploy (push GitHub หรือ `vercel`)

## สถาปัตยกรรม (BFF)
```
Browser (React glass, mobile) → fetch /api/* → Route Handlers (BFF) → lib/db → memory | Supabase
```
- Client เรียกเฉพาะ `/api/*` (ไม่แตะ Supabase ตรง)
- Business logic: `src/lib/calc.ts` (pure, ใช้ทั้ง BFF/UI)
- Data store: `src/lib/db.ts` สลับ memory/supabase ด้วย `USE_SUPABASE`

## Modules
| Route | ทำอะไร |
|---|---|
| `/` | Dashboard — ของใกล้หมด · ยอดวันนี้ · variance alert |
| `/stock` | กรอกสต็อกสิ้นวัน (ยกมา auto · เต็ม+เศษ · variance) |
| `/restock` | ต้องเติม (Par · filter สาขา×วัน สำหรับ 7 special) |
| `/sales` | ยอดขายแยกช่องทาง |
| `/cups` | reconcile ถ้วยเสิร์ฟ (size-swap) |

## เอกสาร
PRD: `../specs/stock-management/PRD.md` · Design: `../specs/stock-management/SA_DESIGN.md`

## Test
```bash
npm test           # unit tests (lib/calc)
npm run build      # ต้องผ่านก่อน deploy
```
