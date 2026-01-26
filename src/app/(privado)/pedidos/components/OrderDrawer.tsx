"use client";

import { formatCurrency } from "@/lib/currency";
import { parsePedido } from "@/lib/pedido";
import { UiOrder } from "../types/types";

// Generate a consistent color based on the name
function getAvatarColor(name: string): string {
  const colors = [
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-fuchsia-500",
    "bg-rose-500",
  ];
  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
}

export default function OrderDrawer({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: UiOrder | null;
}) {
  const items = data ? parsePedido(data.items) : [];
  const clientName = data?.name || "Cliente";
  const initials = getInitials(clientName);
  const avatarColor = getAvatarColor(clientName);

  const handleSendEmail = () => {
    if (!data) return;
    const subject = encodeURIComponent(
      `Presupuesto Pedido #${data.id} - Farmacia Luna`,
    );
    const itemsList = items
      .map(
        (it) =>
          `- ${it.name} (x${it.qty}): ${formatCurrency(it.unitPrice * it.qty)}`,
      )
      .join("\n");
    const total = formatCurrency(data.total);
    const body = encodeURIComponent(
      `Hola ${data.name || "Cliente"},\n\nAquí tienes el detalle de tu pedido:\n\n${itemsList}\n\nTotal: ${total}\n\nSaludos,\nEl Albañil`,
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className={`relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${open ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
        >
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-purple-600 via-violet-500 to-cyan-400 p-5 text-white relative">
            <h2 className="text-xl font-bold">Pedido #{data?.id}</h2>
            <div className="flex items-center gap-1.5 text-white/90 text-sm mt-1">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {data ? formatDateTime(data.created_at) : ""}
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition-colors cursor-pointer"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-5 space-y-4">
            {/* Client Info */}
            <div className="border-l-4 border-purple-500 bg-gray-50 rounded-r-xl p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Información del Cliente
              </div>
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
                  <div className="flex items-center gap-1 text-sm text-gray-500">
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
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {data?.phone ?? "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-gray-500 uppercase tracking-wider">
                  Artículos del Pedido
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
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
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  {items.length} artículos
                </div>
              </div>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {items.length === 0 && (
                  <div className="text-sm text-gray-500 text-center py-2">
                    Sin artículos
                  </div>
                )}
                {items.map((it, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 truncate pr-2">
                        {it.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(it.unitPrice)} × {it.qty}
                      </div>
                    </div>
                    <div className="font-semibold text-gray-900 flex-shrink-0">
                      {formatCurrency((it.unitPrice || 0) * (it.qty || 0))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 pb-5 pt-2">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs text-gray-500">Total del Pedido</div>
                <div className="text-3xl font-bold text-purple-600">
                  {formatCurrency(data?.total ?? 0)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSendEmail}
                  className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
                  title="Enviar por email"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
