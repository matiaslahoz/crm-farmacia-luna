"use client";

import { useEffect, useRef, useState } from "react";
import ScrollArrows from "./ScrollArrows";
import { DocKey } from "../types/types";

type Props = {
  doc: DocKey;
  title?: string;
};

export default function KnowledgeEditor({ doc, title }: Props) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await fetch(`/api/knowledge?doc=${encodeURIComponent(doc)}`, {
        method: "GET",
      });
      const json = (await res.json()) as { text?: string; error?: string };
      if (!cancelled) {
        setText(json.text ?? "");
        setLoading(false);
        setTimeout(() => taRef.current?.focus(), 50);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [doc]);

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, doc }),
    });
    setSaving(false);
    if (res.ok) setSavedAt(new Date().toLocaleTimeString());
    else alert("No se pudo guardar en Drive. Revisá consola/servidor.");
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void handleSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, doc]);

  return (
    <div className="relative rounded-2xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="text-sm text-gray-700">
          {title ?? "Documento de base de conocimientos"}
          <span className="ml-2 rounded-md bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
            {doc}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {savedAt && (
            <div className="text-xs text-gray-500">Guardado {savedAt}</div>
          )}
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="text-sm px-3 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>

      <div className="p-3">
        {loading ? (
          <div className="text-sm text-gray-500">Cargando documento…</div>
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
