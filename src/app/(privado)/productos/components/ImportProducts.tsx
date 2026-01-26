"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";

export default function ImportProducts() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus("idle");
      setMsg("");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    // const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
    // if (!webhookUrl) {
    //   setStatus("error");
    //   setMsg("Falta configurar NEXT_PUBLIC_N8N_WEBHOOK_URL en .env");
    //   return;
    // }

    setUploading(true);
    setStatus("idle");

    try {
      const formData = new FormData();
      formData.append("file", file);
      // Optional: Add a filename or other metadata if needed by n8n
      formData.append("filename", file.name);

      const res = await fetch("/api/productos", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      setStatus("success");
      setMsg("Archivo enviado correctamente a procesar.");
      setFile(null);
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMsg(err instanceof Error ? err.message : "Error al subir archivo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
        <Upload className="size-5 text-teal-600" />
        Importar Lista de Precios
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        Subí tu archivo .txt (formato visualizado) para actualizar la base de
        datos de productos.
      </p>

      <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-3">
        <div className="w-full md:flex-1">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Archivo .txt
          </label>
          <input
            type="file"
            accept=".txt,.csv"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2.5 file:px-4
              file:rounded-xl file:border-0
              file:text-sm file:font-semibold
              file:bg-purple-50 file:text-purple-700
              hover:file:bg-purple-100
              cursor-pointer border border-slate-200 rounded-xl bg-white p-1"
          />
        </div>
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-medium shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:from-purple-500 hover:to-violet-500 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {uploading ? "Subiendo..." : "Procesar"}
        </button>
      </div>

      {status === "success" && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 text-sm">
          <CheckCircle className="size-4" />
          {msg}
        </div>
      )}

      {status === "error" && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="size-4" />
          {msg}
        </div>
      )}
    </div>
  );
}
