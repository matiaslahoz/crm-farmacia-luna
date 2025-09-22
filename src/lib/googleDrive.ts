import { google, drive_v3 } from "googleapis";
import fs from "node:fs";
import path from "node:path";

function loadServiceAccount(): { client_email: string; private_key: string } {
  // Prioridad: B64 > PATH > JSON
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_B64;
  const pth = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  let jsonStr: string | null = null;

  if (b64) {
    jsonStr = Buffer.from(b64, "base64").toString("utf8");
  } else if (pth) {
    jsonStr = fs.readFileSync(path.resolve(pth), "utf8");
  } else if (raw) {
    jsonStr = raw;
  } else {
    throw new Error(
      "Faltan credenciales: definí GOOGLE_SERVICE_ACCOUNT_KEY (JSON), o GOOGLE_SERVICE_ACCOUNT_KEY_B64 (base64), o GOOGLE_SERVICE_ACCOUNT_KEY_PATH (ruta)"
    );
  }

  const parsed = JSON.parse(jsonStr) as {
    client_email: string;
    private_key: string;
  };
  // arregla claves que vienen con \\n
  parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
  return parsed;
}

export function getDrive(scope: "ro" | "rw" = "rw"): drive_v3.Drive {
  const { client_email, private_key } = loadServiceAccount();
  const scopes =
    scope === "ro"
      ? ["https://www.googleapis.com/auth/drive.readonly"]
      : ["https://www.googleapis.com/auth/drive"]; // <-- scope completo

  const auth = new google.auth.JWT({
    email: client_email,
    key: private_key,
    scopes,
  });
  return google.drive({ version: "v3", auth });
}
