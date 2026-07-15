// Shared types — สัญญากลางของทั้งระบบ (BFF + UI ใช้ร่วมกัน)

export type Branch = "SND" | "NVP";
export const BRANCHES: Branch[] = ["SND", "NVP"];

export type Weekday = "wed" | "sat";
export type CupSize = "P" | "S" | "BOWL" | "14OZ";

export interface Item {
  id: string;
  name: string;
  category: string;
  unit: string;
  isSpecial: boolean;   // 7 รายการ special (รอบเข้าของแยกวัน/สาขา)
  isCup: boolean;       // ถ้วยเสิร์ฟ (reconcile)
  cupSize?: CupSize;
  hasRemainder: boolean; // กรอกได้ทั้งเต็ม(แพ็ค) + เศษ(กรัม)
  sort: number;
}

export interface ParMap {
  [itemId: string]: { SND: number | null; NVP: number | null };
}

export interface Meta {
  branches: Branch[];
  items: Item[];
  par: ParMap;
}

export interface StockRow {
  itemId: string;
  carryPack: number;
  carryG: number;
  inPack: number;
  inG: number;
  used: number;
  remainPack: number;
  remainG: number;
  returned: number;
  note: string;
  variance: number;
}

export interface SalesRow {
  cash: number;
  qr: number;
  edc: number;
  grab: number;
  lineman: number;
}

export interface CupRow {
  size: CupSize;
  start: number;
  in: number;
  remain: number;
  sold: number;
}

export interface RestockRow {
  itemId: string;
  name: string;
  category: string;
  unit: string;
  par: number | null;
  remain: number;
  need: number | null;
  isSpecial: boolean;
}
