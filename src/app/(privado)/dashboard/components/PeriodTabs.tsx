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
    <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1">
      {options.map((opt) => {
        const active = period === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={`px-3 py-1.5 text-sm cursor-pointer rounded-lg ${
              active
                ? "bg-gray-900 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
