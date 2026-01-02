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

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Archivo .txt
          </label>
          <input
            type="file"
            accept=".txt,.csv"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-teal-50 file:text-teal-700
              hover:file:bg-teal-100
              cursor-pointer border border-gray-300 rounded-lg"
          />
        </div>
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium
            disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
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
