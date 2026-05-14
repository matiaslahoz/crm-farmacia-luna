"use client";

import { Pill, Trash, Tag } from "lucide-react";
import { ProductRow } from "../hooks/useProductsGrid";

export function ProductsGridEditorMobile({
  rows,
  updateCell,
  removeRow,
}: {
  rows: ProductRow[];
  updateCell: (
    id: string,
    field: keyof Omit<ProductRow, "_id">,
    value: string,
  ) => void;
  removeRow: (id: string) => void;
}) {
  return (
    <div className="md:hidden space-y-3">
      {rows.map((r, i) => (
        <div
          key={r._id}
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
        >
          <div className="flex items-start justify-between mb-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-700 bg-purple-50 rounded-lg">
              <Tag className="w-3 h-3" />
              Fila {i + 1}
            </span>

            <button
              onClick={() => removeRow(r._id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Eliminar"
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {/* NOMBRE */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
                <Pill className="w-3.5 h-3.5 text-purple-500" />
                Nombre
              </label>
              <input
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                value={r.nombre}
                onChange={(e) => updateCell(r._id, "nombre", e.target.value)}
                placeholder="Nombre del producto"
              />
            </div>
            
            {/* PRESENTACION */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
                Presentación
              </label>
              <input
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                value={r.presentacion}
                onChange={(e) => updateCell(r._id, "presentacion", e.target.value)}
              />
            </div>

            {/* CODIGO DE BARRA */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
                Código de Barra
              </label>
              <input
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                value={r.codigoBarra}
                onChange={(e) => updateCell(r._id, "codigoBarra", e.target.value)}
              />
            </div>

            {/* STOCK & FRACCIONADOS */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
                  Stock
                </label>
                <input
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  value={r.stock}
                  onChange={(e) => updateCell(r._id, "stock", e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
                  Fraccionados
                </label>
                <input
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  value={r.fraccionados}
                  onChange={(e) => updateCell(r._id, "fraccionados", e.target.value)}
                />
              </div>
            </div>

            {/* PRECIO UNITARIO & TOTAL */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
                  Precio Unitario
                </label>
                <input
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  value={r.precioUnitario}
                  onChange={(e) => updateCell(r._id, "precioUnitario", e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
                  Total
                </label>
                <input
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                  value={r.total}
                  onChange={(e) => updateCell(r._id, "total", e.target.value)}
                />
              </div>
            </div>

            {/* LABORATORIO */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
                Laboratorio
              </label>
              <input
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                value={r.laboratorio}
                onChange={(e) => updateCell(r._id, "laboratorio", e.target.value)}
              />
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}
