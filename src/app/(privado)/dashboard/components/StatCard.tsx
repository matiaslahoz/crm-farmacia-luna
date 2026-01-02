import { ReactNode } from "react";

export default function StatCard({
  title,
  value,
  hint,
  icon,
  accentClass = "bg-blue-100 text-blue-700",
}: {
  title: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  accentClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 flex items-center gap-4">
      {icon && (
        <div
          className={`inline-flex items-center justify-center h-10 w-10 rounded-xl ${accentClass}`}
        >
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-semibold text-gray-900 truncate">
          {value}
        </div>
        {hint && <div className="text-xs text-gray-500 mt-0.5">{hint}</div>}
      </div>
    </div>
  );
}
