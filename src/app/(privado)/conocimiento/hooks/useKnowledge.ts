import { useCallback, useEffect, useRef, useState } from "react";
import { DocKey } from "../types/types";

export function useKnowledge(doc: DocKey) {
  const [text, setText] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const taRef = useRef<HTMLTextAreaElement>(null);

  const dirty = text !== originalText;

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/knowledge?doc=${encodeURIComponent(doc)}`, {
        method: "GET",
      });
      const json = (await res.json()) as { text?: string; error?: string };
      if (json.error) {
        setErr(json.error);
      } else {
        const content = json.text ?? "";
        setText(content);
        setOriginalText(content);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al cargar el documento");
    } finally {
      setLoading(false);
      setTimeout(() => taRef.current?.focus(), 50);
    }
  }, [doc]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave() {
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, doc }),
      });
      if (res.ok) {
        setSavedAt(new Date().toLocaleTimeString());
        setOriginalText(text);
      } else {
        const json = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setErr(
          json.error ?? "No se pudo guardar en Drive. Revisá consola/servidor.",
        );
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al guardar el documento");
    } finally {
      setSaving(false);
    }
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

  return {
    text,
    setText,
    loading,
    saving,
    savedAt,
    dirty,
    err,
    taRef,
    handleSave,
    reload: load,
  };
}
