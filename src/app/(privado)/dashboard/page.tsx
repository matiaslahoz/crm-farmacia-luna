"use client";

import ConversationsChart from "./components/ConversationsChart";
import StatsGrid from "./components/StatsGrid";
import useDashboardPage from "./hooks/useDashboardPage";
import { useState } from "react";
import { Period } from "./types/types";
import PeriodTabs from "./components/PeriodTabs";
import { LayoutGrid } from "lucide-react";

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>("day");

  const {
    todayConvos,
    newNumbersToday,
    needsHuman,
    ordersToday,
    chartData,
    loading,
  } = useDashboardPage(period);

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg shadow-purple-500/20 text-white">
            <LayoutGrid className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Panel de control y seguimiento
            </p>
          </div>
        </div>
        <PeriodTabs period={period} onChange={setPeriod} />
      </div>
      <StatsGrid
        todayConvos={todayConvos}
        newNumbersToday={newNumbersToday}
        needsHuman={needsHuman}
        ordersToday={ordersToday}
      />
      <ConversationsChart
        data={chartData}
        title={`Conversaciones por ${
          period === "day"
            ? "día"
            : period === "week"
              ? "semana"
              : period === "month"
                ? "mes"
                : "año"
        }`}
      />
      {loading && (
        <div className="text-sm text-gray-500">Cargando estadísticas…</div>
      )}
    </div>
  );
}
