import { NextResponse } from "next/server";

export const runtime = "nodejs";

type MetaMediaResp = { url?: string; mime_type?: string };

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const token = process.env.WHATSAPP_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "Missing WHATSAPP_TOKEN" },
      { status: 500 },
    );
  }

  const mediaId = (await context.params).id;

  const metaRes = await fetch(`https://graph.facebook.com/v20.0/${mediaId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!metaRes.ok) {
    const details = await metaRes.text().catch(() => "");
    return NextResponse.json(
      { error: "Failed to fetch media info from Meta", details },
      { status: metaRes.status },
    );
  }

  const metaJson = (await metaRes.json()) as MetaMediaResp;
  if (!metaJson.url) {
    return NextResponse.json(
      { error: "Meta response has no url" },
      { status: 500 },
    );
  }

  const binRes = await fetch(metaJson.url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!binRes.ok || !binRes.body) {
    const details = await binRes.text().catch(() => "");
    return NextResponse.json(
      { error: "Failed to download media", details },
      { status: binRes.status || 500 },
    );
  }

  const contentType =
    binRes.headers.get("content-type") ||
    metaJson.mime_type ||
    "application/octet-stream";

  return new NextResponse(binRes.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=300",
    },
  });
}
