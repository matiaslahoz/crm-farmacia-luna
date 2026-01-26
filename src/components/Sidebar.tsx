"use client";

import Link from "next/link";
// import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  MessagesSquare,
  LogOut,
  type LucideIcon,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Gauge,
  BookOpenText,
  ShoppingBag,
  Pill,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function NavItem({
  href,
  icon: Icon,
  label,
  collapsed,
  onNavigate,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={label}
      className={`group relative flex items-center rounded-xl px-3 py-3 transition-all duration-200 ease-out
        ${
          active
            ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/25"
            : "text-slate-600 hover:bg-purple-50 hover:text-purple-700"
        }`}
    >
      {/* Indicador activo lateral */}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full opacity-80" />
      )}

      {/* Ícono */}
      <Icon
        className={`size-5 shrink-0 transition-transform duration-200 ${
          collapsed ? "mx-auto" : "mr-3"
        } ${!active && "group-hover:scale-110"}`}
        strokeWidth={active ? 2.5 : 2}
      />

      {/* Texto solo si está expandido */}
      {!collapsed && (
        <span className="truncate font-medium text-sm">{label}</span>
      )}
    </Link>
  );
}

function AppLogo({
  collapsed,
  mobile,
}: {
  collapsed: boolean;
  mobile?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 px-2 ${mobile ? "mb-2" : ""}`}>
      {/* Logo de la app */}
      <div className="relative">
        <div className="h-10 w-10 rounded-xl overflow-hidden shadow-lg shadow-purple-500/20 ring-2 ring-purple-100">
          {/* <Image
            src="/logo.jpg"
            alt="La Cantera"
            width={40}
            height={40}
            className="object-cover w-full h-full"
          /> */}
        </div>
        {/* Punto de estado online */}
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
      </div>

      {/* Nombre de la app */}
      {(!collapsed || mobile) && (
        <div className="flex flex-col">
          <span className="text-base font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
            Farmacia Luna
          </span>
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false); // Default open/closed pref
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // guardar/restaurar preferencia
  useEffect(() => {
    // Solo restaurar en desktop para evitar conflictos iniciales
    if (window.innerWidth >= 768) {
      const saved = localStorage.getItem("sidebar:collapsed");
      if (saved !== null) setCollapsed(saved === "1");
    } else {
      setCollapsed(false); // En mobile siempre expandido cuando se abre
    }
  }, []);

  useEffect(() => {
    if (window.innerWidth >= 768) {
      localStorage.setItem("sidebar:collapsed", collapsed ? "1" : "0");
    }
  }, [collapsed]);

  const handleMobileNav = () => {
    setIsMobileOpen(false);
  };

  const desktopWidth = collapsed ? "md:w-[72px]" : "md:w-64";

  return (
    <>
      {/* Mobile Header - Fixed positioned */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 flex items-center gap-3">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 -ml-2 text-slate-600 hover:text-purple-600 transition-colors rounded-lg"
        >
          <Menu className="size-6" />
        </button>

        <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
          Farmacia Luna
        </span>
      </div>

      {/* Backdrop for Mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`
          fixed md:relative z-50 h-full
          bg-white/95 backdrop-blur-xl border-r border-slate-200/60 
          transition-all duration-300 ease-out shadow-2xl md:shadow-sm
          ${desktopWidth} w-64
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          flex flex-col gap-4 p-3 overflow-hidden
        `}
      >
        {/* Header con Logo y botón cerrar en mobile */}
        <div className="flex items-center justify-between">
          <AppLogo collapsed={collapsed} mobile={isMobileOpen} />
          {/* Close button mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Separador */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mx-2" />

        {/* Botón expandir/contraer (Solo Desktop) */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={`hidden md:flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 text-sm 
                      text-slate-500 hover:text-purple-600 hover:bg-purple-50 hover:border-purple-300
                      transition-all duration-200 group ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Expandir menú" : "Contraer menú"}
        >
          {collapsed ? (
            <ChevronRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
          ) : (
            <>
              <ChevronLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="font-medium">Contraer</span>
            </>
          )}
        </button>

        {/* Navegación */}
        <nav className="flex flex-col gap-1.5 flex-1 overflow-y-auto">
          <NavItem
            href="/dashboard"
            icon={Gauge}
            label="Dashboard"
            collapsed={collapsed && !isMobileOpen}
            onNavigate={handleMobileNav}
          />
          <NavItem
            href="/chats"
            icon={MessagesSquare}
            label="Chats"
            collapsed={collapsed && !isMobileOpen}
            onNavigate={handleMobileNav}
          />
          <NavItem
            href="/pedidos"
            icon={ShoppingBag}
            label="Pedidos"
            collapsed={collapsed && !isMobileOpen}
            onNavigate={handleMobileNav}
          />
          <NavItem
            href="/productos"
            icon={Pill}
            label="Productos"
            collapsed={collapsed && !isMobileOpen}
            onNavigate={handleMobileNav}
          />
          <NavItem
            href="/conocimiento"
            icon={BookOpenText}
            label="Conocimiento"
            collapsed={collapsed && !isMobileOpen}
            onNavigate={handleMobileNav}
          />
        </nav>

        {/* Footer con logout */}
        <div className="mt-auto">
          {/* Separador */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mx-2 mb-3" />

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              location.href = "/login";
            }}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-slate-500 
                        hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full group
                        ${collapsed && !isMobileOpen ? "justify-center" : ""}`}
            title="Cerrar sesión"
          >
            <LogOut className="size-4 group-hover:scale-110 transition-transform" />
            {(!collapsed || isMobileOpen) && (
              <span className="font-medium">Cerrar sesión</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
