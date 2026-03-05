import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { getOrientation } from "../utils/functions";
import { X } from "lucide-react";

export type Orientation = "landscape" | "portrait" | "square" | "unknown";

export function WhatsAppImage({ mediaId }: { mediaId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [orientation, setOrientation] = useState<Orientation>("unknown");
  const [wh, setWh] = useState<{ w: number; h: number } | null>(null);

  // Evitar scroll de la página cuando la imagen está en grande
  useEffect(() => {
    if (isZoomed) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isZoomed]);

  const src = useMemo(() => `/api/whatsapp/${mediaId}`, [mediaId]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldLoad(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;

    const img = new window.Image();
    img.src = src;

    img.onload = () => {
      const w = img.naturalWidth || 0;
      const h = img.naturalHeight || 0;
      setWh({ w, h });
      setOrientation(getOrientation(w, h));
    };

    img.onerror = () => {
      setOrientation("unknown");
    };
  }, [shouldLoad, src]);

  const wrapperClass =
    orientation === "portrait"
      ? "w-[260px] max-w-[65vw]" // vertical: más angosta
      : orientation === "square"
        ? "w-[300px] max-w-[70vw]"
        : "w-[360px] max-w-[80vw]"; // horizontal: más ancha

  const maxHClass =
    orientation === "portrait" ? "max-h-[420px]" : "max-h-[340px]";

  if (!shouldLoad) {
    return (
      <div
        ref={ref}
        className={`${wrapperClass} h-40 rounded-xl bg-gray-100`}
      />
    );
  }

  if (!wh) {
    return (
      <div
        ref={ref}
        className={`${wrapperClass} h-52 rounded-xl bg-gray-100 animate-pulse`}
      />
    );
  }

  return (
    <>
      <div
        ref={ref}
        className={`${wrapperClass} cursor-zoom-in transition-transform hover:opacity-95`}
        onClick={() => setIsZoomed(true)}
      >
        <Image
          src={src}
          alt="Imagen"
          width={wh.w}
          height={wh.h}
          className={`rounded-xl border border-gray-200 w-full h-auto ${maxHClass} object-cover`}
          sizes="(max-width: 640px) 80vw, 360px"
          unoptimized
        />
      </div>

      {isZoomed &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 cursor-zoom-out"
            onClick={() => setIsZoomed(false)}
          >
            <div className="relative flex flex-col items-center justify-center max-w-[100vw] max-h-[100vh]">
              <Image
                src={src}
                alt="Imagen ampliada"
                width={wh.w}
                height={wh.h}
                className="w-auto h-auto max-w-[95vw] max-h-[90vh] object-contain rounded-md shadow-2xl"
                unoptimized
              />
              <button
                className="absolute top-2 right-2 md:-top-2 md:-right-12 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsZoomed(false);
                }}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
