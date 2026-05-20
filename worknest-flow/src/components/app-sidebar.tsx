import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  UserCog,
  Calendar,
  Wallet,
  PiggyBank,
  FileBarChart,
  Settings,
  LogOut,
  TrendingUp as AnalyticsIcon,
} from "lucide-react";
import logo from "@/assets/worknest-logo.png";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/employees", label: "All Employees", icon: Users },
  { to: "/employees/full-time", label: "Full-Time", icon: UserCheck },
  { to: "/employees/part-time", label: "Part-Time", icon: UserCog },
  { to: "/part-time-analytics", label: "Analytics", icon: AnalyticsIcon },
  { to: "/attendance", label: "Attendance", icon: Calendar },
  { to: "/salary", label: "Salary Records", icon: Wallet },
  { to: "/advance", label: "Advance Salary", icon: PiggyBank },
  { to: "/reports", label: "Reports", icon: FileBarChart },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, signOut } = useAuth();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-gradient-sidebar text-sidebar-foreground md:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <img src={logo} alt="WorkNest" width={36} height={36} className="rounded-md" />
        <div>
          <div className="font-display text-lg font-bold leading-tight">WorkNest</div>
          <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">
            Workforce OS
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-3">
        {nav.map((item) => {
          const active = path === item.to || (item.to !== "/dashboard" && path.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-sidebar-accent text-sidebar-foreground shadow-soft"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="mb-2 truncate px-2 text-xs text-sidebar-foreground/60">{user?.email}</div>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent/50"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </aside>
  );
}
