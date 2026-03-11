"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }) {
  const { token, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !token) router.push("/login");
  }, [token, loading]);

  if (loading || !token) return null;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-screen z-40 transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main */}
      <div className="lg:ml-56 min-h-screen flex flex-col">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 sticky top-0 z-20"
          style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg transition"
            style={{ background: "var(--bg-card)", color: "var(--text-secondary)" }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 6H4V4h16v4zM4 14h16c1.1 0 2-.9 2-2v-.01c0-1.1-.9-1.99-2-1.99H4c-1.1 0-2 .89-2 1.99V12c0 1.1.9 2 2 2zm0 8h16c1.1 0 2-.9 2-2v-.01c0-1.1-.9-1.99-2-1.99H4c-1.1 0-2 .89-2 1.99V20c0 1.1.9 2 2 2z"/>
              </svg>
            </div>
            <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>IT Manager</span>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-screen-2xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}