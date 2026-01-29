import { UiOrder } from "../types/types";
import {
  getInitials,
  getAvatarColor,
  formatRelativeDate,
} from "../utils/functions";
import { parsePedido, countItems } from "@/lib/pedido";
import { formatCurrency } from "@/lib/currency";
import { User } from "lucide-react";

export default function DesktopTable({
  rows,
  onOpen,
  updateStatus,
}: {
  rows: UiOrder[];
  onOpen: (row: UiOrder) => void;
  updateStatus: (id: number, status: string) => void;
}) {
  return (
    <div className="hidden md:block rounded-2xl bg-white border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3 text-left font-medium">ID Pedido</th>
            <th className="px-4 py-3 text-left font-medium">Cliente</th>
            <th className="px-4 py-3 text-left font-medium">Teléfono</th>
            <th className="px-4 py-3 text-left font-medium">Fecha</th>
            <th className="px-4 py-3 text-left font-medium">Estado</th>
            <th className="px-4 py-3 text-center font-medium">Artículos</th>
            <th className="px-4 py-3 text-right font-medium">Total</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((r) => {
            const items = parsePedido(r.items);
            const clientName = r.name || "Cliente";
            const initials = getInitials(clientName);
            const avatarColor = getAvatarColor(clientName);

            return (
              <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-3 text-gray-500 font-medium">#{r.id}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}
                    >
                      {initials}
                    </div>
                    <span className="font-medium text-gray-900">
                      {r.name || "—"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{r.phone || "—"}</td>
                <td className="px-4 py-3 text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {formatRelativeDate(r.created_at)}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div
                    className="flex items-center justify-center gap-1 bg-gray-100/50 p-1 rounded-lg border border-gray-200/60 w-fit mx-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Pendiente */}
                    <button
                      onClick={() => updateStatus(r.id, "PENDING")}
                      className={`
                        px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all
                        ${
                          (r.status || "PENDING") === "PENDING"
                            ? "bg-yellow-100 text-yellow-700 shadow-sm ring-1 ring-yellow-200"
                            : "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"
                        }
                      `}
                      title="Pendiente"
                    >
                      Pendiente
                    </button>

                    {/* Completado */}
                    <button
                      onClick={() => updateStatus(r.id, "COMPLETED")}
                      className={`
                        px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all
                        ${
                          r.status === "COMPLETED"
                            ? "bg-green-100 text-green-700 shadow-sm ring-1 ring-green-200"
                            : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                        }
                      `}
                      title="Confirmado"
                    >
                      Confirmado
                    </button>

                    {/* Cancelado */}
                    <button
                      onClick={() => updateStatus(r.id, "CANCELLED")}
                      className={`
                        px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all
                        ${
                          r.status === "CANCELLED"
                            ? "bg-red-100 text-red-700 shadow-sm ring-1 ring-red-200"
                            : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                        }
                      `}
                      title="Cancelado"
                    >
                      Cancelado
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-gray-600">
                  {countItems(items)}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                  {formatCurrency(r.total)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onOpen(r)}
                    className="px-4 py-1.5 text-xs font-medium text-white rounded-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 transition-all shadow-sm hover:shadow-md"
                  >
                    Ver
                  </button>
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-12 text-center">
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <span>No hay pedidos para mostrar</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
