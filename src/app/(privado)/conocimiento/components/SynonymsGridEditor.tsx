"use client";

import { useSynonyms } from "../hooks/useSynonyms";

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
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Guardando…
            </>
          ) : (
            <>
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Guardar
            </>
          )}
        </button>

        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <svg
            className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span className="hidden sm:inline">
            {loading ? "Actualizando…" : "Refrescar"}
          </span>
        </button>

        <button
          onClick={addRow}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="hidden sm:inline">Agregar fila</span>
        </button>

        {/* Stats badge */}
        <div className="ml-auto flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-50 rounded-full border border-purple-100">
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            {count} entradas
          </div>

          {process.env.NEXT_PUBLIC_GOOGLE_SHEETS_SYNONYMS_CSV && (
            <button
              onClick={openSheetUrl}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700 rounded-xl border border-green-200 bg-green-50 hover:bg-green-100 transition-colors"
              title="Abrir en Google Sheets"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 11V9h-5V4H9v5H4v2h5v5h2v-5h5v5h2v-5h3v-2h-2z" />
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
              </svg>
              <span className="hidden md:inline">Google Sheets</span>
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {err && (
        <div className="flex items-center gap-2 px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {err}
        </div>
      )}

      {/* Dirty indicator */}
      {dirty && (
        <div className="flex items-center gap-2 px-4 py-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl">
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
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
                <svg
                  className="w-4 h-4 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                Aliases (Sinónimos)
              </div>
            </div>
            <div className="col-span-5 px-4 py-3 border-l border-gray-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {rows.map((r, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-700 bg-purple-50 rounded-lg">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                Fila {i + 1}
              </span>
              <button
                onClick={() => removeRow(i)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Eliminar"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
                  <svg
                    className="w-3.5 h-3.5 text-purple-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
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
                  <svg
                    className="w-3.5 h-3.5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
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
    </div>
  );
}
