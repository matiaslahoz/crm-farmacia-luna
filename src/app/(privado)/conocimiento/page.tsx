"use client";

import { useState } from "react";
import Guidelines from "./components/Guidelines";
import SynonymsGridEditor from "./components/SynonymsGridEditor";
import KnowledgeEditor from "./components/KnowledgeEditor";

type DocKey = "kb_sinonimos" | "kb_institucional";

const PANELS: { key: DocKey; title: string; hint: string }[] = [
  {
    key: "kb_sinonimos",
    title: "KB Sinónimos",
    hint: "Palabras equivalentes y variaciones",
  },
  {
    key: "kb_institucional",
    title: "KB Institucional",
    hint: "Datos de empresa, políticas y FAQs",
  },
];

export default function ConocimientoPage() {
  const [open, setOpen] = useState<DocKey | null>(null);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-auto">
      <h1 className="text-lg font-semibold text-gray-900">
        Base de conocimientos
      </h1>
      <Guidelines />

      <div className="space-y-3">
        {PANELS.map((p) => {
          const isOpen = open === p.key;
          return (
            <section
              key={p.key}
              className="rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              <button
                onClick={() => setOpen(isOpen ? null : p.key)}
                className="w-full flex items-center justify-between px-4 py-3"
                aria-expanded={isOpen}
                aria-controls={`panel-${p.key}`}
              >
                <div className="text-left">
                  <div className="font-medium text-gray-900">{p.title}</div>
                  <div className="text-xs text-gray-500">{p.hint}</div>
                </div>
                <span
                  className={`inline-block transition-transform ${isOpen ? "rotate-90" : ""}`}
                >
                  ▸
                </span>
              </button>

              {isOpen && (
                <div id={`panel-${p.key}`} className="border-t border-gray-200">
                  {p.key === "kb_sinonimos" ? (
                    <SynonymsGridEditor />
                  ) : (
                    <KnowledgeEditor doc={p.key} title={p.title} />
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
