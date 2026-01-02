"use client";

import { useEffect, useMemo, useState } from "react";

type Row = { aliases: string; canonical: string };

function parseCsv(csv: string): Row[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const hdr = lines.shift() || "";
  const [h1, h2] = hdr.split(",").map((h) => h.trim().toLowerCase());
  if (h1 !== "aliases" || h2 !== "canonical") return [];
  const rows: Row[] = [];
  for (const line of lines) {
    let cur = "";
    let inQ = false;
    const cells: string[] = [];
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQ = !inQ;
        }
      } else if (ch === "," && !inQ) {
        cells.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    cells.push(cur);
    const [aliases = "", canonical = ""] = cells;
    rows.push({ aliases, canonical });
  }
  return rows;
}

function toCsv(rows: Row[]): string {
  const esc = (s: string) => {
    const mustQuote = /[",\n\r]/.test(s);
    const v = s.replace(/"/g, '""');
    return mustQuote ? `"${v}"` : v;
  };
  const body = rows
    .map((r) => `${esc(r.aliases)},${esc(r.canonical)}`)
    .join("\n");
  return `aliases,canonical\n${body}`;
}

export default function SynonymsGridEditor() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const count = useMemo(
    () => rows.filter((r) => r.canonical.trim().length > 0).length,
    [rows]
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
    } catch (e) {
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
        (r) => r.aliases.trim().length > 0 || r.canonical.trim().length > 0
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
    } catch (e) {
      setErr("No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateCell = (idx: number, key: keyof Row, value: string) => {
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

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <button
          onClick={save}
          disabled={saving || loading}
          className="rounded-lg bg-gray-900 text-white px-3 py-2 text-sm disabled:opacity-50"
        >
          {saving ? "Guardando…" : "Guardar"}
        </button>
        <button
          onClick={load}
          disabled={loading}
          className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
        >
          {loading ? "Actualizando…" : "Refrescar"}
        </button>
        <button
          onClick={addRow}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          Agregar fila
        </button>
        <div className="ml-auto text-sm text-gray-600">Entradas: {count}</div>
        {process.env.NEXT_PUBLIC_GOOGLE_SHEETS_SYNONYMS_CSV ? (
          <button
            onClick={openSheetUrl}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            Abrir en Google Sheets
          </button>
        ) : null}
      </div>

      {err && <div className="text-sm text-red-600">{err}</div>}

      <div className="border rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 border-b text-xs font-semibold bg-muted/30">
          <div className="col-span-7 px-3 py-2">aliases</div>
          <div className="col-span-4 px-3 py-2 border-l">canonical</div>
          <div className="col-span-1 px-3 py-2 border-l text-center">−</div>
        </div>

        <div className="max-h-[60vh] overflow-auto">
          {rows.map((r, i) => (
            <div
              key={i}
              className="grid grid-cols-12 border-b last:border-b-0 min-h-[44px]"
            >
              <div className="col-span-7 p-0">
                <textarea
                  className="w-full min-h-[44px] px-3 py-2 text-sm outline-none"
                  value={r.aliases}
                  onChange={(e) => updateCell(i, "aliases", e.target.value)}
                  placeholder="alias1, alias2 o alias3"
                />
              </div>
              <div className="col-span-4 p-0 border-l">
                <input
                  className="w-full px-3 py-2 text-sm outline-noneF"
                  value={r.canonical}
                  onChange={(e) => updateCell(i, "canonical", e.target.value)}
                  placeholder="nombre canónico"
                />
              </div>
              <div className="col-span-1 border-l flex items-center justify-center">
                <button
                  onClick={() => removeRow(i)}
                  className="text-xs text-gray-500 hover:text-red-600"
                  title="Eliminar fila"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>

        {dirty && (
          <div className="px-3 py-2 text-xs text-amber-700 bg-amber-50 border-t">
            Hay cambios sin guardar.
          </div>
        )}
      </div>
    </div>
  );
}
