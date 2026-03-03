"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { RefObject, useEffect, useState } from "react";

type Props = {
  targetRef: RefObject<HTMLTextAreaElement | null>;
  bottomClassName?: string;
  topClassName?: string;
  bottomThreshold?: number;
};

export default function ScrollArrows({
  targetRef,
  bottomClassName = "bottom-4 right-4",
  topClassName = "top-4 right-4",
  bottomThreshold = 2,
}: Props) {
  const [atBottom, setAtBottom] = useState(false);

  const recompute = () => {
    const el = targetRef.current;
    if (!el) return;
    const isBottom =
      el.scrollTop + el.clientHeight >= el.scrollHeight - bottomThreshold;
    setAtBottom(isBottom);
  };

  const scrollToBottom = () => {
    targetRef.current?.scrollTo({
      top: targetRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  const scrollToTop = () => {
    targetRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const onScroll = () => recompute();
    const onInput = () => recompute();

    el.addEventListener("scroll", onScroll);
    el.addEventListener("input", onInput);

    const ro = new ResizeObserver(() => recompute());
    ro.observe(el);

    recompute();

    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("input", onInput);
      ro.disconnect();
    };
  }, [targetRef]);

  return (
    <>
      {!atBottom && (
        <button
          type="button"
          onClick={scrollToBottom}
          className={`absolute grid h-10 w-10 place-items-center rounded-full border bg-white/90 shadow hover:bg-white ${bottomClassName}`}
          title="Ir al final"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      )}

      {atBottom && (
        <button
          type="button"
          onClick={scrollToTop}
          className={`absolute grid h-10 w-10 place-items-center rounded-full border bg-white/90 shadow hover:bg-white ${topClassName}`}
          title="Ir al principio"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </>
  );
}
