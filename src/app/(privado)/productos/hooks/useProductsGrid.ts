import { useState, useEffect, useCallback, useMemo } from "react";

export type ProductRow = {
  _id: string;
  nombre: string;
  presentacion: string;
  codigoBarra: string;
  stock: string;
  fraccionados: string;
  precioUnitario: string;
  total: string;
  laboratorio: string;
};

export function useProductsGrid() {
  const [allRows, setAllRows] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [dirty, setDirty] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 30;

  const generateId = () => {
    try {
      return crypto.randomUUID();
    } catch {
      return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
  };

  const parseCsvToRows = (csv: string): ProductRow[] => {
    const lines = csv.split(/\r?\n/);
    const parsed: ProductRow[] = [];
    for (let j = 1; j < lines.length; j++) {
      const raw = lines[j];
      if (raw.trim().length === 0) continue;
      const cells: string[] = [];
      let cur = "";
      let inQ = false;
      for (let i = 0; i < raw.length; i++) {
        const ch = raw[i];
        if (ch === '"') {
          if (inQ && raw[i + 1] === '"') {
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
      
      parsed.push({
        _id: generateId(),
        nombre: cells[0] || "",
        presentacion: cells[1] || "",
        codigoBarra: cells[2] || "",
        stock: cells[3] || "",
        fraccionados: cells[4] || "",
        precioUnitario: cells[5] || "",
        total: cells[6] || "",
        laboratorio: cells[7] || "",
      });
    }
    return parsed;
  };

  const rowsToCsv = (data: ProductRow[]): string => {
    const escape = (s: string) => {
      if (!s) return "";
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    };
    const header = "NOMBRE,PRESENTACION,CODIGO DE BARRA,STOCK,FRACCIONADOS,PRECIO UNITARIO,TOTAL,LABORATORIO";
    const body = data
      .map(
        (r) =>
          `${escape(r.nombre)},${escape(r.presentacion)},${escape(r.codigoBarra)},${escape(r.stock)},${escape(r.fraccionados)},${escape(r.precioUnitario)},${escape(r.total)},${escape(r.laboratorio)}`
      )
      .join("\n");
    return header + "\n" + body;
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");
      setDirty(false);
      const res = await fetch("/api/productos", { cache: "no-store" });
      if (!res.ok) throw new Error("Error fetching products");
      const data = await res.json();
      const csv = data.text || "";
      if (csv) {
        setAllRows(parseCsvToRows(csv));
      } else {
        setAllRows([]);
      }
      setPage(1);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    try {
      setSaving(true);
      setErr("");
      const csv = rowsToCsv(allRows);
      const res = await fetch("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: csv }),
      });
      if (!res.ok) {
        const info = await res.json();
        throw new Error(info.error || "Error al guardar");
      }
      setDirty(false);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const updateCell = (id: string, field: keyof Omit<ProductRow, "_id">, val: string) => {
    setAllRows((prev) => prev.map((r) => r._id === id ? { ...r, [field]: val } : r));
    setDirty(true);
  };

  const addRow = () => {
    setAllRows((prev) => [
      {
        _id: generateId(),
        nombre: "",
        presentacion: "",
        codigoBarra: "",
        stock: "",
        fraccionados: "",
        precioUnitario: "",
        total: "",
        laboratorio: "",
      },
      ...prev,
    ]);
    setSearchTerm("");
    setPage(1);
    setDirty(true);
  };

  const removeRow = (id: string) => {
    setAllRows((prev) => prev.filter((r) => r._id !== id));
    setDirty(true);
  };

  const openSheetUrl = () => {
    const url = process.env.NEXT_PUBLIC_KB_PRODUCTS_GOOGLE_SHEETS_XSLX || "https://docs.google.com/spreadsheets/d/1xWT26INyv4lJyEp1OT-TZWDWBXOA6zmx/edit";
    window.open(url, "_blank");
  };

  const filteredRows = useMemo(() => {
    if (!searchTerm) return allRows;
    const lower = searchTerm.toLowerCase();
    return allRows.filter((r) => 
      r.nombre.toLowerCase().includes(lower) || 
      r.presentacion.toLowerCase().includes(lower)
    );
  }, [allRows, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page]);

  // Si la búsqueda cambia y achica la lista, volvemos a la 1
  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [filteredRows.length, page, totalPages]);

  return {
    rows: paginatedRows,
    searchTerm,
    setSearchTerm,
    page,
    totalPages,
    setPage,
    loading,
    saving,
    err,
    dirty,
    count: allRows.length,
    load,
    save,
    updateCell,
    addRow,
    removeRow,
    openSheetUrl,
  };
}
