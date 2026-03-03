"use client";

import ScrollArrows from "./ScrollArrows";
import { DocKey } from "../types/types";
import { useKnowledge } from "../hooks/useKnowledge";
import {
  AlertCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Save,
} from "lucide-react";

type Props = {
  doc: DocKey;
  title?: string;
};

export default function KnowledgeEditor({ doc, title }: Props) {
  const {
    text,
    setText,
    loading,
    saving,
    savedAt,
    dirty,
    err,
    taRef,
    handleSave,
    reload,
  } = useKnowledge(doc);

  return (
    <div className="relative rounded-2xl border-gray-200 bg-white">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          {savedAt && (
            <div className="text-xs text-gray-500">Guardado {savedAt}</div>
          )}
          <button
            onClick={reload}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">
              {loading ? "Actualizando…" : "Refrescar"}
            </span>
          </button>
          <button
            onClick={handleSave}
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
        </div>
      </div>

      <div className="p-3 space-y-3">
        {/* Error message */}
        {err && (
          <div className="flex items-center gap-2 px-4 py-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle size={20} className="flex-shrink-0" />
            {err}
          </div>
        )}

        {/* Dirty indicator */}
        {dirty && (
          <div className="flex items-center gap-2 px-4 py-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle size={20} className="flex-shrink-0" />
            Hay cambios sin guardar
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Cargando documento…
          </div>
        ) : (
          <div className="relative min-h-0">
            <textarea
              ref={taRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribí el contenido acá…"
              className="w-full h-[60dvh] resize-vertical rounded-xl border border-gray-200 p-3 text-sm outline-none focus:border-gray-900 overflow-auto"
            />

            <ScrollArrows
              targetRef={taRef}
              bottomClassName="bottom-4 right-4"
              topClassName="top-4 right-4"
            />
          </div>
        )}
      </div>
    </div>
  );
}
