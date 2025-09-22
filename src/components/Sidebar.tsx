// src/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  ShoppingCart,
  LogOut,
  PanelLeftOpen,
  PanelLeftClose,
  type LucideIcon,
  BookOpen,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function NavItem({
  href,
  icon: Icon,
  label,
  collapsed,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      title={label}
      className={`group flex items-center rounded-xl px-3 py-2.5 transition-colors
        ${active ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"}`}
    >
      {/* Ícono siempre visible */}
      <Icon className={`size-5 shrink-0 ${collapsed ? "mx-auto" : "mr-3"}`} />
      {/* Texto solo si está expandido */}
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

export default function Sidebar() {
  // colapsado por defecto
  const [collapsed, setCollapsed] = useState(true);

  // guardar/restaurar preferencia (opcional)
  useEffect(() => {
    const saved = localStorage.getItem("sidebar:collapsed");
    if (saved !== null) setCollapsed(saved === "1");
  }, []);
  useEffect(() => {
    localStorage.setItem("sidebar:collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  const width = collapsed ? "w-16" : "w-60";

  return (
    <aside
      className={`bg-white border-r border-gray-200 p-3 flex flex-col gap-3 ${width}
                  transition-[width] duration-200 overflow-hidden`}
    >
      {/* encabezado */}
      <div className="flex items-center gap-2 px-1">
        <div className="h-9 w-9 rounded-xl bg-gray-900 text-white grid place-items-center font-bold">
          CRM
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold text-gray-800">Chatbot</span>
        )}
      </div>

      {/* botón abrir/cerrar */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-lg border text-sm hover:bg-gray-50"
        title={collapsed ? "Abrir menú" : "Cerrar menú"}
      >
        {collapsed ? (
          <PanelLeftOpen className="size-4" />
        ) : (
          <PanelLeftClose className="size-4" />
        )}
        {!collapsed && <span>Menú</span>}
      </button>

      <nav className="flex flex-col gap-1 mt-1">
        <NavItem
          href="/dashboard"
          icon={LayoutDashboard}
          label="Dashboard"
          collapsed={collapsed}
        />
        <NavItem
          href="/chats"
          icon={MessageSquare}
          label="Chats"
          collapsed={collapsed}
        />
        <NavItem
          href="/pedidos"
          icon={ShoppingCart}
          label="Pedidos"
          collapsed={collapsed}
        />
        <NavItem
          href="/conocimiento"
          icon={BookOpen}
          label="Conocimiento"
          collapsed={collapsed}
        />
      </nav>

      <div className="mt-auto">
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            location.href = "/login";
          }}
          className="flex items-center cursor-pointer gap-2 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100 w-full"
          title="Cerrar sesión"
        >
          <LogOut className="size-4" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
