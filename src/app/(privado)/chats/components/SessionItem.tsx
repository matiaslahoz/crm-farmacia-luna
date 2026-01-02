import SessionAvatar from "./SessionAvatar";
import type { Session } from "@/lib/types";

export default function SessionItem({
  s,
  active,
  onSelect,
}: {
  s: Session;
  active: boolean;
  onSelect: (id: number) => void;
}) {
  return (
    <button
      onClick={() => onSelect(s.id)}
      className={`w-full flex items-center cursor-pointer gap-3 px-3 py-3 text-left hover:bg-gray-50 ${
        active ? "bg-gray-50" : ""
      }`}
    >
      <SessionAvatar name={s.name} phone={s.phone} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="truncate font-medium">{s.name || s.phone}</div>
          {s.requires_human ? (
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
              Derivar
            </span>
          ) : (
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
              IA
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500">
          Estado: {s.status || "—"} · {new Date(s.date).toLocaleDateString()}
        </div>
      </div>
    </button>
  );
}
