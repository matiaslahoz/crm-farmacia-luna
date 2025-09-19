"use client";

import { formatCurrency } from "@/lib/currency";
import { parsePedido } from "@/lib/pedido";

export default function OrderDrawer({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: {
    id: number;
    date: string;
    total: number;
    pedido: unknown;
    session?: { name: string | null; phone: number | string | null } | null;
  } | null;
}) {
  const items = data ? parsePedido(data.pedido) : [];
  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      <div
        className={`absolute inset-0 bg-black/30 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl border-l border-gray-300
        transition-transform ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-4 border-b border-gray-300 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Pedido #{data?.id}</div>
            <div className="text-xs text-gray-500">
              {data ? new Date(data.date).toLocaleString() : ""}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50"
          >
            Cerrar
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="rounded-xl border border-gray-300 p-3">
            <div className="text-sm font-medium">Cliente</div>
            <div className="text-sm text-gray-600">
              {(data?.session?.name && String(data.session.name)) || "—"}
            </div>
            <div className="text-xs text-gray-500">
              {data?.session?.phone ?? "—"}
            </div>
          </div>

          <div className="rounded-xl border border-gray-300 p-3">
            <div className="text-sm font-medium mb-2">Ítems</div>
            <div className="space-y-2">
              {items.length === 0 && (
                <div className="text-sm text-gray-500">Sin ítems</div>
              )}
              {items.map((it, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="min-w-0">
                    <div className="truncate">{it.name}</div>
                    <div className="text-xs text-gray-500">x{it.qty}</div>
                  </div>
                  <div className="text-right">
                    <div>{formatCurrency(it.unitPrice)}</div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency((it.unitPrice || 0) * (it.qty || 0))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-300 p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Total</div>
              <div className="text-sm">{formatCurrency(data?.total ?? 0)}</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
