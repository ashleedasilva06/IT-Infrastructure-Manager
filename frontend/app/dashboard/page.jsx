"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { createApi } from "@/lib/api";
import AppLayout from "@/components/AppLayout";
import { StatCard, Badge, useAutoRefresh } from "@/components/ui";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function DashboardPage() {
  const { token, theme } = useAuth();
  const api = createApi(token);
  const [data, setData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async () => {
    try {
      const [dash, chart] = await Promise.all([
        api.get("/dashboard/"),
        api.get("/history/chart-data"),
      ]);
      setData(dash);
      setChartData(chart);
      setLastUpdated(new Date());
    } catch (e) {
      console.error(e);
    }
  }, [token]);

  useEffect(() => { if (token) load(); }, [token]);
  useAutoRefresh(load, 30000);

  const isDark = theme === "dark";
  const gridColor = isDark ? "#1e293b" : "#e2e8f0";
  const textColor = isDark ? "#475569" : "#94a3b8";

  const stats = data ? [
    { label: "Total Devices", value: data.total_devices, color: "indigo" },
    { label: "Online", value: data.online_devices, color: "green" },
    { label: "Offline", value: data.offline_devices, color: "red" },
    { label: "Maintenance", value: data.maintenance_devices, color: "amber" },
    { label: "Total Alerts", value: data.total_alerts, color: "cyan" },
    { label: "Unread Alerts", value: data.unread_alerts, color: "orange" },
    { label: "Open Issues", value: data.open_maintenance, color: "purple" },
    { label: "Warranty Expiring", value: data.warranty_expiring_soon, color: "yellow" },
    { label: "Warranty Expired", value: data.warranty_expired, color: "red" },
  ] : [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="card px-4 py-3 text-xs shadow-xl">
        <p className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: <span className="font-bold">{p.value}</span>
          </p>
        ))}
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Dashboard</h1>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
            style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3 mb-8">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Chart */}
      <div className="card p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Device Status — Last 24 Hours
          </h2>
          <div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-green-500 inline-block rounded" />Online
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-red-500 inline-block rounded" />Offline
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="time"
              tick={{ fill: textColor, fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval={3}
            />
            <YAxis
              tick={{ fill: textColor, fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="online"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#22c55e" }}
            />
            <Line
              type="monotone"
              dataKey="offline"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#ef4444" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Warranty warnings */}
      {(data?.expiring_devices?.length > 0 || data?.expired_devices?.length > 0) && (
        <div className="card p-6 mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>
            ⚠️ Warranty Alerts
          </h2>
          <div className="space-y-3">
            {data?.expired_devices?.map((d) => (
              <div key={d.id} className="flex items-center gap-3 text-sm">
                <span className="bg-red-500/15 text-red-500 border border-red-500/30 text-xs font-semibold px-2 py-0.5 rounded-md shrink-0">
                  Expired
                </span>
                <span className="flex-1" style={{ color: "var(--text-primary)" }}>{d.name}</span>
                <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                  {d.warranty_expiry}
                </span>
              </div>
            ))}
            {data?.expiring_devices?.map((d) => (
              <div key={d.id} className="flex items-center gap-3 text-sm">
                <span className="bg-amber-500/15 text-amber-500 border border-amber-500/30 text-xs font-semibold px-2 py-0.5 rounded-md shrink-0">
                  Expiring Soon
                </span>
                <span className="flex-1" style={{ color: "var(--text-primary)" }}>{d.name}</span>
                <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                  {d.days_left}d left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent alerts */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Recent Alerts
          </h2>
        </div>
        {data?.latest_alerts?.length > 0 ? (
          <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
            {data.latest_alerts.map((a) => (
              <div key={a.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm" style={{ color: "var(--text-primary)" }}>{a.message}</p>
                  <p className="text-xs font-mono mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {new Date(a.created_at).toLocaleString()}
                  </p>
                </div>
                <Badge value={a.status} />
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-10 text-sm text-center" style={{ color: "var(--text-muted)" }}>
            No alerts yet
          </div>
        )}
      </div>
    </AppLayout>
  );
}