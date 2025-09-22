import { NextRequest } from "next/server";
import { getDrive } from "@/lib/googleDrive";
import { Document, Packer, Paragraph, TextRun } from "docx";

export const runtime = "nodejs";

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

export async function GET() {
  const fileId = process.env.KNOWLEDGE_DOC_FILE_ID;
  if (!fileId)
    return new Response(
      JSON.stringify({ error: "Falta KNOWLEDGE_DOC_FILE_ID" }),
      { status: 500 }
    );

  try {
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
      text = value;
    }

    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Drive GET error", e);
    return new Response(
      JSON.stringify({ error: "No se pudo leer el documento" }),
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const fileId = process.env.KNOWLEDGE_DOC_FILE_ID;
  if (!fileId) {
    return new Response(
      JSON.stringify({ error: "Falta KNOWLEDGE_DOC_FILE_ID" }),
      { status: 500 }
    );
  }

  try {
    const body = (await req.json()) as { text?: string };
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
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(
      JSON.stringify({ error: "No se pudo guardar el documento" }),
      { status: 500 }
    );
  }
}
