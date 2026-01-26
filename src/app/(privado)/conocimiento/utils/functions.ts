import { RowSynonyms } from "../types/types";

export function parseCsv(csv: string): RowSynonyms[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const hdr = lines.shift() || "";
  const [h1, h2] = hdr.split(",").map((h) => h.trim().toLowerCase());
  if (h1 !== "aliases" || h2 !== "canonical") return [];
  const rows: RowSynonyms[] = [];
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

export function toCsv(rows: RowSynonyms[]): string {
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
