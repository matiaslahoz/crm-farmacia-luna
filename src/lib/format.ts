export function initials(name?: string | null, phone?: number | string | null) {
  const n = (name || "").trim();
  if (n) {
    const parts = n.split(/\s+/).slice(0, 2);
    return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
  }
  const s = String(phone ?? "");
  return s.slice(-2);
}
export function fmtTime(ts: string) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
