import type { Session } from "@/lib/types";
import { normalizePhone } from "./phone";

export type SessionGroup = {
  phone: string; // normalizado
  name: string | null; // mejor nombre disponible
  sessions: Session[]; // todas las sesiones de ese phone (desc por fecha)
  latest: Session; // la más reciente
};

export function groupByPhone(sessions: Session[]): SessionGroup[] {
  const map = new Map<string, Session[]>();

  for (const s of sessions) {
    const key = normalizePhone(s.phone);
    const arr = map.get(key) ?? [];
    arr.push(s);
    map.set(key, arr);
  }

  const groups: SessionGroup[] = [];
  for (const [phone, arr] of map) {
    arr.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latest = arr[0];
    const name = latest.name ?? arr.find((x) => x.name)?.name ?? null;
    groups.push({ phone, name, sessions: arr, latest });
  }

  groups.sort(
    (a, b) =>
      new Date(b.latest.date).getTime() - new Date(a.latest.date).getTime()
  );
  return groups;
}
