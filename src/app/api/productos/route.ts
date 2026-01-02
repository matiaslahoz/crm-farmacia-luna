import { NextResponse } from "next/server";
import { google } from "googleapis";
import { Readable } from "stream";

export const runtime = "nodejs";

function getDriveOAuthClient() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET!;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN!;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Faltan vars OAuth (CLIENT_ID/CLIENT_SECRET/REFRESH_TOKEN)"
    );
  }

  const auth = new google.auth.OAuth2(clientId, clientSecret);
  auth.setCredentials({ refresh_token: refreshToken });
  return google.drive({ version: "v3", auth });
}

function formatFechaDMY(date = new Date()) {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
}

export async function POST(req: Request) {
  try {
    const productosFolderId = process.env.GOOGLE_DRIVE_PRODUCTOS_FOLDER_ID;
    if (!productosFolderId)
      throw new Error("Falta GOOGLE_DRIVE_PRODUCTOS_FOLDER_ID");

    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Falta 'file' en el FormData" },
        { status: 400 }
      );
    }

    const content = await file.text();

    const drive = getDriveOAuthClient();

    const fecha = formatFechaDMY();
    const name = `Productos - ${fecha}.txt`;

    const res = await drive.files.create({
      requestBody: {
        name,
        mimeType: "text/plain",
        parents: [productosFolderId],
      },
      media: {
        mimeType: "text/plain",
        body: Readable.from([content]),
      },
      fields: "id,name,parents,webViewLink",
    });

    return NextResponse.json(res.data, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
