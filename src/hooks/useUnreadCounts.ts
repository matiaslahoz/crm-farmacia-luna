"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Session } from "@/lib/types";
import { normalizePhone } from "@/lib/phone";
import type { SessionGroup } from "@/lib/groupByPhone";

export default function useUnreadCounts(groups: SessionGroup[]) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const phoneSet = useMemo(() => new Set(groups.map((g) => g.phone)), [groups]);
  const subRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // lastSeen helpers (por cliente/local)
  const key = (phone: string) => `crmchat:lastSeen:${phone}`;
  const getLastSeen = (phone: string) => localStorage.getItem(key(phone)) || "";
  const setLastSeen = (phone: string, iso: string) =>
    localStorage.setItem(key(phone), iso);

  // cálculo inicial de no leídos (consulta ligera por grupo)
  useEffect(() => {
    let mounted = true;
    (async () => {
      const entries = await Promise.all(
        groups.map(async (g) => {
          const lastSeen = getLastSeen(g.phone); // si '', cuenta desde el inicio
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
  }, [groups]);

  // realtime: incremento cuando llega mensaje nuevo "usuario"
  useEffect(() => {
    // limpiar suscripción vieja
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

        // ¿a qué phone pertenece esa session_id?
        // Lo resolvemos con el grupo actual (en memoria):
        const match = groups.find((g) =>
          g.sessions.some((s) => s.id === newRow.session_id)
        );
        if (!match) return;

        const lastSeen = getLastSeen(match.phone);
        if (lastSeen && new Date(newRow.date) <= new Date(lastSeen)) return;

        // si no está abierto ese teléfono, sumo +1
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
  }, [groups]);

  // API para “marcar como leído” (al abrir la conversación)
  function markRead(phone: string) {
    setLastSeen(phone, new Date().toISOString());
    setCounts((p) => ({ ...p, [phone]: 0 }));
  }

  return { counts, markRead };
}
