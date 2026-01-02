"use client";

import { useMemo } from "react";
import { Search } from "lucide-react";
import SessionGroupItem from "./SessionGroupItem";
import type { SessionGroup } from "@/lib/groupByPhone";

export default function SessionsList({
  groups,
  selectedPhone,
  query,
  setQuery,
  onSelect,
  unreadCounts = {},
  lastPreview = {},
}: {
  groups: SessionGroup[];
  selectedPhone: string | null;
  query: string;
  setQuery: (q: string) => void;
  onSelect: (phone: string) => void;
  unreadCounts?: Record<string, number>;
  lastPreview?: Record<string, { text: string; date: string } | null>;
}) {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter(
      (g) =>
        (g.name || "").toLowerCase().includes(q) ||
        g.phone.includes(q) ||
        (g.latest?.status || "").toLowerCase().includes(q)
    );
  }, [query, groups]);

  const getLastDate = (g: SessionGroup): number => {
    const fromPreview = lastPreview[g.phone]?.date;
    const fromLatest = g?.latest?.date;
    const fromSessions =
      Array.isArray(g.sessions) && g.sessions.length
        ? g.sessions[g.sessions.length - 1]?.date
        : undefined;

    const candidate = fromPreview ?? fromLatest ?? fromSessions ?? null;

    const ts = candidate ? Date.parse(candidate) : NaN;
    return Number.isNaN(ts) ? 0 : ts;
  };

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => getLastDate(b) - getLastDate(a));
  }, [filtered, lastPreview]);

  return (
    <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden flex flex-col h-full min-h-0">
      <div className="p-3 border-b border-gray-200 sticky top-0 bg-white">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            placeholder="Buscar por nombre, teléfono o status…"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-gray-900"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto min-h-0">
        {sorted.map((g) => {
          const needsHuman = g.sessions.some((s) => !!s.requires_human);
          return (
            <SessionGroupItem
              key={g.phone}
              g={g}
              active={selectedPhone === g.phone}
              onSelect={onSelect}
              unread={unreadCounts[g.phone] || 0}
              preview={lastPreview[g.phone] || null}
              needsHuman={needsHuman}
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
