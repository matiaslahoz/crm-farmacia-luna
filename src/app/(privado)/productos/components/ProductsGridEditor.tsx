"use client";

import {
  AlertCircle,
  AlertTriangle,
  FilePlus,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Tag,
  Trash,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useProductsGrid } from "../hooks/useProductsGrid";
import { ProductsGridEditorMobile } from "./ProductsGridEditorMobile";

export default function ProductsGridEditor() {
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
    searchTerm,
    setSearchTerm,
    page,
    totalPages,
    setPage,
  } = useProductsGrid();

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center gap-2">
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

        <div className="relative ml-2 flex-1 max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition-colors"
            placeholder="Buscar por nombre o presentación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Stats badge */}
        <div className="ml-auto flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 rounded-full border border-purple-100">
            <Tag className="w-4 h-4" />
            {count} entradas
          </div>

          <button
            onClick={openSheetUrl}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700 rounded-xl border border-green-200 bg-green-50 hover:bg-green-100 transition-colors"
            title="Abrir en Google Sheets"
          >
            <FilePlus size={16} />
            <span className="hidden md:inline">Google Sheets</span>
          </button>
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
      <div className="hidden md:block border border-gray-200 rounded-2xl bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1200px] max-h-[65vh] overflow-y-auto divide-y divide-gray-100 relative">
            <div className="sticky top-0 z-10 flex bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div className="flex-1 min-w-[200px] px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre</div>
              <div className="w-[150px] px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-l border-gray-200">Presentación</div>
              <div className="w-[150px] px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-l border-gray-200">Cód. Barra</div>
              <div className="w-[100px] px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-l border-gray-200">Stock</div>
              <div className="w-[120px] px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-l border-gray-200">Fraccionados</div>
              <div className="w-[120px] px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-l border-gray-200">P. Unitario</div>
              <div className="w-[100px] px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-l border-gray-200">Total</div>
              <div className="w-[150px] px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-l border-gray-200">Laboratorio</div>
              <div className="w-[60px] px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-l border-gray-200"></div>
            </div>

            {rows.map((r, i) => (
              <div key={r._id} className="flex hover:bg-gray-50/50 transition-colors group">
                <div className="flex-1 min-w-[200px] p-0">
                  <input
                    className="w-full h-full min-h-[48px] px-4 py-2.5 text-sm outline-none bg-transparent focus:bg-purple-50/30 transition-colors"
                    value={r.nombre}
                    onChange={(e) => updateCell(r._id, "nombre", e.target.value)}
                  />
                </div>
                <div className="w-[150px] p-0 border-l border-gray-100">
                  <input
                    className="w-full h-full min-h-[48px] px-4 py-2.5 text-sm outline-none bg-transparent focus:bg-purple-50/30 transition-colors"
                    value={r.presentacion}
                    onChange={(e) => updateCell(r._id, "presentacion", e.target.value)}
                  />
                </div>
                <div className="w-[150px] p-0 border-l border-gray-100">
                  <input
                    className="w-full h-full min-h-[48px] px-4 py-2.5 text-sm outline-none bg-transparent focus:bg-purple-50/30 transition-colors"
                    value={r.codigoBarra}
                    onChange={(e) => updateCell(r._id, "codigoBarra", e.target.value)}
                  />
                </div>
                <div className="w-[100px] p-0 border-l border-gray-100">
                  <input
                    className="w-full h-full min-h-[48px] px-4 py-2.5 text-sm outline-none bg-transparent focus:bg-purple-50/30 transition-colors"
                    value={r.stock}
                    onChange={(e) => updateCell(r._id, "stock", e.target.value)}
                  />
                </div>
                <div className="w-[120px] p-0 border-l border-gray-100">
                  <input
                    className="w-full h-full min-h-[48px] px-4 py-2.5 text-sm outline-none bg-transparent focus:bg-purple-50/30 transition-colors"
                    value={r.fraccionados}
                    onChange={(e) => updateCell(r._id, "fraccionados", e.target.value)}
                  />
                </div>
                <div className="w-[120px] p-0 border-l border-gray-100">
                  <input
                    className="w-full h-full min-h-[48px] px-4 py-2.5 text-sm outline-none bg-transparent focus:bg-purple-50/30 transition-colors"
                    value={r.precioUnitario}
                    onChange={(e) => updateCell(r._id, "precioUnitario", e.target.value)}
                  />
                </div>
                <div className="w-[100px] p-0 border-l border-gray-100">
                  <input
                    className="w-full h-full min-h-[48px] px-4 py-2.5 text-sm outline-none bg-transparent focus:bg-purple-50/30 transition-colors"
                    value={r.total}
                    onChange={(e) => updateCell(r._id, "total", e.target.value)}
                  />
                </div>
                <div className="w-[150px] p-0 border-l border-gray-100">
                  <input
                    className="w-full h-full min-h-[48px] px-4 py-2.5 text-sm outline-none bg-transparent focus:bg-purple-50/30 transition-colors"
                    value={r.laboratorio}
                    onChange={(e) => updateCell(r._id, "laboratorio", e.target.value)}
                  />
                </div>
                <div className="w-[60px] border-l border-gray-100 flex items-center justify-center">
                  <button
                    onClick={() => removeRow(r._id)}
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
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-2xl shadow-sm">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Página <span className="font-medium">{page}</span> de{" "}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Anterior</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  <span className="sr-only">Siguiente</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Cards */}
      <ProductsGridEditorMobile
        rows={rows}
        updateCell={updateCell}
        removeRow={removeRow}
      />
    </div>
  );
}
