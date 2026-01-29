"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { ChatGroup } from "@/lib/types";

export default function useUnreadMessages(groups: ChatGroup[]) {
  const [counts, setCounts] = useState<Record<number, number>>({});
  const subRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const key = (userId: number) => `crmchat:lastSeen:${userId}`;

  const getLastSeen = (userId: number) => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(key(userId)) || "";
  };

  const setLastSeen = (userId: number, iso: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(key(userId), iso);
  };

  const groupsSig = useMemo(() => {
    return groups.map((g) => g.user_id).join("|");
  }, [groups]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const entries = await Promise.all(
        groups.map(async (g) => {
          const lastSeen = getLastSeen(g.user_id);

          let query = supabase
            .from("chats")
            .select("id", { count: "exact", head: true })
            .eq("user_id", g.user_id)
            .neq("type", "ia");

          if (lastSeen) {
            query = query.gt("date", lastSeen);
          }

          const { count } = await query;

          return [g.user_id, count || 0] as const;
        }),
      );

      if (!mounted) return;
      setCounts(Object.fromEntries(entries));
    })();

    return () => {
      mounted = false;
    };
  }, [groupsSig]);

  useEffect(() => {
    if (subRef.current) subRef.current.unsubscribe();

    const ch = supabase.channel("chat_unread_rt");
    subRef.current = ch;

    ch.on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "chats" },
      (payload) => {
        const newRow = payload?.new as {
          user_id: number;
          type: string;
          date: string;
        };

        if (!newRow) return;
        if (newRow.type === "ia") return;
        const worksForGroup = groups.some((g) => g.user_id === newRow.user_id);
        if (!worksForGroup) return;

        const lastSeen = getLastSeen(newRow.user_id);
        if (lastSeen && new Date(newRow.date) <= new Date(lastSeen)) return;

        setCounts((prev) => ({
          ...prev,
          [newRow.user_id]: (prev[newRow.user_id] || 0) + 1,
        }));
      },
    );

    ch.subscribe();

    return () => {
      ch.unsubscribe();
      subRef.current = null;
    };
  }, [groupsSig]);

  const markAsRead = useCallback((userId: number) => {
    const now = new Date().toISOString();
    setLastSeen(userId, now);
    setCounts((prev) => {
      if (!prev[userId]) return prev;
      const next = { ...prev };
      delete next[userId];
      return next;
    });

    setCounts((p) => ({ ...p, [userId]: 0 }));
  }, []);

  return { unreadCounts: counts, markAsRead };
}
