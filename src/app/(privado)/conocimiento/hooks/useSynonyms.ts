import { useEffect, useMemo, useState } from "react";
import { RowSynonyms } from "../types/types";
import { parseCsv, toCsv } from "../utils/functions";

export function useSynonyms() {
  const [rows, setRows] = useState<RowSynonyms[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const count = useMemo(
    () => rows.filter((r) => r.canonical.trim().length > 0).length,
    [rows],
  );

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/knowledge?doc=kb_sinonimos", {
        cache: "no-store",
      });
      const json = (await res.json()) as { text?: string; error?: string };
      if (json.error) throw new Error(json.error);
      const csv = json.text || "";
      const parsed = parseCsv(csv);
      setRows(parsed.length > 0 ? parsed : [{ aliases: "", canonical: "" }]);
      setDirty(false);
    } catch {
      setErr("No se pudo cargar la hoja");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setErr(null);
    try {
      const cleaned = rows.filter(
        (r) => r.aliases.trim().length > 0 || r.canonical.trim().length > 0,
      );
      const csv = toCsv(cleaned);
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doc: "kb_sinonimos", text: csv }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!json.ok) throw new Error(json.error || "Error guardando");
      setDirty(false);
    } catch {
      setErr("No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateCell = (idx: number, key: keyof RowSynonyms, value: string) => {
    setRows((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [key]: value };
      return copy;
    });
    setDirty(true);
  };

  const addRow = () => {
    setRows((prev) => [...prev, { aliases: "", canonical: "" }]);
    setDirty(true);
  };

  const removeRow = (idx: number) => {
    setRows((prev) => prev.filter((_, i) => i !== idx));
    setDirty(true);
  };

  const openSheetUrl = () => {
    const u = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_SYNONYMS_CSV || "";
    if (!u) return;
    window.open(u, "_blank");
  };
  return {
    rows,
    loading,
    saving,
    err,
    dirty,
    count,
    load,
    save,
    updateCell,
    addRow,
    removeRow,
    openSheetUrl,
  };
}
