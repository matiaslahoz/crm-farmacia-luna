"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  FilePlus,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Tag,
  Trash,
} from "lucide-react";
import { useSynonyms } from "../hooks/useSynonyms";
import { SynonymsGridEditorMobile } from "./SynonymsGridEditorMobile";

export default function SynonymsGridEditor() {
  const {
    rows,
    loading,
    saving,
    err,
    dirty,
    count,
    load,
    save,
    updateCell,
    addRow,
    removeRow,
    openSheetUrl,
  } = useSynonyms();

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Primary actions */}
        <button
          onClick={save}
          disabled={saving || loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando…
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Guardar
            </>
          )}
        </button>

        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">
            {loading ? "Actualizando…" : "Refrescar"}
          </span>
        </button>

        <button
          onClick={addRow}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Agregar fila</span>
        </button>

        {/* Stats badge */}
        <div className="ml-auto flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 rounded-full border border-purple-100">
            <Tag className="w-4 h-4" />
            {count} entradas
          </div>

          {process.env.KB_SYNONYMS_GOOGLE_SHEETS_CSV && (
            <button
              onClick={openSheetUrl}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700 rounded-xl border border-green-200 bg-green-50 hover:bg-green-100 transition-colors"
              title="Abrir en Google Sheets"
            >
              <FilePlus size={16} />
              <span className="hidden md:inline">Google Sheets</span>
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {err && (
        <div className="flex items-center gap-2 px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle size={20} />
          {err}
        </div>
      )}

      {/* Dirty indicator */}
      {dirty && (
        <div className="flex items-center gap-2 px-4 py-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle size={20} />
          Hay cambios sin guardar
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block border border-gray-200 rounded-2xl overflow-hidden bg-white">
        <div className="max-h-[55vh] overflow-auto divide-y divide-gray-100 relative">
          <div className="sticky top-0 z-10 grid grid-cols-12 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            {" "}
            <div className="col-span-6 px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <Tag className="w-4 h-4 text-purple-500" />
                Aliases (Sinónimos)
              </div>
            </div>
            <div className="col-span-5 px-4 py-3 border-l border-gray-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Canónico
              </div>
            </div>
            <div className="col-span-1 px-4 py-3 border-l border-gray-200 text-center">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Acción
              </span>
            </div>
          </div>

          {rows.map((r, i) => (
            <div
              key={i}
              className="grid grid-cols-12 hover:bg-gray-50/50 transition-colors group"
            >
              <div className="col-span-6 p-0">
                <textarea
                  className="w-full h-full min-h-[56px] px-4 py-3 text-sm outline-none resize-none bg-transparent focus:bg-purple-50/30 transition-colors"
                  value={r.aliases}
                  onChange={(e) => updateCell(i, "aliases", e.target.value)}
                  placeholder="Ej: cemento, portland, polvo gris"
                />
              </div>
              <div className="col-span-5 p-0 border-l border-gray-100">
                <input
                  className="w-full h-full px-4 py-3 text-sm outline-none bg-transparent focus:bg-green-50/30 transition-colors"
                  value={r.canonical}
                  onChange={(e) => updateCell(i, "canonical", e.target.value)}
                  placeholder="Ej: Cemento Portland"
                />
              </div>
              <div className="col-span-1 border-l border-gray-100 flex items-center justify-center">
                <button
                  onClick={() => removeRow(i)}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                  title="Eliminar fila"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Cards */}
      <SynonymsGridEditorMobile
        rows={rows}
        updateCell={updateCell}
        removeRow={removeRow}
      />
    </div>
  );
}
