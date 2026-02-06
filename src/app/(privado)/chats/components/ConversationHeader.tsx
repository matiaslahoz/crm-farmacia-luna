import SessionAvatar from "./SessionAvatar";
import { waLink } from "@/lib/phone";
import { ArrowLeft } from "lucide-react";

export default function ConversationHeader({
  title,
  phone,
  onBack,
}: {
  title?: string | null;
  phone?: number | string | null;
  onBack?: () => void;
}) {
  const hasPhone = !!phone;
  const url = hasPhone ? waLink(phone) : "";

  return (
    <div className="px-5 py-3 border-b border-gray-100 bg-white/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-3 overflow-hidden">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden shrink-0 rounded-full p-2 text-gray-500 hover:bg-gray-100 -ml-2"
          >
            <ArrowLeft className="size-5" />
          </button>
        )}

        {title ? (
          <>
            <SessionAvatar name={title ?? undefined} phone={phone} size={40} />
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-gray-900 truncate text-sm leading-tight">
                {title}
              </span>
              <span className="text-xs text-green-500 font-medium truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Online
              </span>
            </div>
          </>
        ) : (
          <div className="text-sm font-medium text-gray-500">
            Sin conversación seleccionada
          </div>
        )}
      </div>

      {hasPhone && title && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200 hover:shadow-green-300 hover:scale-[1.02] transition-all duration-200 font-medium text-sm border border-green-400/20"
          title="Abrir en WhatsApp"
        >
          <span>Abrir en WhatsApp</span>
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4 text-white/90"
          >
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.696c1.029.662 2.028 1.014 3.321 1.014h.003c5.38 0 8.766-4.522 6.075-9.17-1.354-2.339-3.791-3.793-6.593-3.793zm0 10.165c-1.155 0-2.046-.312-2.836-.889l-2.028.532.541-1.977c-.579-.79-.893-1.688-.893-2.846.001-2.617 2.129-4.746 4.745-4.746 2.618 0 4.747 2.13 4.747 4.746s-2.129 4.745-4.276 5.179zm-2.028-3.923c-.141-.071-.837-.413-.967-.46-.129-.047-.223-.071-.317.071-.094.141-.365.46-.447.553-.082.094-.165.106-.306.035-.141-.071-2.914-1.666-3.876-2.923-.496-.649.076-.239.387-.796.126-.226.064-.423-.032-.612-.096-.188-.967-1.928-.934-2.158.337-.306.496-.306.744-.306.141 0 .282.035.435.106s1.953 4.295 1.953 4.295z" />
          </svg>
        </a>
      )}
    </div>
  );
}
