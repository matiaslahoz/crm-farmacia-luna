"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { ChatGroup, Session } from "@/lib/types";

export default function useUnreadMessages(
  groups: ChatGroup[],
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>,
) {
  const [counts, setCounts] = useState<Record<number, number>>({});
  const subRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const key = (userId: number) => `crmchat:lastSeen:${userId}`;

  const getLastSeen = useCallback((userId: number) => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(key(userId)) || "";
  }, []);

  const setLastSeen = useCallback((userId: number, iso: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(key(userId), iso);
  }, []);

  const loadCounts = useCallback(async () => {
    if (groups.length === 0) {
      setCounts({});
      return;
    }

    const userIds = groups.map((g) => g.user_id);

    const lastSeenMap: Record<string, string> = {};
    for (const id of userIds) {
      const v = getLastSeen(id);
      if (v) lastSeenMap[String(id)] = v;
    }

    const { data, error } = await supabase.rpc("unread_counts", {
      p_user_ids: userIds,
      p_last_seen: lastSeenMap,
    });

    if (error) {
      console.error("Error unread_counts:", error);
      return;
    }

    const rows = (data ?? []) as { user_id: number; unread: number }[];
    const next: Record<number, number> = {};
    for (const r of rows) next[r.user_id] = r.unread ?? 0;

    // por si algún user_id no vino (no debería), lo seteamos 0
    for (const id of userIds) {
      if (next[id] === undefined) next[id] = 0;
    }

    setCounts(next);
  }, [groups, getLastSeen]);

  const OpenChannel = useCallback(() => {
    if (subRef.current) subRef.current.unsubscribe();

    const ch = supabase.channel("chat_unread_rt");
    subRef.current = ch;

    ch.on(
      "postgres_changes", // Escuchar cambios en la base de datos
      { event: "INSERT", schema: "public", table: "chats" }, // Solo cuando se INSERTE un nuevo chat
      (payload) => {
        const newRow = payload?.new as {
          user_id: number;
          type: string;
          date: string;
          message: string;
        };

        if (!newRow) return;
        const worksForGroup = groups.some((g) => g.user_id === newRow.user_id);
        if (!worksForGroup) return;

        const lastSeen = getLastSeen(newRow.user_id);
        if (lastSeen && new Date(newRow.date) <= new Date(lastSeen)) return;

        setCounts((prev) => ({
          ...prev,
          [newRow.user_id]: (prev[newRow.user_id] || 0) + 1,
        }));

        setSessions((prev) => {
          return prev.map((s) => {
            if (s.user_id !== newRow.user_id) return s;
            // Si el chat que llegó es más nuevo que el que tengo, actualizo latest
            const prevDate = s.last_date ? new Date(String(s.last_date)) : null;
            const newDate = new Date(newRow.date);
            if (prevDate && newDate <= prevDate) return s;

            return {
              ...s,
              last_date: newRow.date,
              last_message: newRow.message,
            };
          });
        });
      }, // Ejecuta esto cuando pase
    );

    ch.subscribe(); // Abre la conexión

    return () => {
      ch.unsubscribe();
      subRef.current = null;
    };
  }, [getLastSeen, groups, setSessions]);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  useEffect(() => {
    return OpenChannel();
  }, [OpenChannel]);

  const markAsRead = useCallback(
    (userId: number) => {
      // 1. Obtiene la hora actual
      const now = new Date().toISOString();
      // 2. Guarda esta hora en localStorage
      setLastSeen(userId, now);
      // 3. Actualiza el estado local 'counts' para poner CERO (0) en ese usuario
      setCounts((p) => ({ ...p, [userId]: 0 }));
    },
    [setLastSeen],
  );

  return { unreadCounts: counts, markAsRead };
}
