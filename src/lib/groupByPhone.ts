import { Chat, ChatGroup } from "./types";

export function groupByUserId(chats: Chat[]): ChatGroup[] {
  const map = new Map<number, Chat[]>();

  for (const s of chats) {
    const key = s.user_id;
    const arr = map.get(key) ?? [];
    arr.push(s);
    map.set(key, arr);
  }

  const groups: ChatGroup[] = [];
  for (const [userId, arr] of map) {
    arr.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latest = arr[0];
    const user = latest.users;
    const name = user?.real_name || user?.display_name || "Sin Nombre";
    const phone = user?.phone;

    groups.push({ user_id: userId, name, phone, chats: arr, latest });
  }

  groups.sort(
    (a, b) =>
      new Date(b.latest.date).getTime() - new Date(a.latest.date).getTime(),
  );
  return groups;
}
