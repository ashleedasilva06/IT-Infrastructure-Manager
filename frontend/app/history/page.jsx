"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createApi } from "@/lib/api";
import AppLayout from "@/components/AppLayout";
import { Badge, PageHeader, Table, Td, Tr } from "@/components/ui";

export default function HistoryPage() {
  const { token } = useAuth();
  const api = createApi(token);
  const [summary, setSummary] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [view, setView] = useState("summary");

  const loadSummary = () => api.get("/history/summary").then(setSummary);
  const loadHistory = (deviceId = null) => {
    const q = deviceId ? `?device_id=${deviceId}&limit=50` : "?limit=50";
    api.get(`/history/${q}`).then(setHistory);
  };

  useEffect(() => {
    if (token) {
      loadSummary();
      loadHistory();
    }
  }, [token]);

  const selectDevice = (device) => {
    setSelectedDevice(device);
    setView("detail");
    loadHistory(device.device_id);
  };

  const getUptimeColor = (online, offline) => {
    const total = online + offline;
    if (total === 0) return "text-slate-500";
    const pct = (online / total) * 100;
    if (pct >= 80) return "text-green-400";
    if (pct >= 50) return "text-amber-400";
    return "text-red-400";
  };

  const getUptimePct = (online, offline) => {
    const total = online + offline;
    if (total === 0) return "N/A";
    return `${Math.round((online / total) * 100)}%`;
  };

  return (
    <AppLayout>
      <PageHeader
        title="Device History"
        action={
          <div className="flex gap-2">
            <button
              onClick={() => { setView("summary"); setSelectedDevice(null); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition
                ${view === "summary"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
            >
              Summary
            </button>
            <button
              onClick={() => { setView("log"); setSelectedDevice(null); loadHistory(); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition
                ${view === "log"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
            >
              Full Log
            </button>
          </div>
        }
      />

      {/* Summary View */}
      {view === "summary" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {summary.map((d) => (
            <div
              key={d.device_id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-5 cursor-pointer transition"
              onClick={() => selectDevice(d)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-slate-100 text-sm">{d.device_name}</p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{d.ip_address}</p>
                </div>
                <Badge value={d.current_status} />
              </div>

              {/* Uptime bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Uptime</span>
                  <span className={getUptimeColor(d.online_count, d.offline_count)}>
                    {getUptimePct(d.online_count, d.offline_count)}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div
                    className="bg-green-500 h-1.5 rounded-full transition-all"
                    style={{
                      width: d.online_count + d.offline_count > 0
                        ? `${(d.online_count / (d.online_count + d.offline_count)) * 100}%`
                        : "0%"
                    }}
                  />
                </div>
              </div>

              {/* Recent history dots */}
              <div className="flex items-center gap-1 mb-3">
                <span className="text-xs text-slate-600 mr-1">Recent:</span>
                {d.recent_history.map((h, i) => (
                  <div
                    key={i}
                    title={`${h.status} - ${new Date(h.timestamp).toLocaleString()}`}
                    className={`w-3 h-3 rounded-full ${h.status === "online" ? "bg-green-500" : "bg-red-500"}`}
                  />
                ))}
                {d.recent_history.length === 0 && (
                  <span className="text-xs text-slate-600">No history yet</span>
                )}
              </div>

              <div className="flex justify-between text-xs text-slate-500">
                <span>Last seen: {d.last_seen ? new Date(d.last_seen).toLocaleString() : "Never"}</span>
                <span className="text-indigo-400">View details →</span>
              </div>
            </div>
          ))}

          {summary.length === 0 && (
            <div className="col-span-3 bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-600 text-sm">
              No history yet. The monitor checks devices every 30 seconds.
            </div>
          )}
        </div>
      )}

      {/* Detail View */}
      {view === "detail" && selectedDevice && (
        <>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-100">{selectedDevice.device_name}</p>
                <p className="text-xs text-slate-500 font-mono">{selectedDevice.ip_address}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className={`text-2xl font-extrabold ${getUptimeColor(selectedDevice.online_count, selectedDevice.offline_count)}`}>
                    {getUptimePct(selectedDevice.online_count, selectedDevice.offline_count)}
                  </p>
                  <p className="text-xs text-slate-500">Uptime</p>
                </div>
                <Badge value={selectedDevice.current_status} />
              </div>
            </div>
          </div>

          <Table
            headers={["#", "Device", "Status", "Timestamp"]}
            empty={history.length === 0 ? "No history found." : null}
          >
            {history.map((h) => (
              <Tr key={h.id}>
                <Td mono>{h.id}</Td>
                <Td><span className="text-slate-200">{h.device_name}</span></Td>
                <Td><Badge value={h.status} /></Td>
                <Td mono>{new Date(h.timestamp).toLocaleString()}</Td>
              </Tr>
            ))}
          </Table>
        </>
      )}

      {/* Full Log View */}
      {view === "log" && (
        <Table
          headers={["#", "Device", "Status", "Timestamp"]}
          empty={history.length === 0 ? "No history yet." : null}
        >
          {history.map((h) => (
            <Tr key={h.id}>
              <Td mono>{h.id}</Td>
              <Td><span className="text-slate-200">{h.device_name}</span></Td>
              <Td><Badge value={h.status} /></Td>
              <Td mono>{new Date(h.timestamp).toLocaleString()}</Td>
            </Tr>
          ))}
        </Table>
      )}
    </AppLayout>
  );
}