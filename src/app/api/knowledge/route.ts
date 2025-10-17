import { NextRequest } from "next/server";
import { getDrive } from "@/lib/googleDrive";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { google } from "googleapis";

export const runtime = "nodejs";

type DocKey = "kb_sinonimos" | "kb_institucional";

const FILE_IDS: Record<Exclude<DocKey, "kb_sinonimos">, string | undefined> = {
  kb_institucional: process.env.KB_INSTITUCIONAL_FILE_ID,
};

function resolveFileId(doc: Exclude<DocKey, "kb_sinonimos">): string {
  const id = FILE_IDS[doc];
  if (!id) throw new Error(`Falta env para '${doc}'`);
  return id;
}

function toDocxBufferFromText(text: string): Promise<Buffer> {
  const paras = text.split("\n").map(
    (line) =>
      new Paragraph({
        children: [new TextRun(line)],
      })
  );
  const doc = new Document({
    sections: [{ properties: {}, children: paras }],
  });
  return Packer.toBuffer(doc);
}

function normalizeCsvUrl(url: string): string {
  if (!url) return "";
  if (url.includes("/export?format=csv")) return url;
  if (url.includes("/edit"))
    return url.replace(/\/edit.*$/, "/export?format=csv");
  return url;
}

function extractSheetIdFromUrl(url: string): string {
  const m = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!m)
    throw new Error(
      "No se pudo extraer spreadsheetId de GOOGLE_SHEETS_SYNONYMS_CSV"
    );
  return m[1];
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
  let raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "";
  if (!raw.trim()) {
    throw new Error("Falta GOOGLE_SERVICE_ACCOUNT_KEY");
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

    // Normalizaciones fuertes
    // 1) si vienen \r\n o \r, pasarlas a \n
    key = key.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    // 2) si vienen "\n" literales, convertirlos a saltos reales
    if (key.includes("\\n")) key = key.replace(/\\n/g, "\n");
    // 3) recortar espacios alrededor
    key = key.trim();

    // 4) asegurar header/footer exactos y líneas separadas
    const hasBegin = key.includes("BEGIN PRIVATE KEY");
    const hasRsaBegin = key.includes("BEGIN RSA PRIVATE KEY");
    const hasEnd =
      key.includes("END PRIVATE KEY") || key.includes("END RSA PRIVATE KEY");
    if (!(hasBegin || hasRsaBegin) || !hasEnd) {
      throw new Error("private_key sin encabezado/footers PEM");
    }
    // 5) si la primera línea no empieza con -----
    if (!key.startsWith("-----BEGIN")) {
      // cortar todo antes del primer BEGIN por si quedó basura
      const idx = key.indexOf("-----BEGIN");
      if (idx >= 0) key = key.slice(idx);
    }
    // 6) asegurar \n final
    if (!key.endsWith("\n")) key = key + "\n";

    if (!email) throw new Error("client_email vacío");

    // Logs seguros
    console.error("[GSA] email:", email);
    console.error("[GSA] key.len:", key.length);
    console.error("[GSA] key.startsWith-BEGIN:", key.startsWith("-----BEGIN"));
    console.error("[GSA] key.endsWith-NEWLINE:", key.endsWith("\n"));

    return { email, key };
  };

  let creds: { email: string; key: string };

  try {
    creds = tryParseJson(raw);
  } catch (e1) {
    try {
      const decoded = Buffer.from(raw, "base64").toString("utf8");
      creds = tryParseJson(decoded);
      console.error("[GSA] parsed from base64");
    } catch (e2) {
      console.error("[GSA] jsonError:", (e1 as Error)?.message);
      console.error("[GSA] b64Error:", (e2 as Error)?.message);
      throw new Error(
        "GOOGLE_SERVICE_ACCOUNT_KEY inválida: no es JSON ni base64 válido"
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
  const url = new URL(req.url);
  const doc = (url.searchParams.get("doc") || "kb_institucional") as DocKey;

  try {
    if (doc === "kb_sinonimos") {
      const rawUrl = process.env.GOOGLE_SHEETS_SYNONYMS_CSV || "";
      const csvUrl = normalizeCsvUrl(rawUrl);
      if (!csvUrl) throw new Error("Falta env GOOGLE_SHEETS_SYNONYMS_CSV");
      const res = await fetch(csvUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`CSV fetch error: ${res.status}`);
      const csv = await res.text();
      return new Response(JSON.stringify({ text: csv }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const fileId = resolveFileId("kb_institucional");
    const drive = getDrive();

    const meta = await drive.files.get({
      fileId,
      fields: "id,name,mimeType,driveId",
      supportsAllDrives: true,
    });

    const mime = meta.data.mimeType || "";
    let text: string;

    if (mime === "application/vnd.google-apps.document") {
      const exp = await drive.files.export(
        { fileId, mimeType: "text/plain" },
        { responseType: "arraybuffer" }
      );
      text = Buffer.from(exp.data as ArrayBuffer).toString("utf8");
    } else {
      const res = await drive.files.get(
        { fileId, alt: "media", supportsAllDrives: true },
        { responseType: "arraybuffer" }
      );
      const buffer = Buffer.from(res.data as ArrayBuffer);
      const mammoth = await import("mammoth");
      const { value } = await mammoth.extractRawText({ buffer });
      text = value ?? "";
    }

    return new Response(JSON.stringify({ text }), {
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
    const url = new URL(req.url);
    const debug = url.searchParams.get("debug") === "1";

    const body = (await req.json()) as {
      text?: string;
      doc?: "kb_sinonimos" | "kb_institucional";
    };
    const doc = body.doc ?? "kb_institucional";

    if (doc === "kb_sinonimos") {
      if (debug) {
        try {
          const sheets = getSheetsClient();
          // pequeño ping: leer metadata de spreadsheet para validar credenciales sin tocar datos
          const editUrl = process.env.GOOGLE_SHEETS_SYNONYMS_CSV || "";
          const m = editUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
          if (!m)
            throw new Error(
              "GOOGLE_SHEETS_SYNONYMS_CSV inválida (no encuentro spreadsheetId)"
            );
          const spreadsheetId = m[1];
          await sheets.spreadsheets.get({
            spreadsheetId,
            includeGridData: false,
          });
          return new Response(
            JSON.stringify({
              ok: true,
              diag: "Auth OK y acceso al spreadsheet OK",
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            }
          );
        } catch (e: unknown) {
          return new Response(
            JSON.stringify({ ok: false, diag: (e as Error).message }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
      }

      // flujo de guardado real:
      const csv = body.text ?? "";
      if (!csv.trim()) {
        return new Response(JSON.stringify({ ok: false, error: "CSV vacío" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      const editUrl = process.env.GOOGLE_SHEETS_SYNONYMS_CSV || "";
      const m = editUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!m)
        throw new Error(
          "GOOGLE_SHEETS_SYNONYMS_CSV inválida (no encuentro spreadsheetId)"
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
      await sheets.spreadsheets.values.clear({ spreadsheetId, range: "A:B" });
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
    }

    const fileId = resolveFileId("kb_institucional");
    const text = body.text ?? "";
    const buffer = await toDocxBufferFromText(text);
    const drive = getDrive();
    await drive.files.update({
      fileId,
      media: {
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        body: buffer as unknown as NodeJS.ReadableStream | Buffer,
      },
      fields: "id",
      supportsAllDrives: true,
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
