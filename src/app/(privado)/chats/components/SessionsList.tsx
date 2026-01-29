"use client";

import { useMemo } from "react";
import { Search } from "lucide-react";
import SessionGroupItem from "./SessionGroupItem";
import type { ChatGroup } from "@/lib/types";

export default function SessionsList({
  groups,
  selectedUserId,
  query,
  setQuery,
  onSelect,
  unreadCounts,
}: {
  groups: ChatGroup[];
  selectedUserId: number | null;
  query: string;
  setQuery: (q: string) => void;
  onSelect: (userId: number) => void;
  unreadCounts: Record<number, number>;
}) {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter(
      (g) =>
        (g.name || "").toLowerCase().includes(q) || (g.phone || "").includes(q),
    );
  }, [query, groups]);

  const sorted = useMemo(() => {
    return [...filtered].sort(
      (a, b) =>
        new Date(b.latest.date).getTime() - new Date(a.latest.date).getTime(),
    );
  }, [filtered]);

  return (
    <div className="flex flex-col h-full min-h-0 bg-white border-r border-gray-100">
      <div className="p-4 border-b border-gray-50/50 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4 tracking-tight">
          Mensajes
        </h2>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 group-focus-within:text-[var(--primary)] transition-colors" />
          <input
            placeholder="Buscar por nombre o teléfono…"
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 border-none ring-1 ring-transparent focus:ring-[var(--primary)]/20 focus:bg-white transition-all text-sm outline-none placeholder:text-gray-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto min-h-0">
        {sorted.map((g) => {
          return (
            <SessionGroupItem
              key={g.user_id}
              g={g}
              active={selectedUserId === g.user_id}
              onSelect={onSelect}
              unreadCount={unreadCounts[g.user_id] || 0}
            />
          );
        })}
        {sorted.length === 0 && (
          <div className="p-6 text-sm text-gray-500">Sin resultados.</div>
        )}
      </div>
    </div>
  );
}
