"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Chat, ChatGroup, ChatRow as ChatRowType } from "@/lib/types";
import { groupByUserId } from "@/lib/groupByPhone";
import useUnreadMessages from "@/hooks/useUnreadMessages";
import { uniqSortByIdDesc } from "../utils/functions";

const PAGE_SIZE = 50;

const normalizeChat = (c: ChatRowType): Chat => ({
  ...c,
  users: Array.isArray(c.users) ? c.users[0] : c.users,
  type: c.type || undefined,
  message: c.message || undefined,
});

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

export function useChatsPage({ breakpoint = 640, chatsLimit = 400 } = {}) {
  const isMobile = useIsMobile(breakpoint);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [rawChats, setRawChats] = useState<Chat[]>([]);
  const [msgs, setMsgs] = useState<Chat[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const loadingMoreRef = useRef(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase
        .from("chats")
        .select("id,date,type,message,user_id, users(*)")
        .order("date", { ascending: false })
        .limit(chatsLimit);

      if (!alive) return;

      const chats = ((data || []) as unknown as ChatRowType[]).map(
        normalizeChat,
      );

      setRawChats(chats);
    })();
    return () => {
      alive = false;
    };
  }, [chatsLimit]);

  const groupsWithoutOrders: ChatGroup[] = useMemo(
    () => groupByUserId(rawChats),
    [rawChats],
  );

  const [pendingOrderUserIds, setPendingOrderUserIds] = useState<Set<number>>(
    new Set(),
  );

  useEffect(() => {
    if (groupsWithoutOrders.length === 0) return;

    const userIds = groupsWithoutOrders.map((g) => g.user_id);

    (async () => {
      const { data } = await supabase
        .from("orders_crm")
        .select("user_id")
        .eq("status", "PENDING")
        .in("user_id", userIds);

      if (data) {
        const ids = new Set(
          (data as { user_id: number }[]).map((o) => o.user_id),
        );
        setPendingOrderUserIds(ids);
      }
    })();
  }, [groupsWithoutOrders.length]);

  const groups = useMemo(() => {
    return groupsWithoutOrders.map((g) => ({
      ...g,
      hasPendingOrder: pendingOrderUserIds.has(g.user_id),
    }));
  }, [groupsWithoutOrders, pendingOrderUserIds]);

  const { unreadCounts, markAsRead } = useUnreadMessages(groups);

  const currentGroup = useMemo(
    () =>
      selectedUserId
        ? groups.find((g) => g.user_id === selectedUserId)
        : undefined,
    [groups, selectedUserId],
  );

  useEffect(() => {
    if (!selectedUserId) {
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
        .eq("user_id", selectedUserId);

      const { data } = await supabase
        .from("chats")
        .select("id,date,type,message,user_id, users(*)")
        .eq("user_id", selectedUserId)
        .order("id", { ascending: false })
        .range(0, PAGE_SIZE - 1);

      if (cancelled) return;

      const chats = ((data || []) as unknown as ChatRowType[]).map(
        normalizeChat,
      );

      const initial = uniqSortByIdDesc(chats);
      setMsgs(initial);

      const fetched = data?.length || 0;
      setOffset(fetched);
      setHasMore((count || 0) > fetched);
      setLoadingMsgs(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedUserId]);

  const handleSelectUser = useCallback(
    (userId: number) => {
      setSelectedUserId(userId);
      markAsRead(userId);
    },
    [markAsRead],
  );

  const loadMore = useCallback(async () => {
    if (!selectedUserId) return;
    if (loadingMoreRef.current) return;
    if (!hasMore) return;

    loadingMoreRef.current = true;
    setLoadingMsgs(true);

    const start = offset;
    const end = offset + PAGE_SIZE - 1;

    const { data } = await supabase
      .from("chats")
      .select("id,date,type,message,user_id, users(*)")
      .eq("user_id", selectedUserId)
      .order("id", { ascending: false })
      .range(start, end);

    const chats = ((data || []) as unknown as ChatRowType[]).map(normalizeChat);

    setMsgs((prev) => uniqSortByIdDesc([...(prev || []), ...chats]));

    const fetched = data?.length || 0;
    setOffset(start + fetched);
    setHasMore(fetched === PAGE_SIZE);

    setLoadingMsgs(false);
    loadingMoreRef.current = false;
  }, [offset, hasMore, selectedUserId]);

  const title = currentGroup?.name || currentGroup?.phone;

  const msgsDisplay = useMemo(() => [...msgs].reverse(), [msgs]);

  return {
    isMobile,
    query,
    setQuery,
    selectedUserId,
    handleSelectUser,
    groups,
    currentGroup,
    title,
    msgsDisplay,
    loadingMsgs,
    hasMore,
    loadMore,
    unreadCounts,
  };
}
