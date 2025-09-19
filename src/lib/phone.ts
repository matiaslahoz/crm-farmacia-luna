export function normalizePhone(p?: number | string | null) {
  return String(p ?? "").replace(/\D/g, "");
}

export function toWhatsAppNumber(
  p?: number | string | null,
  defaultCountry: string = "54"
) {
  let n = normalizePhone(p);
  if (!n) return "";
  if (n.startsWith("00")) n = n.slice(2);
  if (n.startsWith("0")) n = n.slice(1);
  // si no empieza con '54' ni '549' y querés forzar AR por defecto:
  if (defaultCountry && !n.startsWith(defaultCountry)) {
    n = defaultCountry + n;
  }
  return n;
}

export function waLink(p?: number | string | null) {
  const n = toWhatsAppNumber(p);
  return n ? `https://wa.me/${n}` : "";
}
