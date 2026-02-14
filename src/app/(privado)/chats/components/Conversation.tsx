"use client";

import { useEffect, useRef, useMemo } from "react";
import type { Chat } from "@/lib/types";
import { fmtTime, getConversationDateLabel } from "@/lib/dates";
import ConversationHeader from "./ConversationHeader";
import MessageBubble from "./MessageBubble";

export default function Conversation({
  title,
  phone,
  msgs,
  loading,
  hasMore,
  onLoadMoreConversation,
  onBack,
}: {
  title?: string | null;
  phone?: number | string | null;
  msgs: Chat[];
  loading: boolean;
  hasMore: boolean;
  onLoadMoreConversation: () => void;
  onBack?: () => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);

  const groupedMsgs = useMemo(() => {
    const groups: { label: string; msgs: Chat[] }[] = [];
    msgs.forEach((m) => {
      const label = getConversationDateLabel(m.date);
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.label === label) {
        lastGroup.msgs.push(m);
      } else {
        groups.push({ label, msgs: [m] });
      }
    });
    return groups;
  }, [msgs]);

  useEffect(() => {
    if (nearBottomRef.current)
      bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, [msgs.length, loading]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const onScroll = () => {
      nearBottomRef.current =
        el.scrollHeight - el.scrollTop - el.clientHeight < 100;
      if (el.scrollTop < 60 && hasMore && !loading) {
        const prevHeight = el.scrollHeight;
        onLoadMoreConversation();
        setTimeout(() => {
          const newHeight = el.scrollHeight;
          el.scrollTop = newHeight - prevHeight;
        }, 0);
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [hasMore, loading, onLoadMoreConversation]);

  const hasSelection = !!title;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white/50 backdrop-blur-sm relative">
      <ConversationHeader title={title} phone={phone} onBack={onBack} />

      <div
        ref={listRef}
        className="flex-1 overflow-auto px-4 py-6 space-y-4 bg-slate-50 relative scroll-smooth"
      >
        {!hasSelection && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
              <span className="text-3xl">💬</span>
            </div>
            <p className="text-sm font-medium">
              Seleccioná una conversación para comenzar
            </p>
          </div>
        )}

        {hasSelection && hasMore && (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        )}

        {hasSelection &&
          groupedMsgs.map((group) => (
            <div key={group.label} className="relative">
              <div className="sticky top-2 z-10 flex justify-center py-4 pointer-events-none">
                <span className="bg-gray-200/80 backdrop-blur-md text-gray-600 text-xs font-medium px-3 py-1 rounded-full shadow-sm border border-white/50">
                  {group.label}
                </span>
              </div>
              <div className="flex flex-col space-y-4">
                {group.msgs.map((m) => (
                  <MessageBubble
                    key={m.id}
                    own={m.type === "ia"}
                    text={m.message ?? ""}
                    time={fmtTime(m.date)}
                  />
                ))}
              </div>
            </div>
          ))}

        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <div className="relative flex items-center gap-2">
          <div className="flex-1 bg-gray-100/70 hover:bg-gray-100 transition-colors rounded-2xl flex items-center px-4 py-2 border border-transparent focus-within:border-gray-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-[var(--primary)]/10">
            <input
              disabled
              placeholder="Escribí un mensaje..."
              className="w-full bg-transparent border-none text-sm focus:ring-0 placeholder:text-gray-400 text-gray-700 disabled:cursor-not-allowed"
            />
          </div>
          <button
            disabled
            className="p-3 rounded-full bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:shadow-none disabled:translate-y-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
