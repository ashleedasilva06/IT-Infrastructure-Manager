"use client";
import { useEffect } from "react";

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ value }) {
  const map = {
    online: "bg-green-500/15 text-green-500 border-green-500/30",
    offline: "bg-red-500/15 text-red-500 border-red-500/30",
    maintenance: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    open: "bg-red-500/15 text-red-500 border-red-500/30",
    in_progress: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    resolved: "bg-green-500/15 text-green-500 border-green-500/30",
    unread: "bg-red-500/15 text-red-500 border-red-500/30",
    read: "bg-slate-500/15 text-slate-500 border-slate-500/30",
    admin: "bg-indigo-500/15 text-indigo-500 border-indigo-500/30",
    user: "bg-slate-500/15 text-slate-500 border-slate-500/30",
  };
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-md border capitalize ${map[value] || "bg-slate-500/15 text-slate-500 border-slate-500/30"}`}>
      {value?.replace("_", " ")}
    </span>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <div
        className="rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{title}</h3>
          <button onClick={onClose} style={{ color: "var(--text-muted)" }} className="hover:opacity-70 transition">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
export function Field({ label, children }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`input-base ${className}`}
    />
  );
}

export function Select({ children, ...props }) {
  return (
    <select
      {...props}
      className="input-base"
      style={{ background: "var(--input-bg)", color: "var(--text-primary)" }}
    >
      {children}
    </select>
  );
}

export function Textarea({ ...props }) {
  return (
    <textarea
      {...props}
      className="input-base resize-y min-h-[80px]"
    />
  );
}

// ─── Search ───────────────────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} fill="currentColor" viewBox="0 0 24 24">
        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-base pl-9 pr-4"
      />
    </div>
  );
}

// ─── Buttons ──────────────────────────────────────────────────────────────────
export function Btn({ variant = "primary", className = "", children, ...props }) {
  const base = "inline-flex items-center gap-1.5 font-semibold text-sm rounded-lg px-4 py-2 transition cursor-pointer disabled:opacity-50";
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white",
    danger: "bg-red-600 hover:bg-red-500 text-white",
    outline: "border text-sm font-semibold rounded-lg px-4 py-2 transition",
    ghost: "hover:opacity-70",
  };

  if (variant === "outline") {
    return (
      <button
        className={`${base} ${className}`}
        style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

// ─── ErrorAlert ───────────────────────────────────────────────────────────────
export function ErrorAlert({ message }) {
  if (!message) return null;
  return (
    <div className="bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg px-4 py-3 text-sm mb-4">
      {message}
    </div>
  );
}

// ─── PageHeader ───────────────────────────────────────────────────────────────
export function PageHeader({ title, action }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{title}</h1>
      {action}
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────
export function Table({ headers, children, empty }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse min-w-[600px]">
          <thead>
            <tr style={{ background: "var(--bg-secondary)" }}>
              {headers.map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                  {h === "checkbox" ? "" : h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {children}
            {empty && (
              <tr>
                <td colSpan={headers.length} className="px-4 py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Tr({ children }) {
  return (
    <tr
      className="transition"
      style={{ borderTop: "1px solid var(--border-subtle)" }}
      onMouseEnter={(e) => e.currentTarget.style.background = "var(--hover-bg)"}
      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
    >
      {children}
    </tr>
  );
}

export function Td({ children, mono = false }) {
  return (
    <td
      className={`px-4 py-3 ${mono ? "font-mono text-xs" : ""}`}
      style={{ color: mono ? "var(--text-muted)" : "var(--text-secondary)" }}
    >
      {children}
    </td>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, color }) {
  const border = {
    indigo: "border-l-indigo-500", green: "border-l-green-500",
    red: "border-l-red-500", amber: "border-l-amber-500",
    cyan: "border-l-cyan-500", orange: "border-l-orange-500",
    purple: "border-l-purple-500", yellow: "border-l-yellow-500",
  };
  const text = {
    indigo: "text-indigo-500", green: "text-green-500", red: "text-red-500",
    amber: "text-amber-500", cyan: "text-cyan-500", orange: "text-orange-500",
    purple: "text-purple-500", yellow: "text-yellow-500",
  };
  return (
    <div className={`card border-l-4 ${border[color]} p-5`}>
      <div className={`text-3xl font-extrabold leading-none ${text[color]}`}>{value ?? "—"}</div>
      <div className="text-xs mt-2 font-medium" style={{ color: "var(--text-muted)" }}>{label}</div>
    </div>
  );
}

// ─── useAutoRefresh ───────────────────────────────────────────────────────────
export function useAutoRefresh(callback, intervalMs = 30000) {
  useEffect(() => {
    const id = setInterval(callback, intervalMs);
    return () => clearInterval(id);
  }, [callback, intervalMs]);
}