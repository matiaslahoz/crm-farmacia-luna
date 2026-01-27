import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { PedidoRowJoined, UiOrder } from "../types/types";
import { filterClient } from "../utils/functions";
import { endOfDayISO } from "@/lib/dates";

const PAGE_SIZE = 50;

export function usePedidosPage() {
  const [rows, setRows] = useState<UiOrder[]>([]);
  const [page, setPage] = useState(0);
  const [q, setQ] = useState("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(false);

  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<UiOrder | null>(null);

  async function load() {
    setLoading(true);
    const offset = page * PAGE_SIZE;
    const end = offset + PAGE_SIZE - 1;

    let query = supabase
      .from("orders_crm")
      .select("id,created_at,total,items,name, phone")
      .order("created_at", { ascending: false })
      .range(offset, end);

    if (from) query = query.gte("created_at", from);
    if (to) query = query.lte("created_at", endOfDayISO(to));

    const { data, error } = await query.returns<PedidoRowJoined[]>();
    if (error) {
      setRows([]);
      setHasNext(false);
      setLoading(false);
      return;
    }
    const mapped: UiOrder[] = (data ?? []).map((d) => ({
      id: d.id,
      created_at: d.created_at,
      total: d.total,
      items: d.items,
      name: d.name ?? null,
      phone: d.phone ?? null,
    }));

    setRows(mapped);
    setHasNext((data ?? []).length === PAGE_SIZE);
    setLoading(false);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, from, to]);

  const filteredRows = useMemo(() => filterClient(rows, q), [rows, q]);

  return {
    filteredRows,
    page,
    setPage,
    q,
    setQ,
    from,
    setFrom,
    to,
    setTo,
    loading,
    hasNext,
    open,
    setOpen,
    current,
    setCurrent,
    load,
  };
}
