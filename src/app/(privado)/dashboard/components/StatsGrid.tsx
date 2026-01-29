import StatCard from "./StatCard";
import {
  MessageSquare,
  Users,
  AlertTriangle,
  ShoppingCart,
} from "lucide-react";

export default function StatsGrid({
  todayConvos,
  newNumbersToday,
  needsHuman,
  ordersToday,
}: {
  todayConvos: number;
  newNumbersToday: number;
  needsHuman: number;
  ordersToday: number;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        title="Conversaciones de hoy"
        value={todayConvos}
        icon={<MessageSquare className="h-5 w-5" />}
        accentClass="bg-blue-100 text-blue-700"
      />
      <StatCard
        title="Números nuevos hoy"
        value={newNumbersToday}
        icon={<Users className="h-5 w-5" />}
        accentClass="bg-emerald-100 text-emerald-700"
      />
      <StatCard
        title="Pedidos que requieren atención"
        value={needsHuman}
        hint="derivadas a humano"
        icon={<AlertTriangle className="h-5 w-5" />}
        accentClass="bg-amber-100 text-amber-700"
      />
      <StatCard
        title="Pedidos de hoy"
        value={ordersToday}
        icon={<ShoppingCart className="h-5 w-5" />}
        accentClass="bg-violet-100 text-violet-700"
      />
    </div>
  );
}
