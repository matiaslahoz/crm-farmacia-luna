import SessionAvatar from "./SessionAvatar";
import type { SessionGroup } from "@/lib/groupByPhone";
import { AlertTriangle } from "lucide-react";
import { truncate } from "../utils/functions";

export default function SessionGroupItem({
  g,
  active,
  onSelect,
  unread = 0,
  preview = null,
  needsHuman = false,
}: {
  g: SessionGroup;
  active: boolean;
  onSelect: (phone: string) => void;
  unread?: number;
  preview?: { text: string; date: string } | null;
  needsHuman?: boolean;
}) {
  return (
    <button
      onClick={() => onSelect(g.phone)}
      className={`relative w-full flex cursor-pointer items-center gap-3 px-3 py-3 text-left hover:bg-gray-50
                  border-l-4 ${needsHuman ? "border-amber-500" : "border-transparent"}
                  ${active ? "bg-gray-50" : ""}`}
      title={needsHuman ? "Requiere intervención humana" : undefined}
    >
      <div className="relative">
        <SessionAvatar name={g.name} phone={g.phone} />
        {needsHuman && (
          <span className="absolute -left-1 -top-1 bg-amber-500 text-white rounded-full p-0.5">
            <AlertTriangle className="size-3" />
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="truncate font-medium">{g.name || g.phone}</div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
            {g.sessions.length}×
          </span>
          {unread > 0 && (
            <span className="ml-auto inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-blue-600 text-white text-[10px] font-semibold">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </div>
        <div className="text-xs text-gray-600 mt-1 truncate">
          {preview ? truncate(preview.text) : "—"}
        </div>
      </div>
    </button>
  );
}
