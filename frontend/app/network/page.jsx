"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createApi } from "@/lib/api";
import AppLayout from "@/components/AppLayout";
import { Btn, Modal, Field, Input, Select, ErrorAlert, PageHeader } from "@/components/ui";

const DEVICE_ICONS = {
  router: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
    </svg>
  ),
  phone: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
    </svg>
  ),
  laptop: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
    </svg>
  ),
  printer: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
    </svg>
  ),
  server: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 6H4V4h16v4zM4 14h16c1.1 0 2-.9 2-2v-.01c0-1.1-.9-1.99-2-1.99H4c-1.1 0-2 .89-2 1.99V12c0 1.1.9 2 2 2zm0 8h16c1.1 0 2-.9 2-2v-.01c0-1.1-.9-1.99-2-1.99H4c-1.1 0-2 .89-2 1.99V20c0 1.1.9 2 2 2z"/>
    </svg>
  ),
  unknown: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
    </svg>
  ),
};

const ICON_COLORS = {
  router: "text-blue-400 bg-blue-500/10",
  phone: "text-purple-400 bg-purple-500/10",
  laptop: "text-indigo-400 bg-indigo-500/10",
  printer: "text-amber-400 bg-amber-500/10",
  server: "text-green-400 bg-green-500/10",
  unknown: "text-slate-400 bg-slate-500/10",
};

export default function NetworkPage() {
  const { token } = useAuth();
  const api = createApi(token);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [myIp, setMyIp] = useState("");
  const [addModal, setAddModal] = useState(null);
  const [form, setForm] = useState({});
  const [addError, setAddError] = useState("");
  const [addedIps, setAddedIps] = useState([]);
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (token) {
      api.get("/network/my-ip").then((data) => setMyIp(data.ip));
    }
  }, [token]);

  const scan = async () => {
    setScanning(true);
    setError("");
    setResult(null);
    setProgress(0);

    // Fake progress bar while scanning
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) { clearInterval(interval); return 90; }
        return p + Math.random() * 8;
      });
    }, 800);

    try {
      const data = await api.get("/network/scan");
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => { setResult(data); setScanning(false); }, 500);
    } catch (e) {
      clearInterval(interval);
      setError(e.message);
      setScanning(false);
    }
  };

  const openAdd = (device) => {
    setForm({
      name: device.hostname !== "Unknown" ? device.hostname : "",
      type: device.device_type || "",
      brand: device.vendor || "",
      serial_number: "",
      ip_address: device.ip,
      mac_address: device.mac || "",
      location: "",
      status: "online",
      purchase_date: "",
      warranty_expiry: "",
    });
    setAddError("");
    setAddModal(device);
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addDevice = async () => {
    setAddError("");
    try {
      await api.post("/devices/", form);
      setAddedIps((prev) => [...prev, addModal.ip]);
      setAddModal(null);
      setSuccess(`✅ ${form.name || form.ip_address} added to inventory!`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setAddError(e.message);
    }
  };

  const filteredDevices = result?.devices?.filter((d) => {
    if (filter === "new") return !d.in_inventory && !addedIps.includes(d.ip);
    if (filter === "inventory") return d.in_inventory || addedIps.includes(d.ip);
    return true;
  }) || [];

  return (
    <AppLayout>
      <PageHeader
        title="Network Scanner"
        action={
          <Btn onClick={scan} disabled={scanning}>
            {scanning ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Scanning...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
                </svg>
                Scan Network
              </>
            )}
          </Btn>
        }
      />

      {/* Info bar */}
      {myIp && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 mb-6 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span className="text-slate-500">Server IP:</span>
            <span className="text-indigo-400 font-mono font-semibold">{myIp}</span>
          </div>
          {result && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Network:</span>
                <span className="text-slate-300 font-mono">{result.network}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block"/>
                <span className="text-slate-300">{result.in_inventory} in inventory</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"/>
                <span className="text-slate-300">{result.new_devices} new devices</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Progress bar */}
      {scanning && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 mb-6">
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-ping"/>
              <div className="absolute inset-2 rounded-full border-2 border-indigo-500/40 animate-ping" style={{ animationDelay: "0.3s" }}/>
              <div className="absolute inset-4 rounded-full border-2 border-indigo-500/60 animate-ping" style={{ animationDelay: "0.6s" }}/>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-7 h-7 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
                </svg>
              </div>
            </div>
            <div className="w-full max-w-sm">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>Scanning {myIp?.split(".").slice(0, 3).join(".")}.0/24</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div
                  className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <p className="text-slate-500 text-xs">Detecting devices, types and vendors...</p>
          </div>
        </div>
      )}

      {error && <ErrorAlert message={error} />}

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg px-4 py-3 text-sm mb-6">
          {success}
        </div>
      )}

      {/* Stats */}
      {result && !scanning && (
        <>
          <div className="grid grid-cols-5 gap-4 mb-6">
            {[
              { label: "Total Found", value: result.total, color: "indigo" },
              { label: "Online", value: result.devices.filter(d => d.status === "up").length, color: "green" },
              { label: "In Inventory", value: result.in_inventory + addedIps.length, color: "blue" },
              { label: "New Devices", value: result.new_devices - addedIps.length, color: "amber" },
              { label: "Open Ports", value: result.devices.reduce((a, d) => a + d.open_ports.length, 0), color: "purple" },
            ].map(s => (
              <div key={s.label} className={`bg-slate-900 border border-slate-800 border-l-4 border-l-${s.color}-500 rounded-xl p-4`}>
                <div className={`text-2xl font-extrabold text-${s.color}-400`}>{s.value}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-4">
            {[["all", "All Devices"], ["new", "New Only"], ["inventory", "In Inventory"]].map(([f, l]) => (
              <Btn
                key={f}
                variant={filter === f ? "primary" : "outline"}
                className="px-3 py-1.5 text-xs"
                onClick={() => setFilter(f)}
              >{l}</Btn>
            ))}
          </div>

          {/* Device cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredDevices.map((d) => {
              const isAdded = addedIps.includes(d.ip) || d.in_inventory;
              const iconColor = ICON_COLORS[d.icon] || ICON_COLORS.unknown;
              return (
                <div key={d.ip} className={`bg-slate-900 border rounded-xl p-5 transition
                  ${isAdded ? "border-green-500/30" : "border-slate-800 hover:border-slate-600"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColor}`}>
                        {DEVICE_ICONS[d.icon] || DEVICE_ICONS.unknown}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-100">
                          {d.hostname !== "Unknown" ? d.hostname : d.device_type}
                        </p>
                        <p className="text-xs text-slate-500 font-mono">{d.ip}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border
                        ${d.status === "up"
                          ? "bg-green-500/15 text-green-400 border-green-500/30"
                          : "bg-red-500/15 text-red-400 border-red-500/30"
                        }`}>
                        {d.status === "up" ? "online" : "offline"}
                      </span>
                      {isAdded && (
                        <span className="text-xs text-green-400 font-semibold">✅ In Inventory</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">Type</span>
                      <span className="text-slate-300">{d.device_type}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">Vendor</span>
                      <span className="text-slate-300">{d.vendor || "—"}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">MAC</span>
                      <span className="text-slate-400 font-mono">{d.mac || "—"}</span>
                    </div>
                    {d.open_ports.length > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Open Ports</span>
                        <span className="text-slate-400 font-mono">{d.open_ports.join(", ")}</span>
                      </div>
                    )}
                  </div>

                  {!isAdded && (
                    <Btn
                      variant="outline"
                      className="w-full justify-center text-xs py-1.5"
                      onClick={() => openAdd(d)}
                    >
                      + Add to Inventory
                    </Btn>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Empty state */}
      {!result && !scanning && !error && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-16 flex flex-col items-center gap-4">
          <svg className="w-14 h-14 text-slate-700" fill="currentColor" viewBox="0 0 24 24">
            <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
          </svg>
          <p className="text-slate-500 text-sm">Click <span className="text-indigo-400 font-semibold">Scan Network</span> to discover all devices on your network</p>
          <p className="text-slate-600 text-xs">Detects device type, vendor, open ports and checks against your inventory</p>
        </div>
      )}

      {/* Add Device Modal */}
      {addModal && (
        <Modal title={`Add ${addModal.ip} to Inventory`} onClose={() => setAddModal(null)}>
          <ErrorAlert message={addError} />
          <Field label="Device Name">
            <Input value={form.name || ""} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Office Laptop" />
          </Field>
          <Field label="Type">
            <Input value={form.type || ""} onChange={(e) => set("type", e.target.value)} />
          </Field>
          <Field label="Brand">
            <Input value={form.brand || ""} onChange={(e) => set("brand", e.target.value)} />
          </Field>
          <Field label="Serial Number">
            <Input value={form.serial_number || ""} onChange={(e) => set("serial_number", e.target.value)} />
          </Field>
          <Field label="IP Address">
            <Input value={form.ip_address || ""} disabled className="opacity-60" />
          </Field>
          <Field label="MAC Address">
            <Input value={form.mac_address || ""} onChange={(e) => set("mac_address", e.target.value)} />
          </Field>
          <Field label="Location">
            <Input value={form.location || ""} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Office Room 1" />
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
              {["online", "offline", "maintenance"].map(s => <option key={s}>{s}</option>)}
            </Select>
          </Field>
          <Field label="Purchase Date">
            <Input type="date" value={form.purchase_date || ""} onChange={(e) => set("purchase_date", e.target.value)} />
          </Field>
          <Field label="Warranty Expiry">
            <Input type="date" value={form.warranty_expiry || ""} onChange={(e) => set("warranty_expiry", e.target.value)} />
          </Field>
          <div className="flex gap-3 mt-2">
            <Btn onClick={addDevice}>Add to Inventory</Btn>
            <Btn variant="outline" onClick={() => setAddModal(null)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}