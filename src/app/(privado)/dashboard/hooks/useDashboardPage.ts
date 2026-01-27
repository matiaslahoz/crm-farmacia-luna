import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { formatDayLabel, formatMonthLabel } from "@/lib/format";
import type {
  Period,
  SessionsCardsRow,
  SessionsChartRow,
  ChartPoint,
} from "@/app/(privado)/dashboard/types/types";
import { addDays, endOfDay, localDateKey, startOfDay } from "@/lib/dates";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

export default function useDashboardPage(period: Period) {
  const [loading, setLoading] = useState(false);

  const [todayConvos, setTodayConvos] = useState(0);
  const [newNumbersToday, setNewNumbersToday] = useState(0);
  const [needsHuman, setNeedsHuman] = useState(0);
  const [ordersToday, setOrdersToday] = useState(0);

  const [chartData, setChartData] = useState<ChartPoint[]>([]);

  const chartRange = useMemo(() => {
    const now = new Date();
    let from: Date;

    if (period === "day") from = startOfDay(addDays(now, -29));
    else if (period === "week") from = startOfDay(addDays(now, -7 * 11));
    else if (period === "month")
      from = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    else from = new Date(now.getFullYear() - 4, 0, 1);

    return {
      now,
      fromISO: from.toISOString(),
      toISO: endOfDay(now).toISOString(),
    };
  }, [period]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);

      const today = new Date();
      const todayStr = localDateKey(today);

      const { data: cardsData, error: cardsErr } = await supabase.rpc(
        "sessions_cards",
        { p_day: todayStr },
      );

      if (!mounted) return;

      if (cardsErr) {
        setTodayConvos(0);
        setNewNumbersToday(0);
        setNeedsHuman(0);
      } else {
        const row = (cardsData as SessionsCardsRow[] | null)?.[0];
        setTodayConvos(Number(row?.today_convos ?? 0));
        setNewNumbersToday(Number(row?.new_numbers_today ?? 0));
        setNeedsHuman(Number(row?.requires_human ?? 0));
        setOrdersToday(Number(row?.orders_today ?? 0));
      }
      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);

      const { data, error } = await supabase.rpc("sessions_chart", {
        p_from: chartRange.fromISO,
        p_to: chartRange.toISO,
        p_period: period,
      });

      if (!mounted) return;

      if (error) {
        setChartData([]);
        setLoading(false);
        return;
      }

      const rows = (data as SessionsChartRow[] | null) ?? [];

      if (period === "day") {
        const map = new Map<number, number>();
        const buckets = rows
          .map((r) => ({
            t: new Date(r.bucket).getTime(),
            v: Number(r.value ?? 0),
          }))
          .sort((a, b) => a.t - b.t);

        for (const b of buckets) map.set(b.t, b.v);

        const last =
          buckets[buckets.length - 1]?.t ??
          new Date(chartRange.toISO).getTime();
        const filled: ChartPoint[] = [];

        for (let i = 29; i >= 0; i--) {
          const t = last - i * DAY_MS;
          const d = new Date(t);
          filled.push({ label: formatDayLabel(d), value: map.get(t) ?? 0 });
        }

        setChartData(filled);
      } else if (period === "week") {
        const map = new Map<number, number>();
        const buckets = rows
          .map((r) => ({
            t: new Date(r.bucket).getTime(),
            v: Number(r.value ?? 0),
          }))
          .sort((a, b) => a.t - b.t);

        for (const b of buckets) map.set(b.t, b.v);

        const last =
          buckets[buckets.length - 1]?.t ??
          new Date(chartRange.toISO).getTime();
        const filled: ChartPoint[] = [];

        for (let i = 11; i >= 0; i--) {
          const t = last - i * WEEK_MS;
          const start = new Date(t);
          const end = addDays(start, 6);
          filled.push({
            label: `${formatDayLabel(start)}–${formatDayLabel(end)}`,
            value: map.get(t) ?? 0,
          });
        }

        setChartData(filled);
      } else if (period === "month") {
        const map = new Map<number, number>();
        for (const r of rows) {
          map.set(new Date(r.bucket).getTime(), Number(r.value ?? 0));
        }

        const filled: ChartPoint[] = [];
        const base = new Date(
          chartRange.now.getFullYear(),
          chartRange.now.getMonth(),
          1,
        );

        for (let i = 11; i >= 0; i--) {
          const mStart = new Date(base.getFullYear(), base.getMonth() - i, 1);
          const key = mStart.getTime();
          filled.push({
            label: formatMonthLabel(mStart),
            value: map.get(key) ?? 0,
          });
        }

        setChartData(filled);
      } else {
        const map = new Map<string, number>();
        for (const r of rows) {
          const y = String(new Date(r.bucket).getFullYear());
          map.set(y, Number(r.value ?? 0));
        }

        const filled: ChartPoint[] = [];
        const year = chartRange.now.getFullYear();

        for (let y = year - 4; y <= year; y++) {
          filled.push({ label: String(y), value: map.get(String(y)) ?? 0 });
        }

        setChartData(filled);
      }

      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [period, chartRange.fromISO, chartRange.toISO]);

  return {
    loading,
    todayConvos,
    newNumbersToday,
    needsHuman,
    chartData,
    ordersToday,
  };
}
