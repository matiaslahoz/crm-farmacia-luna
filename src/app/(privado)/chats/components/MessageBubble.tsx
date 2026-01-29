export default function MessageBubble({
  own,
  text,
  time,
}: {
  own: boolean;
  text: string | null;
  time: string;
}) {
  return (
    <div
      className={`flex w-full ${own ? "justify-end" : "justify-start"} mb-2`}
    >
      <div
        className={`relative max-w-[75%] px-4 py-2.5 text-[14px] leading-relaxed shadow-sm transition-all
          ${
            own
              ? "bg-blue-600 text-white rounded-2xl rounded-tr-none"
              : "bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-none shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
          }
        `}
      >
        <div className="whitespace-pre-wrap break-words">{text}</div>
        <div
          className={`text-[10px] mt-1 text-right font-medium tracking-wide
            ${own ? "text-blue-100/80" : "text-gray-400"}
          `}
        >
          {time}
        </div>
      </div>
    </div>
  );
}
