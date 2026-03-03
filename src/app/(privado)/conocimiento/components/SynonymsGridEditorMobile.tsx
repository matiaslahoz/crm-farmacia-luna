"use client";

import { CheckCircle, Tag, Trash } from "lucide-react";

type Row = { aliases: string; canonical: string };

export function SynonymsGridEditorMobile({
  rows,
  updateCell,
  removeRow,
}: {
  rows: Row[];
  updateCell: (
    rowIndex: number,
    field: "aliases" | "canonical",
    value: string,
  ) => void;
  removeRow: (rowIndex: number) => void;
}) {
  return (
    <div className="md:hidden space-y-3">
      {rows.map((r, i) => (
        <div
          key={i}
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
        >
          <div className="flex items-start justify-between mb-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-700 bg-purple-50 rounded-lg">
              <Tag className="w-3 h-3" />
              Fila {i + 1}
            </span>

            <button
              onClick={() => removeRow(i)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Eliminar"
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
                <Tag className="w-3.5 h-3.5 text-purple-500" />
                Aliases (Sinónimos)
              </label>

              <textarea
                className="w-full min-h-[60px] px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none transition-colors"
                value={r.aliases}
                onChange={(e) => updateCell(i, "aliases", e.target.value)}
                placeholder="Ej: cemento, portland, polvo gris"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                Canónico
              </label>

              <input
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                value={r.canonical}
                onChange={(e) => updateCell(i, "canonical", e.target.value)}
                placeholder="Ej: Cemento Portland"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
