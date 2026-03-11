"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { createApi } from "@/lib/api";
import AppLayout from "@/components/AppLayout";
import { PageHeader, Table, Tr, Td, SearchBar, Select, useAutoRefresh } from "@/components/ui";

const ACTION_COLORS = {
  "Created": "bg-green-500/15 text-green-500 border-green-500/30",
  "Updated": "bg-blue-500/15 text-blue-500 border-blue-500/30",
  "Deleted": "bg-red-500/15 text-red-500 border-red-500/30",
  "Assigned": "bg-purple-500/15 text-purple-500 border-purple-500/30",
  "Login": "bg-indigo-500/15 text-indigo-500 border-indigo-500/30",
  "default": "bg-slate-500/15 text-slate-500 border-slate-500/30",
};

const ENTITY_ICONS = {
  device: "M20 2H4c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 6H4V4h16v4zM4 14h16c1.1 0 2-.9 2-2v-.01c0-1.1-.9-1.99-2-1.99H4c-1.1 0-2 .89-2 1.99V12c0 1.1.9 2 2 2zm0 8h16c1.1 0 2-.9 2-2v-.01c0-1.1-.9-1.99-2-1.99H4c-1.1 0-2 .89-2 1.99V20c0 1.1.9 2 2 2z",
  user: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  maintenance: "M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z",
  assignment: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z",
  alert: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
};

function getActionColor(action) {
  const key = Object.keys(ACTION_COLORS).find(k => action?.startsWith(k));
  return ACTION_COLORS[key] || ACTION_COLORS.default;
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ActivityPage() {
  const { token } = useAuth();
  const api = createApi(token);
  const [logs, setLogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const LIMIT = 25;

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        skip: page * LIMIT,
        limit: LIMIT,
        ...(entityFilter !== "all" && { entity_type: entityFilter }),
      });
      const data = await api.get(`/activity/?${params}`);
      setLogs(data.logs);
      setTotal(data.total);
      setLastUpdated(new Date());
    } catch (e) { console.error(e); }
  }, [token, page, entityFilter]);

  useEffect(() => { if (token) load(); }, [token, page, entityFilter]);
  useAutoRefresh(load, 30000);

  useEffect(() => {
    if (!search) { setFiltered(logs); return; }
    const s = search.toLowerCase();
    setFiltered(logs.filter(l =>
      l.action?.toLowerCase().includes(s) ||
      l.user_name?.toLowerCase().includes(s) ||
      l.entity_name?.toLowerCase().includes(s) ||
      l.details?.toLowerCase().includes(s) ||
      l.entity_type?.toLowerCase().includes(s)
    ));
  }, [logs, search]);

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <AppLayout>
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <span>Activity Log</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border"
              style={{ background: "var(--bg-secondary)", color: "var(--text-muted)", borderColor: "var(--border)" }}>
              {total} entries
            </span>
          </div>
        }
      />

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by action, user, entity..." />
        <Select value={entityFilter} onChange={(e) => { setEntityFilter(e.target.value); setPage(0); }}>
          <option value="all">All Types</option>
          <option value="device">Devices</option>
          <option value="user">Users</option>
          <option value="maintenance">Maintenance</option>
          <option value="assignment">Assignments</option>
          <option value="alert">Alerts</option>
        </Select>
      </div>

      {/* Last updated */}
      {lastUpdated && (
        <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
          Auto-refreshes every 30s · Last: {lastUpdated.toLocaleTimeString()}
        </p>
      )}

      {/* Timeline view */}
      <div className="space-y-2 mb-6">
        {filtered.map((log) => {
          const iconPath = ENTITY_ICONS[log.entity_type] || ENTITY_ICONS.device;
          const actionColor = getActionColor(log.action);
          return (
            <div
              key={log.id}
              className="card px-5 py-4 flex items-start gap-4 transition"
              style={{ borderLeft: "3px solid var(--border)" }}
            >
              {/* Entity icon */}
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: "var(--bg-secondary)" }}>
                <svg className="w-4 h-4" style={{ color: "var(--text-muted)" }} fill="currentColor" viewBox="0 0 24 24">
                  <path d={iconPath} />
                </svg>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md border ${actionColor}`}
                  >
                    {log.action}
                  </span>
                  {log.entity_name && (
                    <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      {log.entity_name}
                    </span>
                  )}
                </div>
                {log.details && (
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{log.details}</p>
                )}
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {log.user_name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                      {log.user_name || "System"}
                    </span>
                  </div>
                  {log.ip_address && (
                    <span className="text-xs font-mono" style={{ color: "var(--text-faint)" }}>
                      {log.ip_address}
                    </span>
                  )}
                </div>
              </div>

              {/* Time */}
              <div className="text-right shrink-0">
                <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                  {timeAgo(log.created_at)}
                </p>
                <p className="text-xs mt-0.5 font-mono" style={{ color: "var(--text-faint)" }}>
                  {new Date(log.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="card p-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            No activity found.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Page {page + 1} of {totalPages} · {total} total entries
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition disabled:opacity-30"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
              ← Prev
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition"
                  style={{
                    background: page === pageNum ? "#6366f1" : "transparent",
                    color: page === pageNum ? "white" : "var(--text-secondary)",
                    borderColor: page === pageNum ? "#6366f1" : "var(--border)",
                  }}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border transition disabled:opacity-30"
              style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}