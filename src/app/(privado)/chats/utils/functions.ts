import type { Chat, ChatGroup, Session } from "@/lib/types";

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

export function normalizeChat(c: Chat): Chat {
  return {
    ...c,
    users: Array.isArray(c.users) ? c.users[0] : c.users,
    type: c.type || undefined,
    message: c.message || undefined,
  };
}

export function sessionToGroup(s: Session): ChatGroup {
  const latestDate = s.last_date ?? new Date(0).toISOString();
  return {
    user_id: s.user_id,
    name: s.user_name ?? undefined,
    phone: s.user_phone ?? undefined,
    hasPendingOrder: Boolean(s.has_pending_order),
    latest: {
      id: s.last_chat_id ?? 0,
      date: latestDate,
      type: s.last_type ?? undefined,
      message: s.last_message ?? undefined,
      user_id: s.user_id,
    },
  } as ChatGroup;
}
