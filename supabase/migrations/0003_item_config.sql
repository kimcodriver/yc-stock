-- เพิ่ม config โหมดขายต่อ item (grams_per_uom) สำหรับ DB ที่ตั้งไปแล้ว
alter table items add column if not exists grams_per_uom numeric not null default 0;

-- ตั้ง default: Yogurt 1kg/Box = ขายแบบแกะ 1000g/แพ็ค · Yogurt 500g/Box = ขายเต็มกล่อง
update items set has_remainder = true,  grams_per_uom = 1000 where category = 'Yogurt 1kg/Box';
update items set has_remainder = false, grams_per_uom = 500  where category = 'Yogurt 500g/Box';

-- reload PostgREST schema cache หลังเพิ่ม column
notify pgrst, 'reload schema';
