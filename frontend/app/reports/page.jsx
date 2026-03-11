"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/AppLayout";
import { PageHeader } from "@/components/ui";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ReportsPage() {
  const { token } = useAuth();
  const [downloading, setDownloading] = useState(null);

  const download = async (endpoint, filename) => {
    setDownloading(filename);
    try {
      const res = await fetch(`${API}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(null);
    }
  };

  const REPORTS = [
    {
      title: "Device Inventory",
      description: "Full list of all devices with IP, MAC, location, status and warranty dates",
      endpoint: "/export/devices/csv",
      filename: "devices.csv",
      icon: "M20 2H4c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 6H4V4h16v4zM4 14h16c1.1 0 2-.9 2-2v-.01c0-1.1-.9-1.99-2-1.99H4c-1.1 0-2 .89-2 1.99V12c0 1.1.9 2 2 2zm0 8h16c1.1 0 2-.9 2-2v-.01c0-1.1-.9-1.99-2-1.99H4c-1.1 0-2 .89-2 1.99V20c0 1.1.9 2 2 2z",
      color: "indigo",
    },
    {
      title: "Alerts Report",
      description: "All system alerts with status, device and timestamp",
      endpoint: "/export/alerts/csv",
      filename: "alerts.csv",
      icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z",
      color: "red",
    },
    {
      title: "Maintenance Report",
      description: "All maintenance records with issues, status, notes and who reported them",
      endpoint: "/export/maintenance/csv",
      filename: "maintenance.csv",
      icon: "M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z",
      color: "amber",
    },
    {
      title: "Warranty Report",
      description: "All devices sorted by warranty expiry with days remaining",
      endpoint: "/export/warranty/csv",
      filename: "warranty_report.csv",
      icon: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l5 2.18V11c0 3.5-2.33 6.79-5 7.93-2.67-1.14-5-4.43-5-7.93V7.18L12 5z",
      color: "green",
    },
  ];

  const colorMap = {
    indigo: {
      bg: "bg-indigo-500/10",
      text: "text-indigo-400",
      border: "border-indigo-500/30",
      btn: "bg-indigo-600 hover:bg-indigo-500",
    },
    red: {
      bg: "bg-red-500/10",
      text: "text-red-400",
      border: "border-red-500/30",
      btn: "bg-red-600 hover:bg-red-500",
    },
    amber: {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/30",
      btn: "bg-amber-600 hover:bg-amber-500",
    },
    green: {
      bg: "bg-green-500/10",
      text: "text-green-400",
      border: "border-green-500/30",
      btn: "bg-green-600 hover:bg-green-500",
    },
  };

  return (
    <AppLayout>
      <PageHeader title="Reports & Exports" />

      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl px-5 py-4 mb-8 flex items-center gap-3">
        <svg className="w-5 h-5 text-indigo-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <p className="text-indigo-300 text-sm">
          All reports are exported as <span className="font-semibold">CSV files</span> which can be opened in Excel, Google Sheets or any spreadsheet app.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {REPORTS.map((r) => {
          const c = colorMap[r.color];
          const isDownloading = downloading === r.filename;
          return (
            <div
              key={r.filename}
              className={`bg-slate-900 border ${c.border} rounded-xl p-6 flex flex-col gap-4`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
                  <svg className={`w-6 h-6 ${c.text}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d={r.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{r.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{r.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                  </svg>
                  <span className="text-xs text-slate-600 font-mono">{r.filename}</span>
                </div>

                <button
                  onClick={() => download(r.endpoint, r.filename)}
                  disabled={isDownloading}
                  className={`flex items-center gap-2 ${c.btn} text-white text-xs font-semibold px-4 py-2 rounded-lg transition disabled:opacity-50`}
                >
                  {isDownloading ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                      </svg>
                      Download CSV
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}