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
    <div className={`flex ${own ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed shadow-sm ${
          own ? "bg-[#d9fdd3]" : "bg-white border border-gray-200"
        }`}
      >
        <div className="whitespace-pre-wrap">{text}</div>
        <div
          className={`text-[10px] mt-1 ${own ? "text-emerald-700/70" : "text-gray-500/80"} text-right`}
        >
          {time}
        </div>
      </div>
    </div>
  );
}
