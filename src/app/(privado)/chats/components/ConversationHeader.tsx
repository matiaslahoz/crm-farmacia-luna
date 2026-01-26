import SessionAvatar from "./SessionAvatar";
import { waLink } from "@/lib/phone";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function ConversationHeader({
  title,
  phone,
  meta,
  onBack,
}: {
  title?: string | null;
  phone?: number | string | null;
  meta?: string;
  onBack?: () => void;
}) {
  const hasPhone = !!phone;
  const url = hasPhone ? waLink(phone) : "";

  return (
    <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
      {title ? (
        <>
          {onBack && (
            <button
              onClick={onBack}
              className="shrink-0 rounded-full border border-gray-200 bg-white p-2 hover:bg-gray-50"
              aria-label="Volver"
              title="Volver"
              type="button"
            >
              <ArrowLeft className="size-4 text-gray-700" />
            </button>
          )}

          <SessionAvatar name={title ?? undefined} phone={phone} size={36} />

          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{title}</div>
            {meta && (
              <div className="text-xs text-gray-500 truncate">{meta}</div>
            )}
          </div>

          {hasPhone && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] text-white px-3 py-1.5 text-xs font-medium hover:opacity-90"
              aria-label="Abrir en WhatsApp"
              title="Abrir en WhatsApp"
            >
              Abrir en WhatsApp
              <ExternalLink className="size-3.5" />
            </a>
          )}
        </>
      ) : (
        <div className="text-sm text-gray-600">Seleccioná una conversación</div>
      )}
    </div>
  );
}
