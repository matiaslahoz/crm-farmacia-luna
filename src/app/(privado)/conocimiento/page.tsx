"use client";

import { useState } from "react";
import KnowledgeEditor from "@/app/(privado)/conocimiento/components/KnowledgeEditor";
import Guidelines from "@/app/(privado)/conocimiento/components/Guidelines";
import SynonymsGridEditor from "@/app/(privado)/conocimiento/components/SynonymsGridEditor";
import { DocKey, Panel } from "./types/types";
import { BookOpen, Building, ChevronDown, Tag } from "lucide-react";

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

export default function ConocimientoPage() {
  const [open, setOpen] = useState<DocKey | null>(null);

  return (
    <div className="flex h-full min-h-0 flex-col gap-5 overflow-auto">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white">
          <BookOpen className="w-6 h-6" />
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
                  {p.icon === "tags" && <Tag className="w-6 h-6" />}
                  {p.icon === "building" && <Building className="w-6 h-6" />}
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
                  <ChevronDown className="w-6 h-6" />
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
