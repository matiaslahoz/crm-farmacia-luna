import { formatCurrency } from "@/lib/currency";
import { parsePedido, countItems } from "@/lib/pedido";

export type UiOrder = {
  id: number;
  created_at: string;
  total: number;
  items: unknown;
  name: string | null;
  phone: number | string | null;
};

export default function OrdersTable({
  rows,
  onOpen,
}: {
  rows: UiOrder[];
  onOpen: (row: UiOrder) => void;
}) {
  return (
    <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            <th className="px-3 py-2 text-left">Cliente</th>
            <th className="px-3 py-2 text-left">Teléfono</th>
            <th className="px-3 py-2 text-left">Fecha</th>
            <th className="px-3 py-2 text-right">Ítems</th>
            <th className="px-3 py-2 text-right">Total</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const items = parsePedido(r.items);
            return (
              <tr
                key={r.id}
                className="border-t border-gray-200 hover:bg-gray-50"
              >
                <td className="px-3 py-2">{r.name || "—"}</td>
                <td className="px-3 py-2">{r.phone || "—"}</td>
                <td className="px-3 py-2">
                  {new Date(r.created_at).toLocaleString()}
                </td>
                <td className="px-3 py-2 text-right">{countItems(items)}</td>
                <td className="px-3 py-2 text-right">
                  {formatCurrency(r.total)}
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={() => onOpen(r)}
                    className="text-xs cursor-pointer px-3 py-1.5 rounded-lg border hover:bg-gray-50"
                  >
                    Ver
                  </button>
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                No hay pedidos.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
