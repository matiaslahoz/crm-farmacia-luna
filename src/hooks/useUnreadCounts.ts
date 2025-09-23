"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { SessionGroup } from "@/lib/groupByPhone";

export default function useUnreadCounts(groups: SessionGroup[]) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const subRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const key = (phone: string) => `crmchat:lastSeen:${phone}`;
  const getLastSeen = (phone: string) => localStorage.getItem(key(phone)) || "";
  const setLastSeen = (phone: string, iso: string) =>
    localStorage.setItem(key(phone), iso);

  const groupsSig = useMemo(() => {
    return groups
      .map(
        (g) =>
          `${g.phone}:${g.sessions
            .map((s) => s.id)
            .sort((a, b) => a - b)
            .join(",")}`
      )
      .sort()
      .join("|");
  }, [groups]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const entries = await Promise.all(
        groups.map(async (g) => {
          const lastSeen = getLastSeen(g.phone);
          const ids = g.sessions.map((s) => s.id);
          if (ids.length === 0) return [g.phone, 0] as const;

          const { count } = await supabase
            .from("Chat")
            .select("id", { count: "exact", head: true })
            .in("session_id", ids)
            .neq("tipo", "ia")
            .gt("date", lastSeen || "1970-01-01");

          return [g.phone, count || 0] as const;
        })
      );
      if (!mounted) return;
      setCounts(Object.fromEntries(entries));
    })();
    return () => {
      mounted = false;
    };
  }, [groupsSig, groups]);

  useEffect(() => {
    subRef.current?.unsubscribe();
    const ch = supabase.channel("chat_unread_rt");
    subRef.current = ch;

    ch.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "Chat" },
      (payload) => {
        const newRow = payload?.new as {
          session_id: number;
          tipo: string;
          date: string;
        };
        if (!newRow || newRow.tipo === "ia") return;

        const match = groups.find((g) =>
          g.sessions.some((s) => s.id === newRow.session_id)
        );
        if (!match) return;

        const lastSeen = getLastSeen(match.phone);
        if (lastSeen && new Date(newRow.date) <= new Date(lastSeen)) return;

        setCounts((prev) => ({
          ...prev,
          [match.phone]: (prev[match.phone] || 0) + 1,
        }));
      }
    );

    ch.subscribe();

    return () => {
      ch.unsubscribe();
      subRef.current = null;
    };
  }, [groupsSig, groups]);

  const markRead = useCallback(
    (phone: string) => {
      const now = new Date().toISOString();
      const prev = counts[phone] || 0;
      setLastSeen(phone, now);
      if (prev !== 0) setCounts((p) => ({ ...p, [phone]: 0 }));
    },
    [counts]
  );

  return useMemo(() => ({ counts, markRead }), [counts, markRead]);
}
