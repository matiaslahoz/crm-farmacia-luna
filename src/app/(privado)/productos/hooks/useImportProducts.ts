import { useState } from "react";

export function useImportProducts() {
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

  return {
    file,
    uploading,
    status,
    msg,
    handleFileChange,
    handleUpload,
  };
}
