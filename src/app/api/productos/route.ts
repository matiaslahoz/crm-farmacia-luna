import { NextRequest } from "next/server";
import { google } from "googleapis";

export const runtime = "nodejs";

function normalizeCsvUrl(url: string): string {
  if (!url) return "";
  if (url.includes("/export?format=csv")) return url;
  if (url.includes("/edit"))
    return url.replace(/\/edit.*$/, "/export?format=csv");
  return url;
}

function parseCsvToRows(csv: string): string[][] {
  const lines = csv.split(/\r?\n/);
  const rows: string[][] = [];
  for (const raw of lines) {
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
    rows.push(cells.map((c) => c));
  }
  return rows;
}

function getSheetsClient() {
  let raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_B64 || "";
  if (!raw.trim()) {
    throw new Error("Falta GOOGLE_SERVICE_ACCOUNT_KEY_B64");
  }

  raw = raw.trim();
  if (
    (raw.startsWith('"') && raw.endsWith('"')) ||
    (raw.startsWith("'") && raw.endsWith("'"))
  ) {
    raw = raw.slice(1, -1);
  }

  const tryParseJson = (s: string) => {
    const obj = JSON.parse(s) as {
      client_email?: string;
      private_key?: string;
    };
    const email = (obj.client_email || "").trim();
    let key = obj.private_key || "";

    key = key.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    if (key.includes("\\n")) key = key.replace(/\\n/g, "\n");
    key = key.trim();

    const hasBegin = key.includes("BEGIN PRIVATE KEY");
    const hasRsaBegin = key.includes("BEGIN RSA PRIVATE KEY");
    const hasEnd =
      key.includes("END PRIVATE KEY") || key.includes("END RSA PRIVATE KEY");
    if (!(hasBegin || hasRsaBegin) || !hasEnd) {
      throw new Error("private_key sin encabezado/footers PEM");
    }
    if (!key.startsWith("-----BEGIN")) {
      const idx = key.indexOf("-----BEGIN");
      if (idx >= 0) key = key.slice(idx);
    }
    if (!key.endsWith("\n")) key = key + "\n";

    if (!email) throw new Error("client_email vacío");

    return { email, key };
  };

  let creds: { email: string; key: string };

  try {
    creds = tryParseJson(raw);
  } catch (e1) {
    try {
      const decoded = Buffer.from(raw, "base64").toString("utf8");
      creds = tryParseJson(decoded);
    } catch (e2) {
      throw new Error(
        "GOOGLE_SERVICE_ACCOUNT_KEY inválida: no es JSON ni base64 válido",
      );
    }
  }

  const auth = new google.auth.JWT({
    email: creds.email,
    key: creds.key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

export async function GET(req: NextRequest) {
  try {
    const rawUrl = process.env.KB_PRODUCTS_GOOGLE_SHEETS_XSLX || "";
    const csvUrl = normalizeCsvUrl(rawUrl);
    if (!csvUrl) throw new Error("Falta env KB_PRODUCTS_GOOGLE_SHEETS_XSLX");
    
    const res = await fetch(csvUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(`CSV fetch error: ${res.status}`);
    const csv = await res.text();
    
    return new Response(JSON.stringify({ text: csv }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "No se pudo leer el documento";
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      text?: string;
    };
    
    const csv = body.text ?? "";
    if (!csv.trim()) {
      return new Response(JSON.stringify({ ok: false, error: "CSV vacío" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const editUrl = process.env.KB_PRODUCTS_GOOGLE_SHEETS_XSLX || "";
    const m = editUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!m)
      throw new Error(
        "KB_PRODUCTS_GOOGLE_SHEETS_XSLX inválida (no encuentro spreadsheetId)",
      );
    const spreadsheetId = m[1];

    const rows = parseCsvToRows(csv);
    if (rows.length === 0) {
      return new Response(
        JSON.stringify({ ok: false, error: "CSV sin filas" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const sheets = getSheetsClient();
    // Assuming columns A to H for products
    await sheets.spreadsheets.values.clear({ spreadsheetId, range: "A:H" });
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "A1",
      valueInputOption: "RAW",
      requestBody: { values: rows },
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: unknown) {
    const msg =
      e instanceof Error ? e.message : "No se pudo guardar el documento";
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
