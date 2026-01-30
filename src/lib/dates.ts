export function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function localDateKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fmtTime(ts: string) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function fmtDateAr(ts: string) {
  const d = new Date(ts);
  return d.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function endOfDayISO(d: string): string {
  return `${d}T23:59:59`;
}

export function isSameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function isYesterday(d: Date) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return startOfDay(d).getTime() === startOfDay(yesterday).getTime();
}

export function formatChatDate(
  input: Date | string | number | null | undefined,
): string {
  if (!input) return "";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "";

  const now = new Date();

  // Si es hoy, mostrar hora HH:mm
  if (isSameDay(d, now)) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // Si es ayer, mostrar "Ayer"
  if (isYesterday(d)) {
    return "Ayer";
  }

  // Si es este año, mostrar "d MMM" (ej: 28 ene)
  if (d.getFullYear() === now.getFullYear()) {
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  }

  // Si es otro año, mostrar dd/mm/yy
  return d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

export function getConversationDateLabel(
  input: Date | string | number,
): string {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return "";

  const now = new Date();

  if (isSameDay(d, now)) {
    return "Hoy";
  }

  if (isYesterday(d)) {
    return "Ayer";
  }

  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
