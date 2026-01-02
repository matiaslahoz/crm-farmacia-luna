export default function SessionAvatar({ name, phone, size = 40 }: {
    name?: string | null; phone?: number | string | null; size?: number;
  }) {
    const initials = (() => {
      const n = (name || '').trim();
      if (n) return n.split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('');
      const s = String(phone ?? ''); return s.slice(-2);
    })();
  
    return (
      <div
        className="rounded-full bg-gray-900 text-white grid place-items-center text-sm font-semibold"
        style={{ width: size, height: size }}
      >
        {initials}
      </div>
    );
  }
  