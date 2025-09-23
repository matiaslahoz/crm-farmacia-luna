import { NextRequest } from "next/server";
import { getDrive } from "@/lib/googleDrive";
import { Document, Packer, Paragraph, TextRun } from "docx";

export const runtime = "nodejs";

type DocKey = "kb_sinonimos" | "kb_institucional";

const FILE_IDS: Record<DocKey, string | undefined> = {
  kb_sinonimos: process.env.KB_SINONIMOS_FILE_ID,
  kb_institucional: process.env.KB_INSTITUCIONAL_FILE_ID,
};

function resolveFileId(doc: DocKey) {
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

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const doc = (url.searchParams.get("doc") || "kb_institucional") as DocKey;

  try {
    const fileId = resolveFileId(doc);
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
  } catch (e) {
    console.error("Drive GET error", e);
    const msg = e instanceof Error ? e.message : "No se pudo leer el documento";
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      text?: string;
      doc?: DocKey;
    };
    const doc: DocKey = body.doc ?? "kb_institucional";
    const fileId = resolveFileId(doc);

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
  } catch (e) {
    console.error("Drive POST error", e);
    const msg =
      e instanceof Error ? e.message : "No se pudo guardar el documento";
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
}
