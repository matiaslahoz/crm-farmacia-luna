import SessionAvatar from "./SessionAvatar";
import { waLink } from "@/lib/phone";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

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
          className="shrink-0 flex items-center justify-center gap-2 p-2 lg:px-4 lg:py-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200 hover:shadow-green-300 hover:scale-[1.02] transition-all duration-200 font-medium text-sm border border-green-400/20"
          title="Abrir en WhatsApp"
        >
          <span className="hidden md:inline">Abrir en WhatsApp</span>
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
            alt="WhatsApp"
            width={24}
            height={24}
          />
        </a>
      )}
    </div>
  );
}
