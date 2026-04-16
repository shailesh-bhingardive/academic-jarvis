import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  BookOpen,
  Bot,
  TrendingUp,
  FileText,
  Search,
} from "lucide-react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/students", label: "Students", icon: Users },
  { to: "/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/marks", label: "Marks", icon: BookOpen },
  { to: "/predictions", label: "Predictions", icon: TrendingUp },
  { to: "/jarvis", label: "Jarvis AI", icon: Bot },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/search", label: "Search", icon: Search },
] as const;

export function AppSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transform transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm">
            SA
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">Student Attendance</h1>
            <p className="text-xs text-sidebar-accent-foreground/60">Management System</p>
          </div>
        </div>

        <nav className="mt-4 px-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-0 right-0 px-6">
          <div className="rounded-lg bg-sidebar-accent/50 p-3">
            <p className="text-xs font-medium text-sidebar-accent-foreground">TYBSc CS Project</p>
            <p className="text-[10px] text-sidebar-accent-foreground/60 mt-0.5">Final Year 2025</p>
          </div>
        </div>
      </aside>
    </>
  );
}
