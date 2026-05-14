"use client";

import { useState } from "react";
import { Pill, ChevronDown, Tag } from "lucide-react";
import ProductsGridEditor from "./components/ProductsGridEditor";

export default function ProductsPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="h-full overflow-y-auto pr-2 space-y-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg shadow-purple-500/20 text-white">
            <Pill className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Productos
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Gestioná el stock, precios y requisitos de venta
            </p>
          </div>
        </div>
      </div>

      <section
        className={`rounded-2xl border bg-white shadow-sm transition-all duration-200 ${
          isOpen
            ? "border-purple-200 ring-1 ring-purple-100"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-4 px-5 py-4"
          aria-expanded={isOpen}
        >
          <div
            className={`p-2 rounded-xl transition-colors ${
              isOpen
                ? "bg-purple-100 text-purple-600"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            <Tag className="w-6 h-6" />
          </div>
          <div className="text-left flex-1">
            <div className="font-semibold text-gray-900">KB Productos</div>
            <div className="text-sm text-gray-500">
              Gestión directa de catálogo y precios
            </div>
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
          <div className="border-t border-gray-100">
            <ProductsGridEditor />
          </div>
        )}
      </section>
    </div>
  );
}
