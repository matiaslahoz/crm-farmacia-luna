export type PedidoItem = {
  name: string;
  productId?: number | string | null;
  qty: number;
  unitPrice: number;
};

// helpers de tipos
type UnknownRecord = Record<string, unknown>;
const isRecord = (v: unknown): v is UnknownRecord =>
  v !== null && typeof v === "object" && !Array.isArray(v);

const asNumber = (v: unknown): number | null => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v)))
    return Number(v);
  return null;
};

const asString = (v: unknown): string | null =>
  typeof v === "string" ? v : null;

/**
 * Normaliza un array de ítems (objetos desconocidos) a PedidoItem[]
 */
function normalizeArray(arr: readonly unknown[]): PedidoItem[] {
  const out: PedidoItem[] = [];
  for (const x of arr) {
    if (!isRecord(x)) continue;

    const name = asString(x.name) ?? asString(x.title) ?? "";

    const rawProductId = (x.productId ?? x.id) as unknown;
    const productId =
      typeof rawProductId === "string" || typeof rawProductId === "number"
        ? rawProductId
        : null;

    const qty =
      asNumber((x as UnknownRecord).qty) ??
      asNumber((x as UnknownRecord).quantity) ??
      0;
    const unitPrice =
      asNumber((x as UnknownRecord).unitPrice) ??
      asNumber((x as UnknownRecord).price) ??
      0;

    if (name && qty > 0) out.push({ name, productId, qty, unitPrice });
  }
  return out;
}

export function parsePedido(p: unknown): PedidoItem[] {
  try {
    const raw = typeof p === "string" ? JSON.parse(p) : p;
    if (Array.isArray(raw)) return normalizeArray(raw);
    if (isRecord(raw)) {
      const items = (raw as UnknownRecord)["items"];
      if (Array.isArray(items)) return normalizeArray(items);
    }
  } catch {
    // ignorar parse errors
  }
  return [];
}

export function countItems(items: readonly PedidoItem[]) {
  return items.reduce((a, b) => a + (b.qty || 0), 0);
}
