import type { Chat } from "@/lib/types";

export function uniqSortByIdDesc(arr: Chat[]) {
  const map = new Map<number, Chat>();
  for (const m of arr) map.set(m.id, m);
  return Array.from(map.values()).sort((a, b) => b.id - a.id);
}

export function truncate(s: string, n = 68) {
  if (!s) return "";
  const clean = s.replace(/\s+/g, " ").trim();
  return clean.length > n ? clean.slice(0, n).trimEnd() + "…" : clean;
}
