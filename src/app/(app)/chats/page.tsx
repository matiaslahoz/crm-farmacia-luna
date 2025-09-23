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
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const idsRef = useRef<number[]>([]);
  const [lastPreview, setLastPreview] = useState<PreviewMap>({});
  const loadingMoreRef = useRef(false);

  const uniqSortByIdDesc = (arr: Chat[]) => {
    const map = new Map<number, Chat>();
    for (const m of arr) map.set(m.id, m);
    return Array.from(map.values()).sort((a, b) => b.id - a.id);
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

  const currentGroup = useMemo(
    () =>
      selectedPhone ? groups.find((g) => g.phone === selectedPhone) : undefined,
    [groups, selectedPhone]
  );

  const currentIds = useMemo(
    () => currentGroup?.sessions.map((s) => s.id) ?? [],
    [currentGroup]
  );

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
    idsRef.current = currentIds;
    if (!currentIds.length) {
      setMsgs([]);
      setOffset(0);
      setHasMore(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoadingMsgs(true);

      const { count } = await supabase
        .from("Chat")
        .select("id", { count: "exact", head: true })
        .in("session_id", currentIds);

      const { data } = await supabase
        .from("Chat")
        .select("id,date,tipo,message,session_id")
        .in("session_id", currentIds)
        .order("id", { ascending: false })
        .range(0, PAGE_SIZE - 1);

      if (cancelled) return;

      const initial = uniqSortByIdDesc(data || []);
      setMsgs(initial);
      const fetched = data?.length || 0;
      setOffset(fetched);
      setHasMore((count || 0) > fetched);
      setLoadingMsgs(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [currentIds.join("|")]);

  useEffect(() => {
    if (selectedPhone) markRead(selectedPhone);
  }, [selectedPhone, markRead]);

  const loadMore = useCallback(async () => {
    const ids = idsRef.current;
    if (!ids.length) return;
    if (loadingMoreRef.current) return;
    if (!hasMore) return;

    loadingMoreRef.current = true;
    setLoadingMsgs(true);

    const start = offset;
    const end = offset + PAGE_SIZE - 1;

    const { data } = await supabase
      .from("Chat")
      .select("id,date,tipo,message,session_id")
      .in("session_id", ids)
      .order("id", { ascending: false })
      .range(start, end);

    setMsgs((prev) => uniqSortByIdDesc([...(prev || []), ...(data || [])]));
    const fetched = data?.length || 0;
    setOffset(start + fetched);
    setHasMore(fetched === PAGE_SIZE);
    setLoadingMsgs(false);
    loadingMoreRef.current = false;
  }, [offset, hasMore]);

  const title = currentGroup
    ? currentGroup.name || currentGroup.phone
    : undefined;
  const meta =
    currentGroup && currentGroup.sessions.length > 1
      ? `${currentGroup.sessions.length} sesiones combinadas`
      : undefined;

  const msgsDisplay = useMemo(() => [...msgs].reverse(), [msgs]);

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
          msgs={msgsDisplay}
          loading={loadingMsgs}
          hasMore={hasMore}
          onLoadMore={loadMore}
        />
      </div>
    </div>
  );
}
