// src/app/(app)/pedidos/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import OrdersTable, { type UiOrder } from "@/components/pedidos/OrdersTable";
import OrderDrawer from "@/components/pedidos/OrderDrawer";

const PAGE_SIZE = 50;

type PedidoRowJoined = {
  id: number;
  date: string; // timestamptz
  total: number; // numeric
  pedido: unknown; // json
  session_id: number;
  Session: { name: string | null; phone: number | string | null } | null;
};

function endOfDayISO(d: string): string {
  // Recibe 'YYYY-MM-DD' y devuelve 'YYYY-MM-DDT23:59:59'
  return `${d}T23:59:59`;
}

function filterClient(data: readonly UiOrder[], query: string): UiOrder[] {
  const s = query.trim().toLowerCase();
  if (!s) return [...data];
  return data.filter((r) => {
    const name = (r.session?.name || "").toLowerCase();
    const phone = String(r.session?.phone || "");
    return name.includes(s) || phone.includes(s);
  });
}

export default function PedidosPage() {
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
      .from("Pedido")
      .select(
        "id,date,total,pedido,session_id, Session:session_id (name, phone)"
      )
      .order("date", { ascending: false })
      .range(offset, end);

    if (from) query = query.gte("date", from);
    if (to) query = query.lte("date", endOfDayISO(to));

    const { data, error } = await query.returns<PedidoRowJoined[]>();
    if (error) {
      // si falla, dejamos la lista vacía
      setRows([]);
      setHasNext(false);
      setLoading(false);
      return;
    }

    const mapped: UiOrder[] = (data ?? []).map((d) => ({
      id: d.id,
      date: d.date,
      total: d.total,
      pedido: d.pedido,
      session: d.Session ?? null,
    }));

    setRows(mapped);
    setHasNext((data ?? []).length === PAGE_SIZE);
    setLoading(false);
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, from, to]);

  // re-filtrar en cliente cuando cambia q
  const filteredRows = useMemo(() => filterClient(rows, q), [rows, q]);

  return (
    <div className="h-full flex flex-col min-h-0 gap-4">
      {/* Filtros */}
      <div className="rounded-2xl bg-white border border-gray-200 p-3 sticky top-0 z-10">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={q}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQ(e.target.value)
            }
            placeholder="Buscar cliente/teléfono…"
            className="w-64 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
          />
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600">Desde</label>
            <input
              type="date"
              value={from}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFrom(e.target.value)
              }
              className="rounded-xl border border-gray-200 px-2 py-2 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600">Hasta</label>
            <input
              type="date"
              value={to}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTo(e.target.value)
              }
              className="rounded-xl border border-gray-200 px-2 py-2 text-sm"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => {
                setPage(0);
                void load();
              }}
              className="text-sm cursor-pointer px-3 py-2 rounded-lg border hover:bg-gray-50"
              disabled={loading}
            >
              {loading ? "Cargando…" : "Aplicar"}
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="min-h-0">
        <OrdersTable
          rows={filteredRows}
          onOpen={(row) => {
            setCurrent(row);
            setOpen(true);
          }}
        />
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>Página {page + 1}</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="px-3 py-1.5 rounded-lg cursor-pointer border hover:bg-gray-50 disabled:opacity-50"
            disabled={page === 0 || loading}
          >
            Anterior
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-lg border cursor-pointer hover:bg-gray-50 disabled:opacity-50"
            disabled={!hasNext || loading}
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* Drawer de detalle */}
      <OrderDrawer open={open} onClose={() => setOpen(false)} data={current} />
    </div>
  );
}
