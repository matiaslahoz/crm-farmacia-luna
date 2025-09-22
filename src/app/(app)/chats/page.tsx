"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Session, Chat } from "@/lib/types";
import SessionsList from "./SessionsList";
import Conversation from "./Conversation";
import { groupByPhone, type SessionGroup } from "@/lib/groupByPhone";
import useUnreadCounts from "@/hooks/useUnreadCounts";

const PAGE_SIZE = 50;

type PreviewMap = Record<string, { text: string; date: string } | null>;

export default function ChatsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const [msgs, setMsgs] = useState<Chat[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const idsRef = useRef<number[]>([]);

  const [lastPreview, setLastPreview] = useState<PreviewMap>({});
  const loadingMoreRef = useRef(false);

  const uniqSortByIdAsc = (arr: Chat[]) => {
    const map = new Map<number, Chat>();
    for (const m of arr) map.set(m.id, m);
    return Array.from(map.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  useEffect(() => {
    supabase
      .from("Session")
      .select("id,date,estado,phone,derivar_humano,name")
      .order("date", { ascending: false })
      .limit(400)
      .then(({ data }) => setSessions(data || []));
  }, []);

  const groups: SessionGroup[] = useMemo(
    () => groupByPhone(sessions),
    [sessions]
  );
  const currentGroup = selectedPhone
    ? groups.find((g) => g.phone === selectedPhone)
    : undefined;

  const { counts: unreadCounts, markRead } = useUnreadCounts(groups);

  useEffect(() => {
    if (!groups.length) {
      setLastPreview({});
      return;
    }

    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        groups.map(async (g) => {
          const ids = g.sessions.map((s) => s.id);
          if (!ids.length) return [g.phone, null] as const;

          const { data } = await supabase
            .from("Chat")
            .select("message,date")
            .in("session_id", ids)
            .order("date", { ascending: false })
            .limit(1);

          const row = data?.[0] ?? null;
          return [
            g.phone,
            row ? { text: row.message ?? "", date: row.date } : null,
          ] as const;
        })
      );
      if (!cancelled) setLastPreview(Object.fromEntries(entries));
    })();

    return () => {
      cancelled = true;
    };
  }, [groups]);

  const handleSelectPhone = useCallback(
    async (phone: string) => {
      setSelectedPhone(phone);

      const toClear =
        groups
          .find((g) => g.phone === phone)
          ?.sessions.filter((s) => !!s.derivar_humano)
          .map((s) => s.id) ?? [];

      if (toClear.length) {
        setSessions((prev) =>
          prev.map((s) =>
            toClear.includes(s.id) ? { ...s, derivar_humano: false } : s
          )
        );
        await supabase
          .from("Session")
          .update({ derivar_humano: false })
          .in("id", toClear);
      }
    },
    [groups]
  );

  useEffect(() => {
    const ids = currentGroup?.sessions.map((s) => s.id) ?? [];
    idsRef.current = ids;
    if (!ids.length) {
      setMsgs([]);
      setStartIndex(0);
      return;
    }

    (async () => {
      setLoadingMsgs(true);

      // 1) total para calcular ventana
      const { count } = await supabase
        .from("Chat")
        .select("id", { count: "exact", head: true })
        .in("session_id", ids);

      const total = count || 0;

      // 2) última página
      const start = Math.max(0, total - PAGE_SIZE);
      const end = Math.max(0, total - 1);
      setStartIndex(start);

      // 3) fetch ventana
      const { data } = await supabase
        .from("Chat")
        .select("id,date,tipo,message,session_id")
        .in("session_id", ids)
        .order("date", { ascending: true })
        .range(start, end);

      setMsgs(
        (data || []).sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )
      );
      setLoadingMsgs(false);

      if (selectedPhone) markRead(selectedPhone);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPhone, sessions]);

  const loadMore = useCallback(async () => {
    const ids = idsRef.current;
    if (!ids.length) return;
    if (startIndex <= 0) return;
    if (loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMsgs(true);

    const newStart = Math.max(0, startIndex - PAGE_SIZE);
    const newEnd = startIndex - 1;

    const { data } = await supabase
      .from("Chat")
      .select("id,date,tipo,message,session_id")
      .in("session_id", ids)
      .order("date", { ascending: true })
      .range(newStart, newEnd);

    setMsgs((prev) => {
      const merged = [...(data || []), ...prev];
      return uniqSortByIdAsc(merged);
    });
    setStartIndex(newStart);
    setLoadingMsgs(false);
    loadingMoreRef.current = false;
  }, [startIndex]);

  const title = currentGroup
    ? currentGroup.name || currentGroup.phone
    : undefined;
  const meta =
    currentGroup && currentGroup.sessions.length > 1
      ? `${currentGroup.sessions.length} sesiones combinadas`
      : undefined;

  const hasMore = startIndex > 0;

  return (
    <div className="flex gap-4 h-full overflow-hidden min-h-0">
      <div className="h-full min-h-0 w-[330px]">
        <SessionsList
          groups={groups}
          selectedPhone={selectedPhone}
          query={query}
          setQuery={setQuery}
          onSelect={handleSelectPhone}
          unreadCounts={unreadCounts}
          lastPreview={lastPreview}
        />
      </div>

      <div className="flex-1 min-w-0">
        <Conversation
          title={title}
          phone={currentGroup?.phone}
          meta={meta}
          msgs={msgs}
          loading={loadingMsgs}
          hasMore={hasMore}
          onLoadMore={loadMore}
        />
      </div>
    </div>
  );
}
