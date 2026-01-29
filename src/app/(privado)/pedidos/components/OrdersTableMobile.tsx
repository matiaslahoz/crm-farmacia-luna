import { countItems, parsePedido } from "@/lib/pedido";
import { UiOrder } from "../types/types";
import {
  formatRelativeDate,
  getAvatarColor,
  getInitials,
} from "../utils/functions";
import { formatCurrency } from "@/lib/currency";

export function MobileTable({
  rows,
  onOpen,
  updateStatus,
}: {
  rows: UiOrder[];
  onOpen: (row: UiOrder) => void;
  updateStatus: (id: number, status: string) => void;
}) {
  return (
    <div className="md:hidden space-y-4">
      {rows.map((r) => {
        const items = parsePedido(r.items);
        const itemCount = countItems(items);
        const clientName = r.name || "Cliente";
        const initials = getInitials(clientName);
        const avatarColor = getAvatarColor(clientName);

        return (
          <div
            key={r.id}
            className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm"
          >
            {/* Header: Avatar, Name, Phone, Status */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center text-white text-sm font-semibold flex-shrink-0`}
                >
                  {initials}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {clientName}
                  </div>
                  <div className="text-sm text-gray-500">{r.phone || "—"}</div>
                </div>
              </div>

              <div
                className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-lg border border-gray-200/60 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Pendiente */}
                <button
                  onClick={() => updateStatus(r.id, "PENDING")}
                  className={`
                    w-6 h-6 rounded flex items-center justify-center transition-all
                    ${
                      (r.status || "PENDING") === "PENDING"
                        ? "bg-yellow-100 text-yellow-700 shadow-sm ring-1 ring-yellow-200"
                        : "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"
                    }
                  `}
                  title="Pendiente"
                >
                  <span className="text-[10px] font-bold">P</span>
                </button>

                {/* Completado */}
                <button
                  onClick={() => updateStatus(r.id, "COMPLETED")}
                  className={`
                    w-6 h-6 rounded flex items-center justify-center transition-all
                    ${
                      r.status === "COMPLETED"
                        ? "bg-green-100 text-green-700 shadow-sm ring-1 ring-green-200"
                        : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                    }
                  `}
                  title="Confirmado"
                >
                  <span className="text-[10px] font-bold">C</span>
                </button>

                {/* Cancelado */}
                <button
                  onClick={() => updateStatus(r.id, "CANCELLED")}
                  className={`
                    w-6 h-6 rounded flex items-center justify-center transition-all
                    ${
                      r.status === "CANCELLED"
                        ? "bg-red-100 text-red-700 shadow-sm ring-1 ring-red-200"
                        : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                    }
                  `}
                  title="Cancelado"
                >
                  <span className="text-[10px] font-bold">X</span>
                </button>
              </div>
            </div>

            {/* Order ID and Date */}
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span>#{r.id}</span>
              <div className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {formatRelativeDate(r.created_at)}
              </div>
            </div>

            {/* Stats Row: Articles and Total */}
            <div className="flex gap-3 mb-4">
              <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3">
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  Artículos
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {itemCount}
                </div>
              </div>
              <div className="flex-1 bg-purple-50 rounded-xl px-4 py-3 border border-purple-100">
                <div className="text-xs text-gray-500 mb-1">Total</div>
                <div className="text-lg font-bold text-purple-600">
                  {formatCurrency(r.total)}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => onOpen(r)}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 transition-all shadow-sm"
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
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              Ver Detalles
            </button>
          </div>
        );
      })}
      {rows.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500">
          No hay pedidos.
        </div>
      )}
    </div>
  );
}
