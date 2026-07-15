// helper การแสดงผล
export const baht = (n: number): string => "฿" + Math.round(n).toLocaleString("en-US");

export const todayISO = (): string => new Date().toISOString().slice(0, 10);

/** yyyy-mm-dd → dd/mm/yyyy (พ.ศ.ไม่แปลง เพื่อความชัด) */
export function thaiDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export const weekdayLabel = (w: "wed" | "sat"): string => (w === "wed" ? "วันพุธ" : "วันเสาร์");
