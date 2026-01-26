"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Session, Chat } from "@/lib/types";
import { groupByPhone, type SessionGroup } from "@/lib/groupByPhone";
import useUnreadCounts from "@/hooks/useUnreadCounts";
import { uniqSortByIdDesc } from "../utils/uniqSortByIdDesc";

const PAGE_SIZE = 50;

type PreviewMap = Record<string, { text: string; date: string } | null>;

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [breakpoint]);

  return isMobile;
}

export function useChatsPage({ breakpoint = 640, sessionsLimit = 400 } = {}) {
  const isMobile = useIsMobile(breakpoint);
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const [sessions, setSessions] = useState<Session[]>([]);

  const [lastPreview, setLastPreview] = useState<PreviewMap>({});

  const [msgs, setMsgs] = useState<Chat[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const idsRef = useRef<number[]>([]);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      const { data } = await supabase
        .from("sessions")
        .select("id,date,status,phone,requires_human,name")
        .order("date", { ascending: false })
        .limit(sessionsLimit);

      if (!alive) return;
      setSessions((data as Session[]) || []);
    })();

    return () => {
      alive = false;
    };
  }, [sessionsLimit]);

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

  useEffect(() => {
    idsRef.current = currentIds;
  }, [currentIds]);

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
            .from("chats")
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

  useEffect(() => {
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
        .from("chats")
        .select("id", { count: "exact", head: true })
        .in("session_id", currentIds);

      const { data } = await supabase
        .from("chats")
        .select("id,date,type,message,session_id")
        .in("session_id", currentIds)
        .order("id", { ascending: false })
        .range(0, PAGE_SIZE - 1);

      if (cancelled) return;

      const initial = uniqSortByIdDesc((data as Chat[]) || []);
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

  const handleSelectPhone = useCallback(
    async (phone: string) => {
      setSelectedPhone(phone);

      markRead(phone);

      const toClear =
        groups
          .find((g) => g.phone === phone)
          ?.sessions.filter((s) => !!s.requires_human)
          .map((s) => s.id) ?? [];

      if (toClear.length) {
        setSessions((prev) =>
          prev.map((s) =>
            toClear.includes(s.id) ? { ...s, requires_human: false } : s
          )
        );

        await supabase
          .from("sessions")
          .update({ requires_human: false })
          .in("id", toClear);
      }
    },
    [groups, markRead]
  );

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
      .from("chats")
      .select("id,date,type,message,session_id")
      .in("session_id", ids)
      .order("id", { ascending: false })
      .range(start, end);

    setMsgs((prev) =>
      uniqSortByIdDesc([...(prev || []), ...((data as Chat[]) || [])])
    );

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

  return {
    isMobile,
    query,
    setQuery,
    selectedPhone,
    setSelectedPhone,
    sessions,
    groups,
    currentGroup,
    lastPreview,
    unreadCounts,
    title,
    meta,
    msgsDisplay,
    loadingMsgs,
    hasMore,
    loadMore,
    handleSelectPhone,
  };
}
