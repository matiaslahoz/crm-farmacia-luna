"use client";

import OrdersTable from "@/app/(privado)/pedidos/components/OrdersTable";
import OrderDrawer from "@/app/(privado)/pedidos/components/OrderDrawer";
import { usePedidosPage } from "./hooks/usePedidosPage";
import DesktopFilters from "./components/DesktopFilters";
import MobileFilters from "./components/MobileFilters";

export default function PedidosPage() {
  const {
    filteredRows,
    page,
    setPage,
    q,
    setQ,
    from,
    to,
    setFrom,
    setTo,
    loading,
    load,
    setCurrent,
    setOpen,
    current,
    hasNext,
    open,
  } = usePedidosPage();

  return (
    <div className="h-full flex flex-col min-h-0 gap-4">
      <div className="rounded-2xl bg-white border border-gray-200 p-4 sticky top-0 z-10">
        <DesktopFilters
          q={q}
          setQ={setQ}
          from={from}
          setFrom={setFrom}
          to={to}
          setTo={setTo}
          loading={loading}
          onApply={() => {
            setPage(0);
            void load();
          }}
        />

        <MobileFilters
          q={q}
          setQ={setQ}
          from={from}
          setFrom={setFrom}
          to={to}
          setTo={setTo}
          loading={loading}
          onApply={() => {
            setPage(0);
            void load();
          }}
        />
      </div>

      {/* Tabla / Cards */}
      <div className="min-h-0 flex-1 overflow-auto">
        <OrdersTable
          rows={filteredRows}
          onOpen={(row) => {
            setCurrent(row);
            setOpen(true);
          }}
        />
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between text-sm text-gray-600 flex-shrink-0">
        <div className="text-gray-500">Página {page + 1}</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="px-4 py-2 rounded-xl cursor-pointer border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-1.5"
            disabled={page === 0 || loading}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="hidden sm:inline">Anterior</span>
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-1.5"
            disabled={!hasNext || loading}
          >
            <span className="hidden sm:inline">Siguiente</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Modal de detalle */}
      <OrderDrawer open={open} onClose={() => setOpen(false)} data={current} />
    </div>
  );
}
