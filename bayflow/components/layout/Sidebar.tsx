"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  ListOrdered,
  PlusCircle,
  Users,
  Settings,
  LogOut,
  CreditCard,
  BarChart3,
  Calendar,
  Wrench
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/queue", label: "Live Queue", icon: ListOrdered },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/jobs/new", label: "New Job", icon: PlusCircle },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

const adminItems = [
  ...navItems,
  { href: "/team", label: "Team", icon: Users },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

import { X } from "lucide-react";

export function Sidebar({ open, setOpen }: { open?: boolean, setOpen?: (val: boolean) => void }) {
  const pathname = usePathname();
  const { isAdmin } = useUserRole();
  const { logout } = useAuth();
  const router = useRouter();

  const itemsToRender = isAdmin ? adminItems : navItems;

  const handleLogout = () => {
    logout();
    router.push('/login');
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setOpen?.(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:w-20 md:flex md:flex-col md:items-center py-6 md:py-8 gap-8 shrink-0 flex flex-col",
        open ? "translate-x-0 block" : "-translate-x-full md:block"
      )}>
        <div className="flex items-center justify-between px-6 md:px-0 w-full md:justify-center text-primary">
          <div className="flex items-center gap-3">
            <Wrench className="h-8 w-8" />
            <span className="font-extrabold text-xl tracking-tight md:hidden">Bayflow</span>
          </div>
          <button className="md:hidden text-slate-400 hover:text-slate-600" onClick={() => setOpen?.(false)}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex flex-col gap-2 md:gap-6 flex-1 mt-4 px-4 md:px-0 w-full">
          {itemsToRender.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                onClick={() => setOpen?.(false)}
                className={cn(
                  "group flex items-center md:justify-center rounded-xl p-3 transition-all outline-none",
                  isActive
                    ? "bg-primary/10 text-primary md:shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-primary"
                )}
              >
                <Icon className={cn("h-6 w-6 shrink-0 transition-transform group-hover:scale-110", isActive && "scale-110")} />
                <span className="ml-3 font-semibold md:hidden">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-2 md:gap-6 w-full px-4">
          {isAdmin && (
            <Link
              href="/settings"
              title="Settings"
              onClick={() => setOpen?.(false)}
              className={cn(
                "group flex md:mx-auto items-center md:justify-center rounded-xl p-3 transition-all",
                pathname.startsWith('/settings')
                  ? "bg-primary/10 text-primary md:shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-primary"
              )}
            >
              <Settings className="h-6 w-6 shrink-0 transition-transform group-hover:scale-110" />
              <span className="ml-3 font-semibold md:hidden">Settings</span>
            </Link>
          )}
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="group flex md:mx-auto items-center md:justify-center rounded-xl p-3 text-slate-500 transition-all hover:bg-red-50 hover:text-red-500 w-full text-left"
          >
            <LogOut className="h-6 w-6 shrink-0 transition-transform group-hover:scale-110" />
            <span className="ml-3 font-semibold md:hidden">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
