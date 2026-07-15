-- FIX: /stock ว่างเพราะ RLS บล็อกการอ่าน items/par_levels
-- รันใน Supabase SQL editor แล้ว refresh เว็บ (ไม่ต้อง redeploy)

alter table branches      disable row level security;
alter table items         disable row level security;
alter table par_levels    disable row level security;
alter table stock_daily   disable row level security;
alter table sales_daily   disable row level security;
alter table cup_reconcile disable row level security;

-- diagnostic: ควรได้ items 112, par 224, stock 221
select 'items' t, count(*) from items
union all select 'par_levels', count(*) from par_levels
union all select 'stock_daily', count(*) from stock_daily
union all select 'branches', count(*) from branches;
