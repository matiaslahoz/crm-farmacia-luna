"use client";

import { useState } from "react";
import KnowledgeEditor from "@/app/(privado)/conocimiento/components/KnowledgeEditor";
import Guidelines from "@/app/(privado)/conocimiento/components/Guidelines";
import SynonymsGridEditor from "@/app/(privado)/conocimiento/components/SynonymsGridEditor";
import { DocKey, Panel } from "./types/types";

const PANELS: Panel[] = [
  {
    key: "kb_sinonimos",
    title: "KB Sinónimos",
    hint: "Palabras equivalentes y variaciones",
    icon: "tags",
  },
  {
    key: "kb_institucional",
    title: "KB Institucional",
    hint: "Datos de empresa, políticas y FAQs",
    icon: "building",
  },
];

function PanelIcon({ type }: { type: string }) {
  if (type === "tags") {
    return (
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
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
      </svg>
    );
  }
  return (
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
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  );
}

export default function ConocimientoPage() {
  const [open, setOpen] = useState<DocKey | null>(null);

  return (
    <div className="flex h-full min-h-0 flex-col gap-5 overflow-auto">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Base de Conocimientos
          </h1>
          <p className="text-sm text-gray-500">
            Gestiona la información del chatbot
          </p>
        </div>
      </div>

      <Guidelines />

      <div className="space-y-3">
        {PANELS.map((p) => {
          const isOpen = open === p.key;
          return (
            <section
              key={p.key}
              className={`rounded-2xl border bg-white shadow-sm transition-all duration-200 ${
                isOpen
                  ? "border-purple-200 ring-1 ring-purple-100"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <button
                onClick={() => setOpen(isOpen ? null : p.key)}
                className="w-full flex items-center gap-4 px-5 py-4"
                aria-expanded={isOpen}
                aria-controls={`panel-${p.key}`}
              >
                <div
                  className={`p-2 rounded-xl transition-colors ${
                    isOpen
                      ? "bg-purple-100 text-purple-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <PanelIcon type={p.icon} />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-gray-900">{p.title}</div>
                  <div className="text-sm text-gray-500">{p.hint}</div>
                </div>
                <div
                  className={`p-1.5 rounded-lg transition-all ${
                    isOpen
                      ? "bg-purple-100 text-purple-600 rotate-180"
                      : "bg-gray-100 text-gray-400"
                  }`}
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
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {isOpen && (
                <div id={`panel-${p.key}`} className="border-t border-gray-100">
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
