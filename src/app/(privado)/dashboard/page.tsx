"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Session } from "@/lib/types";
import PeriodTabs, { Period } from "./components/PeriodTabs";
import ConversationsChart, {
  ChartPoint,
} from "./components/ConversationsChart";
import StatsGrid from "./components/StatsGrid";
import { LayoutGrid } from "lucide-react";

type SessionRow = {
  id: number;
  date: string;
  phone: string | number | null;
  requires_human: boolean | null;
  name: string | null;
  status: string | null;
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function isSameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}
function formatDay(d: Date) {
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit" });
}
function formatMonth(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
}
function formatYear(d: Date) {
  return d.getFullYear().toString();
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>("day");

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [todayConvos, setTodayConvos] = useState(0);
  const [newNumbersToday, setNewNumbersToday] = useState(0);
  const [needsHuman, setNeedsHuman] = useState(0);
  const [ordersToday, setOrdersToday] = useState(0);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);

      const today = new Date();
      const oneYearAgo = new Date(today);
      oneYearAgo.setDate(today.getDate() - 365);

      const { data, error } = await supabase
        .from("sessions")
        .select("id,date,phone,requires_human,name,status")
        .gte("date", oneYearAgo.toISOString())
        .order("date", { ascending: true })
        .overrideTypes<SessionRow[], { merge: false }>();

      if (!mounted) return;

      if (error) {
        setSessions([]);
        setLoading(false);
        return;
      }

      const sess: Session[] = (data ?? []).map((r) => ({
        id: r.id,
        date: r.date,
        phone: r.phone,
        requires_human: !!r.requires_human,
        name: r.name,
        status: r.status,
      }));

      setSessions(sess);
      setLoading(false);

      // rápidas:
      const start = startOfDay(today).toISOString();
      const end = endOfDay(today).toISOString();

      // 1) hoy: conversaciones (= sesiones de hoy)
      const todayCount = sess.filter((s) =>
        isSameDay(new Date(s.date), today),
      ).length;
      setTodayConvos(todayCount);

      // 2) números nuevos hoy: primer sesión por phone es hoy
      const firstByPhone = new Map<string, Date>();
      for (const s of sess) {
        const phone = String(s.phone ?? "");
        const d = new Date(s.date);
        const prev = firstByPhone.get(phone);
        if (!prev || d < prev) firstByPhone.set(phone, d);
      }
      setNewNumbersToday(
        Array.from(firstByPhone.values()).filter((d) => isSameDay(d, today))
          .length,
      );

      // 3) requieren acción: cantidad de teléfonos con alguna sesión derivada
      const needs = new Set<string>();
      for (const s of sess) {
        if (s.requires_human) needs.add(String(s.phone ?? ""));
      }
      setNeedsHuman(needs.size);

      // 4) pedidos de hoy (count exact HEAD)
      const { count: ordersCount } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .gte("created_at", start)
        .lte("created_at", end);
      setOrdersToday(ordersCount ?? 0);

      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Buckets para el chart
  const chartData: ChartPoint[] = useMemo(() => {
    if (!sessions.length) return [];

    const now = new Date();
    const points: ChartPoint[] = [];

    if (period === "day") {
      // últimos 30 días
      for (let i = 29; i >= 0; i--) {
        const d = startOfDay(addDays(now, -i));
        const next = addDays(d, 1);
        const count = sessions.filter((s) => {
          const sd = new Date(s.date);
          return sd >= d && sd < next;
        }).length;
        points.push({ label: formatDay(d), value: count });
      }
    } else if (period === "week") {
      // últimas 12 semanas (cada bucket = 7 días)
      let start = startOfDay(addDays(now, -7 * 11));
      for (let i = 0; i < 12; i++) {
        const end = addDays(start, 7);
        const count = sessions.filter((s) => {
          const sd = new Date(s.date);
          return sd >= start && sd < end;
        }).length;
        points.push({
          label: `${formatDay(start)}–${formatDay(addDays(end, -1))}`,
          value: count,
        });
        start = end;
      }
    } else if (period === "month") {
      // últimos 12 meses (aprox: bordes por día 1 y siguiente mes)
      const base = new Date(now.getFullYear(), now.getMonth(), 1);
      for (let i = 11; i >= 0; i--) {
        const mStart = new Date(base.getFullYear(), base.getMonth() - i, 1);
        const mEnd = new Date(mStart.getFullYear(), mStart.getMonth() + 1, 1);
        const count = sessions.filter((s) => {
          const sd = new Date(s.date);
          return sd >= mStart && sd < mEnd;
        }).length;
        points.push({ label: formatMonth(mStart), value: count });
      }
    } else {
      // últimos 5 años (por año calendario)
      const year = now.getFullYear();
      for (let y = year - 4; y <= year; y++) {
        const yStart = new Date(y, 0, 1);
        const yEnd = new Date(y + 1, 0, 1);
        const count = sessions.filter((s) => {
          const sd = new Date(s.date);
          return sd >= yStart && sd < yEnd;
        }).length;
        points.push({ label: formatYear(yStart), value: count });
      }
    }

    return points;
  }, [sessions, period]);

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto pr-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
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
        <div className="w-full sm:w-auto">
          <PeriodTabs period={period} onChange={setPeriod} />
        </div>
      </div>

      <StatsGrid
        todayConvos={todayConvos}
        newNumbersToday={newNumbersToday}
        needsHuman={needsHuman}
        ordersToday={ordersToday}
      />

      <ConversationsChart
        data={chartData}
        title={`Conversaciones por ${period === "day" ? "día" : period === "week" ? "semana" : period === "month" ? "mes" : "año"}`}
      />

      {loading && (
        <div className="text-sm text-gray-500">Cargando estadísticas…</div>
      )}
    </div>
  );
}
