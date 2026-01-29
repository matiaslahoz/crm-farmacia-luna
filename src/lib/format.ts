export function initials(name?: string | null, phone?: number | string | null) {
  const n = (name || "").trim();
  if (n) {
    const parts = n.split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
  }
  const s = String(phone ?? "");
  return s.slice(-2);
}

export function formatDayLabel(d: Date) {
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit" });
}
export function formatMonthLabel(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
}
export function formatYearLabel(d: Date) {
  return d.getFullYear().toString();
}
