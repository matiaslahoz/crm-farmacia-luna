"use client";

import { useEffect, useRef } from "react";
import type { Chat } from "@/lib/types";
import ConversationHeader from "./ConversationHeader";
import MessageBubble from "./MessageBubble";

import { fmtTime, fmtDateAr } from "@/lib/dates";

export default function Conversation({
  title,
  phone,
  meta,
  msgs,
  loading,
  hasMore,
  onLoadMore,
  onBack,
}: {
  title?: string | null;
  phone?: number | string | null;
  meta?: string;
  msgs: Chat[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onBack?: () => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);

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
        onLoadMore();
        // mantener posición visual tras prepending
        setTimeout(() => {
          const newHeight = el.scrollHeight;
          el.scrollTop = newHeight - prevHeight;
        }, 0);
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [hasMore, loading, onLoadMore]);

  const hasSelection = !!title;

  return (
    <div className="rounded-2xl bg-white border border-gray-200 flex flex-col h-full overflow-hidden min-h-0">
      <ConversationHeader
        title={title}
        phone={phone}
        meta={meta}
        onBack={onBack}
      />

      <div
        ref={listRef}
        className="flex-1 overflow-auto px-3 py-4 space-y-2 bg-[#efeae2]"
      >
        {!hasSelection && (
          <div className="text-center text-gray-500 text-sm mt-20">
            Elegí una sesión de la izquierda.
          </div>
        )}

        {hasSelection && hasMore && (
          <div className="text-center text-xs text-gray-500 my-2">
            Deslizá hacia arriba para cargar más…
          </div>
        )}

        {hasSelection &&
          msgs.map((m) => (
            <MessageBubble
              key={m.id}
              own={m.type === "ia"}
              text={m.message}
              time={fmtTime(m.date)}
              date={fmtDateAr(m.date)}
            />
          ))}

        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-gray-200">
        <input
          disabled
          placeholder="Escribí un mensaje (solo lectura por ahora)…"
          className="w-full rounded-full border border-gray-200 px-4 py-2.5 text-sm bg-gray-50 text-gray-400"
        />
      </div>
    </div>
  );
}
