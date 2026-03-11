"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { createApi } from "@/lib/api";
import AppLayout from "@/components/AppLayout";
import { Badge, Btn, PageHeader, Table, Tr, Td, SearchBar, Select, useAutoRefresh } from "@/components/ui";

export default function AlertsPage() {
  const { token } = useAuth();
  const api = createApi(token);
  const [alerts, setAlerts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await api.get("/alerts/");
      setAlerts(data);
      setLastUpdated(new Date());
    } catch (e) { console.error(e); }
  }, [token]);

  useEffect(() => { if (token) load(); }, [token]);
  useAutoRefresh(load, 30000);

  useEffect(() => {
    let result = [...alerts];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(a =>
        a.message?.toLowerCase().includes(s) ||
        String(a.device_id).includes(s)
      );
    }
    if (statusFilter !== "all") result = result.filter(a => a.status === statusFilter);
    setFiltered(result);
  }, [alerts, search, statusFilter]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/alerts/${id}`, { status });
      await load();
    } catch (e) { alert(e.message); }
  };

  const unreadCount = alerts.filter(a => a.status === "unread").length;

  return (
    <AppLayout>
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <span>Alerts</span>
            {unreadCount > 0 && (
              <span className="bg-red-500/20 text-red-500 border border-red-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
        }
        action={
          unreadCount > 0 && (
            <Btn variant="outline" onClick={async () => {
              const unread = alerts.filter(a => a.status === "unread");
              await Promise.all(unread.map(a => api.patch(`/alerts/${a.id}`, { status: "read" })));
              await load();
            }}>
              Mark All Read
            </Btn>
          )
        }
      />

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by message or device ID..." />
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
          <option value="resolved">Resolved</option>
        </Select>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Showing <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{filtered.length}</span> of {alerts.length} alerts
        </p>
        {lastUpdated && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Auto-refreshes every 30s · Last: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      <Table
        headers={["ID", "Device ID", "Message", "Status", "Created At", "Actions"]}
        empty={filtered.length === 0 ? "No alerts found." : null}
      >
        {filtered.map((a) => (
          <Tr key={a.id}>
            <Td mono>{a.id}</Td>
            <Td mono>{a.device_id}</Td>
            <Td>
              <span style={{ color: "var(--text-primary)" }}>{a.message}</span>
            </Td>
            <Td><Badge value={a.status} /></Td>
            <Td mono>{new Date(a.created_at).toLocaleString()}</Td>
            <Td>
              <div className="flex gap-2 flex-wrap">
                {a.status === "unread" && (
                  <Btn variant="outline" className="px-2 py-1 text-xs" onClick={() => updateStatus(a.id, "read")}>
                    Mark Read
                  </Btn>
                )}
                {a.status !== "resolved" && (
                  <Btn variant="outline" className="px-2 py-1 text-xs" onClick={() => updateStatus(a.id, "resolved")}>
                    Resolve
                  </Btn>
                )}
              </div>
            </Td>
          </Tr>
        ))}
      </Table>
    </AppLayout>
  );
}