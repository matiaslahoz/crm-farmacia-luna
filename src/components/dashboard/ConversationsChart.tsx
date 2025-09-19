import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export type ChartPoint = { label: string; value: number };

export default function ConversationsChart({
  data,
  title = "Conversaciones",
}: {
  data: ChartPoint[];
  title?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="mb-3 text-sm font-medium text-gray-700">{title}</div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ left: 8, right: 8, top: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="convograd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} width={28} tick={{ fontSize: 12 }} />
            <Tooltip
              cursor={{ stroke: "#ddd" }}
              contentStyle={{ borderRadius: 12, borderColor: "#e5e7eb" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#2563eb"
              strokeWidth={2}
              fill="url(#convograd)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
