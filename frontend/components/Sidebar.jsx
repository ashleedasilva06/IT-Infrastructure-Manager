"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" },
  { href: "/devices", label: "Devices", icon: "M20 2H4c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 6H4V4h16v4zM4 14h16c1.1 0 2-.9 2-2v-.01c0-1.1-.9-1.99-2-1.99H4c-1.1 0-2 .89-2 1.99V12c0 1.1.9 2 2 2zm0 8h16c1.1 0 2-.9 2-2v-.01c0-1.1-.9-1.99-2-1.99H4c-1.1 0-2 .89-2 1.99V20c0 1.1.9 2 2 2z" },
  { href: "/alerts", label: "Alerts", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" },
  { href: "/maintenance", label: "Maintenance", icon: "M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" },
  { href: "/assignments", label: "Assignments", icon: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" },
  { href: "/history", label: "Device History", icon: "M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" },
  { href: "/reports", label: "Reports", icon: "M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" },
  { href: "/activity", label: "Activity Log", icon: "M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" },
  { href: "/profile", label: "Profile", icon: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" },
];

const ADMIN_NAV = [
  { href: "/network", label: "Network Scanner", icon: "M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" },
  { href: "/users", label: "Users", icon: "M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" },
];

export default function Sidebar({ onClose }) {
  const pathname = usePathname();
  const { user, logout, theme, toggleTheme } = useAuth();
  const isDark = theme === "dark";

  const handleNav = () => { if (onClose) onClose(); };

  const NavLink = ({ href, label, icon }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        onClick={handleNav}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
        style={{
          background: active ? "rgba(99,102,241,0.15)" : "transparent",
          color: active ? "#818cf8" : "var(--text-muted)",
        }}
        onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "var(--hover-bg)"; e.currentTarget.style.color = "var(--text-primary)"; }}}
        onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}}
      >
        <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d={icon} />
        </svg>
        {label}
      </Link>
    );
  };

  return (
    <aside className="sidebar w-56 flex flex-col h-screen">
      {/* Brand */}
      <div className="px-5 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 6H4V4h16v4zM4 14h16c1.1 0 2-.9 2-2v-.01c0-1.1-.9-1.99-2-1.99H4c-1.1 0-2 .89-2 1.99V12c0 1.1.9 2 2 2zm0 8h16c1.1 0 2-.9 2-2v-.01c0-1.1-.9-1.99-2-1.99H4c-1.1 0-2 .89-2 1.99V20c0 1.1.9 2 2 2z"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold leading-tight" style={{ color: "var(--text-primary)" }}>IT Manager</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Infrastructure</p>
          </div>
        </div>
        {/* Close button mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg"
            style={{ color: "var(--text-muted)" }}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => <NavLink key={item.href} {...item} />)}

        {user?.role === "admin" && (
          <>
            <div className="pt-4 pb-1 px-3">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-faint)" }}>Admin</p>
            </div>
            {ADMIN_NAV.map((item) => <NavLink key={item.href} {...item} />)}
          </>
        )}
      </nav>

      {/* Bottom */}
      <div className="px-4 py-4" style={{ borderTop: "1px solid var(--border)" }}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition mb-3"
          style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}
        >
          <span>{isDark ? "Dark Mode" : "Light Mode"}</span>
          <div className="w-9 h-5 rounded-full relative transition-colors" style={{ background: isDark ? "#6366f1" : "var(--border)" }}>
            <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all" style={{ left: isDark ? "18px" : "2px" }} />
          </div>
        </button>

        {/* User */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>{user?.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-md font-semibold capitalize ${
              user?.role === "admin" ? "bg-indigo-500/20 text-indigo-400" : "bg-slate-500/20 text-slate-400"
            }`}>
              {user?.role}
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 text-xs font-semibold rounded-lg py-2 transition"
          style={{ border: "1px solid var(--border)", color: "var(--text-muted)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; e.currentTarget.style.borderColor = "var(--text-muted)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}