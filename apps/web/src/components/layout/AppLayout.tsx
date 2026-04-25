"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SessionUser } from "@/lib/session";
import LogoutButton from "@/components/auth/LogoutButton";
import NotificacionesBell from "@/components/layout/NotificacionesBell";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  roles: string[];
}

const rootNavItems: NavItem[] = [
  { href: "/dashboard", label: "Panel", icon: "dashboard", roles: ["Root"] },
  { href: "/admin/usuarios", label: "Usuarios", icon: "group", roles: ["Root"] },
  { href: "/admin/roles", label: "Roles y Permisos", icon: "verified_user", roles: ["Root"] },
  { href: "/admin/motos", label: "Motos", icon: "two_wheeler", roles: ["Root"] },
  { href: "/admin/ajustes", label: "Ajustes del Sistema", icon: "settings", roles: ["Root"] },
  { href: "/admin/logs", label: "Registros", icon: "history", roles: ["Root"] },
];

const adminNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard", roles: ["Administrador"] },
  { href: "/secretaria/inventario", label: "Inventario", icon: "inventory_2", roles: ["Administrador"] },
  { href: "/ventas", label: "Ventas", icon: "receipt_long", roles: ["Administrador"] },
  { href: "/clientes", label: "Clientes", icon: "group", roles: ["Administrador"] },
  { href: "/pagos", label: "Pagos", icon: "payments", roles: ["Administrador"] },
  { href: "/devoluciones", label: "Devoluciones", icon: "assignment_return", roles: ["Administrador"] },
  { href: "/precios", label: "Precios", icon: "price_change", roles: ["Administrador"] },
  { href: "/caja", label: "Cierre de Caja", icon: "point_of_sale", roles: ["Administrador"] },
  { href: "/rutas", label: "Rutas", icon: "route", roles: ["Administrador"] },
  { href: "/productos", label: "Productos", icon: "egg_alt", roles: ["Administrador"] },
  { href: "/admin/motos", label: "Motos", icon: "two_wheeler", roles: ["Administrador"] },
  { href: "/reportes", label: "Reportes", icon: "analytics", roles: ["Administrador"] },
];

const secretariaNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard", roles: ["Secretaria"] },
  { href: "/secretaria/inventario", label: "Inventario", icon: "inventory_2", roles: ["Secretaria"] },
  { href: "/secretaria/movimientos", label: "Movimientos", icon: "swap_horiz", roles: ["Secretaria"] },
  { href: "/ventas", label: "Ventas", icon: "receipt_long", roles: ["Secretaria"] },
  { href: "/clientes", label: "Clientes", icon: "group", roles: ["Secretaria"] },
  { href: "/pagos", label: "Pagos", icon: "payments", roles: ["Secretaria"] },
  { href: "/devoluciones", label: "Devoluciones", icon: "assignment_return", roles: ["Secretaria"] },
  { href: "/precios", label: "Precios", icon: "price_change", roles: ["Secretaria"] },
  { href: "/caja", label: "Cierre de Caja", icon: "point_of_sale", roles: ["Secretaria"] },
  { href: "/rutas", label: "Rutas", icon: "route", roles: ["Secretaria"] },
  { href: "/productos", label: "Productos", icon: "egg_alt", roles: ["Secretaria"] },
];

const domiciliarioNavItems: NavItem[] = [
  { href: "/dashboard", label: "Inicio", icon: "home", roles: ["Domiciliario"] },
  { href: "/rutas", label: "Mi Ruta", icon: "route", roles: ["Domiciliario"] },
  { href: "/ventas", label: "Registrar Venta", icon: "receipt_long", roles: ["Domiciliario"] },
  { href: "/pagos", label: "Registrar Pago", icon: "payments", roles: ["Domiciliario"] },
  { href: "/devoluciones", label: "Devoluciones", icon: "assignment_return", roles: ["Domiciliario"] },
];

function getInitials(user: SessionUser) {
  return (user.name ?? user.email)
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function BrandMark({ subtitle }: { subtitle: string }) {
  return (
    <div className="flex flex-col gap-0">
      <div className="w-5 h-0.5 bg-[#d4af37] mb-3 rounded-full" />
      <h1 className="text-[17px] font-black tracking-[-0.04em] text-[#735c00] leading-none">
        ORO CAMPO
      </h1>
      <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#1c1b1b]/30 mt-2">
        {subtitle}
      </p>
    </div>
  );
}

function UserCard({ user, initials }: { user: SessionUser; initials: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#1c1b1b]/[0.025] border border-[#1c1b1b]/[0.05]">
      <div className="w-8 h-8 rounded-full bg-[#d4af37]/15 ring-1 ring-[#d4af37]/30 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-[#735c00]">{initials}</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="text-xs font-semibold text-[#1c1b1b] truncate leading-tight">
          {user.name ?? user.email}
        </p>
        <p className="text-[9px] font-medium text-[#1c1b1b]/40 uppercase tracking-[0.1em] mt-0.5">
          {user.role}
        </p>
      </div>
      <LogoutButton iconOnly />
    </div>
  );
}

export default function AppLayout({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isRoot = user.role === "Root";
  const navItems = isRoot ? rootNavItems
    : user.role === "Administrador" ? adminNavItems
    : user.role === "Secretaria" ? secretariaNavItems
    : domiciliarioNavItems;
  const visibleItems = navItems.filter((item) => item.roles.includes(user.role));
  const initials = getInitials(user);

  function isActive(href: string) {
    return pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  }

  if (isRoot) {
    return (
      <div className="flex min-h-screen bg-[#fcf9f8]">
        <aside className="h-screen w-72 rounded-r-[2rem] sticky top-0 left-0 flex flex-col gap-2 p-6 bg-white shadow-[1px_0_32px_rgba(28,27,27,0.06)] border-r border-[#1c1b1b]/[0.055] z-40 shrink-0">
          <div className="mb-8 px-4">
            <BrandMark subtitle="Sistema de Gestión" />
          </div>

          <nav className="flex flex-col gap-0.5 flex-grow">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive(item.href) ? "nav-item-active" : ""}`}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: "1.125rem",
                    ...(isActive(item.href) ? { fontVariationSettings: "'FILL' 1" } : {}),
                  }}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-5 border-t border-[#1c1b1b]/[0.05]">
            <UserCard user={user} initials={initials} />
          </div>
        </aside>

        <main className="flex-grow flex flex-col min-h-screen overflow-auto">
          <header className="w-full sticky top-0 z-50 bg-[#fcf9f8]/85 backdrop-blur-xl flex items-center justify-end px-10 py-4 border-b border-[#1c1b1b]/[0.06]">
            <div className="flex items-center gap-1 text-[#1c1b1b]/40">
              <NotificacionesBell />
              <button className="hover:text-[#735c00] transition-colors p-2 rounded-xl hover:bg-[#735c00]/[0.05]">
                <span className="material-symbols-outlined">help_outline</span>
              </button>
            </div>
          </header>
          <div className="p-10 flex flex-col gap-8">{children}</div>
        </main>
      </div>
    );
  }

  // ── Operational Layout ──────────────────────────────────────────────────────

  const SidebarContent = () => (
    <div className="flex flex-col gap-2 p-6 h-full">
      <div className="mb-8">
        <BrandMark subtitle="Distribución Premium" />
      </div>

      <nav className="flex-1 flex flex-col gap-0.5">
        {visibleItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`nav-item ${isActive(item.href) ? "nav-item-active" : ""}`}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: "1.125rem",
                ...(isActive(item.href) ? { fontVariationSettings: "'FILL' 1" } : {}),
              }}
            >
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-2 pt-5 border-t border-[#1c1b1b]/[0.05]">
        {["Administrador", "Secretaria"].includes(user.role) && (
          <Link
            href="/ventas"
            onClick={() => setMobileOpen(false)}
            className="w-full bg-[#735c00] text-white rounded-full py-2.5 font-semibold text-sm shadow-sm hover:opacity-90 active:scale-95 transition-all text-center block tracking-[-0.01em]"
          >
            Nueva Venta
          </Link>
        )}
        <UserCard user={user} initials={initials} />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#fcf9f8]">
      <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 flex-col bg-white border-r border-[#1c1b1b]/[0.055] z-50">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="w-72 h-full bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent />
          </aside>
        </div>
      )}

      <main className="md:ml-64 min-h-screen flex-1">
        <header className="sticky top-0 z-40 flex justify-between items-center w-full px-6 md:px-8 h-14 bg-[#fcf9f8]/90 backdrop-blur-xl border-b border-[#1c1b1b]/[0.06]">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded-xl text-[#735c00] hover:bg-[#735c00]/[0.07] transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <NotificacionesBell />
            <button className="text-[#1c1b1b]/40 hover:text-[#735c00] transition-colors p-2 rounded-xl hover:bg-[#735c00]/[0.05]">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-[#d4af37]/15 ring-1 ring-[#d4af37]/30 flex items-center justify-center ml-1">
              <span className="text-xs font-bold text-[#735c00]">{initials}</span>
            </div>
          </div>
        </header>

        <div className="p-6 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8">
          {children}
        </div>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#fcf9f8]/95 backdrop-blur-lg border-t border-[#1c1b1b]/[0.06] flex items-center justify-around px-2 z-50">
          {visibleItems.slice(0, 5).map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
                  active ? "text-[#735c00]" : "text-[#1c1b1b]/35"
                }`}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: "1.25rem",
                    ...(active ? { fontVariationSettings: "'FILL' 1" } : {}),
                  }}
                >
                  {item.icon}
                </span>
                <span className="text-[9px] font-semibold tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
