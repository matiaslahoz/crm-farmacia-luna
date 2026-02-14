"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Chat, ChatGroup, Session } from "@/lib/types";
import useUnreadMessages from "@/hooks/useUnreadMessages";
import {
  normalizeChat,
  sessionToGroup,
  uniqSortByIdDesc,
} from "../utils/functions";

const PAGE_SIZE = 50;
const SESSIONS_PAGE_SIZE = 20;

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

export function useChatsPage({ breakpoint = 640 } = {}) {
  const isMobile = useIsMobile(breakpoint);

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  //lista izquierda.
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsOffset, setSessionsOffset] = useState(0);
  const [hasMoreSessions, setHasMoreSessions] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const loadingSessionsRef = useRef(false);

  // Mensajes de la conversación abierta
  const [msgs, setMsgs] = useState<Chat[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const loadingMoreRef = useRef(false);

  const groups: ChatGroup[] = useMemo(() => {
    return sessions.map(sessionToGroup);
  }, [sessions]);

  const { unreadCounts, markAsRead } = useUnreadMessages(groups);

  const currentGroup = useMemo(
    () =>
      selectedUserId
        ? groups.find((g) => g.user_id === selectedUserId)
        : undefined,
    [groups, selectedUserId],
  );

  const title = currentGroup?.name || currentGroup?.phone;

  const msgsDisplay = useMemo(() => [...msgs].reverse(), [msgs]);

  const handleSelectUser = useCallback(
    (userId: number) => {
      setSelectedUserId(userId);
      markAsRead(userId);
    },
    [markAsRead],
  );

  // ✅ Cargar sesiones (lista izquierda) desde RPC
  const loadMoreSessions = useCallback(async () => {
    if (loadingSessionsRef.current) return;
    if (!hasMoreSessions) return;

    loadingSessionsRef.current = true;
    setLoadingSessions(true);

    const isSearching = debouncedQuery.trim().length > 2;

    const { data, error } = await supabase.rpc(
      isSearching ? "sessions_search" : "sessions_list",
      isSearching
        ? {
            p_query: debouncedQuery.trim(),
            p_limit: SESSIONS_PAGE_SIZE,
            p_offset: sessionsOffset,
          }
        : {
            p_limit: SESSIONS_PAGE_SIZE,
            p_offset: sessionsOffset,
          },
    );

    if (error) {
      console.error("Error:", error);
      setLoadingSessions(false);
      loadingSessionsRef.current = false;
      return;
    }

    const rows = (data ?? []) as Session[];
    setSessions((prev) => [...prev, ...rows]);

    setSessionsOffset((prev) => prev + rows.length);
    setHasMoreSessions(rows.length === SESSIONS_PAGE_SIZE);

    setLoadingSessions(false);
    loadingSessionsRef.current = false;
  }, [sessionsOffset, hasMoreSessions, debouncedQuery]);

  // Cargar mensajes iniciales al seleccionar usuario
  const loadCountAndData = useCallback(async () => {
    if (!selectedUserId) {
      setMsgs([]);
      setOffset(0);
      setHasMore(false);
      return;
    }

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

    const chats = ((data || []) as Chat[]).map(normalizeChat);

    const initial = uniqSortByIdDesc(chats);
    setMsgs(initial);

    const fetched = data?.length || 0;
    setOffset(fetched);
    setHasMore((count || 0) > fetched);

    setLoadingMsgs(false);
  }, [selectedUserId]);

  // Paginación de mensajes antiguos (conversación abierta)
  const loadMoreConversation = useCallback(async () => {
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

    const chats = ((data || []) as Chat[]).map(normalizeChat);

    setMsgs((prev) => uniqSortByIdDesc([...(prev || []), ...chats]));

    const fetched = data?.length || 0;
    setOffset(start + fetched);
    setHasMore(fetched === PAGE_SIZE);

    setLoadingMsgs(false);
    loadingMoreRef.current = false;
  }, [offset, hasMore, selectedUserId]);

  useEffect(() => {
    loadCountAndData();
  }, [loadCountAndData]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);

    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();

    if (trimmed.length > 2) {
      // entrar en modo búsqueda
      setSessions([]);
      setSessionsOffset(0);
      setHasMoreSessions(true);
    }

    if (trimmed.length === 0) {
      // volver al modo normal
      setSessions([]);
      setSessionsOffset(0);
      setHasMoreSessions(true);
    }
  }, [debouncedQuery]);

  // Primer load sesiones
  useEffect(() => {
    if (sessionsOffset === 0 && sessions.length === 0) {
      loadMoreSessions();
    }
  }, [loadMoreSessions, sessionsOffset, sessions.length]);

  return {
    isMobile,
    query,
    setQuery,
    selectedUserId,
    handleSelectUser,
    // lista izquierda
    groups,
    loadMoreSessions,
    hasMoreSessions,
    loadingSessions,
    unreadCounts,
    // conversación derecha
    currentGroup,
    title,
    msgsDisplay,
    loadingMsgs,
    hasMore,
    loadMoreConversation,
  };
}
