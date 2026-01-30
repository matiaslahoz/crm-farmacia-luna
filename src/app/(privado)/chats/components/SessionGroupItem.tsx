import { formatChatDate } from "@/lib/dates";
import { truncate } from "../utils/functions";
import SessionAvatar from "./SessionAvatar";
import type { ChatGroup } from "@/lib/types";

export default function SessionGroupItem({
  g,
  active,
  onSelect,
  unreadCount = 0,
}: {
  g: ChatGroup;
  active: boolean;
  onSelect: (userId: number) => void;
  unreadCount?: number;
}) {
  return (
    <button
      onClick={() => onSelect(g.user_id)}
      className={`group relative w-full flex cursor-pointer items-center gap-3 px-4 py-3 text-left transition-all duration-200
                  ${
                    active
                      ? "bg-blue-50/50 before:absolute before:left-0 before:top-3 before:bottom-3 before:w-1 before:bg-blue-500 before:rounded-r-full"
                      : "hover:bg-gray-50"
                  }
                  ${g.hasPendingOrder ? "border-l-4 border-l-yellow-400 !px-[13px]" : ""}
                  `}
    >
      <div className="relative shrink-0">
        <SessionAvatar
          name={g.name}
          phone={g.phone ?? g.user_id.toString()}
          size={42}
        />
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`truncate text-sm font-semibold ${active ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900"}`}
          >
            {g.name || g.phone || "Usuario " + g.user_id}
          </span>
          {g.hasPendingOrder ? (
            <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200 animate-pulse">
              Pedido pendiente
            </span>
          ) : (
            g.chats.length > 0 && (
              <span className="text-[10px] text-gray-400 tabular-nums">
                {formatChatDate(g.latest?.date)}
              </span>
            )
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <div
            className={`text-xs truncate max-w-[85%] ${active ? "text-gray-600" : "text-gray-500 group-hover:text-gray-600"}`}
          >
            {truncate(g.latest.message ?? "Mensaje multimedia")}
          </div>
          {unreadCount > 0 && (
            <span className="shrink-0 flex items-center justify-center min-w-[20px] h-[20px] px-1 text-[11px] font-bold rounded-full bg-green-500 text-white shadow-sm">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
