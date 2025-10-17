import "server-only";

let _cache: { at: number; ttl: number; dict: Record<string, string> } | null =
  null;

function parseAliasesCell(raw: string): string[] {
  if (!raw) return [];
  const s = raw
    .replace(/;/g, ",") // por si usan ; en vez de coma
    .replace(/\s+o\s+/gi, ","); // " a o b " => coma
  return s
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
}

export async function loadSynonymsDict(
  force = false
): Promise<Record<string, string>> {
  const ttl = Number(process.env.SYNONYMS_CACHE_SECONDS || 600);
  const now = Date.now();

  if (!force && _cache && now - _cache.at < ttl * 1000) {
    return _cache.dict;
  }

  const csvUrl = process.env.GOOGLE_SHEETS_SYNONYMS_CSV;
  if (!csvUrl) throw new Error("Falta env GOOGLE_SHEETS_SYNONYMS_CSV");

  const res = await fetch(csvUrl, { cache: "no-store" });
  if (!res.ok) throw new Error(`CSV fetch error: ${res.status}`);

  const text = await res.text();

  // Parse CSV muy simple (2 columnas). Si tu hoja tiene comas entrecomilladas,
  // podés cambiar por un parser "csv-parse/sync".
  const lines = text.split(/\r?\n/).filter(Boolean);
  const [h1, h2] = (lines.shift() || "")
    .split(",")
    .map((h) => h.trim().toLowerCase());
  if (h1 !== "aliases" || h2 !== "canonical") {
    throw new Error('CSV inválido: headers deben ser "aliases,canonical"');
  }

  const dict: Record<string, string> = {};
  for (const line of lines) {
    // soporta coma en canonical si viene entrecomillado: "texto, con, comas"
    // estrategia básica: dividir solo la primera coma
    const idx = line.indexOf(",");
    const aliasesRaw = idx >= 0 ? line.slice(0, idx) : line;
    let canonicalRaw = idx >= 0 ? line.slice(idx + 1) : "";

    // quita comillas envolventes en canonical si existen
    canonicalRaw = canonicalRaw.replace(/^"(.*)"$/, "$1").trim();

    const aliases = parseAliasesCell(aliasesRaw);
    const canonical = canonicalRaw.trim();

    if (!canonical) continue;
    for (const a of aliases) dict[a] = canonical;
  }

  _cache = { at: now, ttl, dict };
  return dict;
}

export function normalizeWithDict(input: string, dict: Record<string, string>) {
  const key = (input || "").trim().toLowerCase();
  return dict[key] || null;
}
