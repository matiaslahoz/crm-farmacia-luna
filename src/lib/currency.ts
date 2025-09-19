export function formatCurrency(
  n?: number | null,
  locale = "es-AR",
  currency = "ARS"
) {
  const v = typeof n === "number" ? n : Number(n ?? 0);
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    v
  );
}
