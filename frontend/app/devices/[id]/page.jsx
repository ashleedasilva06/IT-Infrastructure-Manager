"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createApi } from "@/lib/api";
import AppLayout from "@/components/AppLayout";
import { Badge, Btn, useAutoRefresh } from "@/components/ui";

export default function DeviceDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const api = createApi(token);
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/devices/${id}/detail`);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => { if (token) load(); }, [token]);
  useAutoRefresh(load, 30000);

  if (loading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64">
        <svg className="w-8 h-8 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      </div>
    </AppLayout>
  );

  if (!data) return (
    <AppLayout>
      <div className="text-center py-20" style={{ color: "var(--text-muted)" }}>Device not found.</div>
    </AppLayout>
  );

  const { device, alerts, maintenance, history, assignment, uptime_pct } = data;

  const getUptimeColor = (pct) => {
    if (pct === null) return "text-slate-500";
    if (pct >= 80) return "text-green-500";
    if (pct >= 50) return "text-amber-500";
    return "text-red-500";
  };

  const today = new Date();
  const warrantyDate = device.warranty_expiry ? new Date(device.warranty_expiry) : null;
  const warrantyExpired = warrantyDate && warrantyDate < today;
  const warrantyDaysLeft = warrantyDate ? Math.ceil((warrantyDate - today) / (1000 * 60 * 60 * 24)) : null;

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Btn variant="outline" className="px-2 py-1.5" onClick={() => router.push("/devices")}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
          </svg>
          Back
        </Btn>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{device.name}</h1>
            <Badge value={device.status} />
          </div>
          <p className="text-sm font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>{device.ip_address}</p>
        </div>
        {uptime_pct !== null && (
          <div className="text-right">
            <p className={`text-3xl font-extrabold ${getUptimeColor(uptime_pct)}`}>{uptime_pct}%</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Uptime</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="xl:col-span-1 space-y-6">
          {/* Device Info */}
          <div className="card p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>Device Info</h2>
            <div className="space-y-3">
              {[
                { label: "Type", value: device.type },
                { label: "Brand", value: device.brand },
                { label: "Serial No.", value: device.serial_number },
                { label: "MAC Address", value: device.mac_address },
                { label: "Location", value: device.location },
                { label: "Purchase Date", value: device.purchase_date },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm gap-4">
                  <span style={{ color: "var(--text-muted)" }}>{label}</span>
                  <span className="font-mono text-xs text-right" style={{ color: "var(--text-primary)" }}>{value || "—"}</span>
                </div>
              ))}

              {/* Warranty */}
              <div className="flex justify-between text-sm gap-4">
                <span style={{ color: "var(--text-muted)" }}>Warranty</span>
                <span className={`font-mono text-xs text-right ${warrantyExpired ? "text-red-500" : warrantyDaysLeft && warrantyDaysLeft <= 30 ? "text-amber-500" : "text-green-500"}`}>
                  {warrantyDate
                    ? warrantyExpired
                      ? `Expired (${device.warranty_expiry})`
                      : `${warrantyDaysLeft}d left`
                    : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Assignment */}
          <div className="card p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>Assignment</h2>
            {assignment ? (
              <div className="space-y-3">
                {[
                  { label: "Employee", value: assignment.employee_name },
                  { label: "Department", value: assignment.department },
                  { label: "Assigned", value: assignment.assigned_date },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span style={{ color: "var(--text-muted)" }}>{label}</span>
                    <span className="font-semibold text-xs" style={{ color: "var(--text-primary)" }}>{value || "—"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Not assigned</p>
            )}
          </div>

          {/* Status History dots */}
          <div className="card p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>Recent Status</h2>
            {history.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {history.slice(0, 20).map((h, i) => (
                  <div
                    key={i}
                    title={`${h.status} — ${new Date(h.timestamp).toLocaleString()}`}
                    className={`w-4 h-4 rounded-sm cursor-help ${h.status === "online" ? "bg-green-500" : "bg-red-500"}`}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No history yet</p>
            )}
            <p className="text-xs mt-3" style={{ color: "var(--text-faint)" }}>Latest on right → hover for timestamp</p>
          </div>
        </div>

        {/* Right column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Recent Alerts */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                Recent Alerts
                <span className="ml-2 bg-red-500/20 text-red-400 px-2 py-0.5 rounded-md text-xs">{alerts.length}</span>
              </h2>
            </div>
            {alerts.length > 0 ? (
              <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
                {alerts.map((a) => (
                  <div key={a.id} className="px-6 py-4 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm" style={{ color: "var(--text-primary)" }}>{a.message}</p>
                      <p className="text-xs font-mono mt-1" style={{ color: "var(--text-muted)" }}>
                        {new Date(a.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge value={a.status} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-8 text-sm text-center" style={{ color: "var(--text-muted)" }}>No alerts for this device</div>
            )}
          </div>

          {/* Maintenance */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                Maintenance Records
                <span className="ml-2 bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-md text-xs">{maintenance.length}</span>
              </h2>
            </div>
            {maintenance.length > 0 ? (
              <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
                {maintenance.map((m) => (
                  <div key={m.id} className="px-6 py-4 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm" style={{ color: "var(--text-primary)" }}>{m.issue}</p>
                      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                        Reported by <span className="font-semibold">{m.reported_by || "—"}</span> · {m.maintenance_date}
                      </p>
                    </div>
                    <Badge value={m.status} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-8 text-sm text-center" style={{ color: "var(--text-muted)" }}>No maintenance records</div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}