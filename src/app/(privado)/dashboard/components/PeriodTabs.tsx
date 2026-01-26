export type Period = "day" | "week" | "month" | "year";

const options: { key: Period; label: string }[] = [
  { key: "day", label: "Días" },
  { key: "week", label: "Semanas" },
  { key: "month", label: "Meses" },
  { key: "year", label: "Años" },
];

export default function PeriodTabs({
  period,
  onChange,
}: {
  period: Period;
  onChange: (p: Period) => void;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-white p-1.5 shadow-sm border border-slate-200/60">
      {options.map((opt) => {
        const active = period === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={`px-4 py-1.5 text-sm font-medium transition-all duration-200 rounded-full ${
              active
                ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-md shadow-purple-500/25"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
