"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { createApi } from "@/lib/api";
import AppLayout from "@/components/AppLayout";
import {
  Btn, Modal, Field, Input, Select, ErrorAlert,
  PageHeader, Badge, Table, Tr, Td, SearchBar, useAutoRefresh
} from "@/components/ui";
import { useRouter } from "next/navigation";

export default function DevicesPage() {
  const { token, user } = useAuth();
  const api = createApi(token);
  const router = useRouter();
  const isAdmin = user?.role === "admin";

  const [devices, setDevices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  // Bulk actions
  const [selected, setSelected] = useState([]);
  const [bulkModal, setBulkModal] = useState(false);
  const [bulkStatus, setBulkStatus] = useState("online");
  const [bulkLoading, setBulkLoading] = useState(false);

  // QR modal
  const [qrDevice, setQrDevice] = useState(null);
  const [qrUrl, setQrUrl] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await api.get("/devices/");
      setDevices(data);
      setLastUpdated(new Date());
    } catch (e) { console.error(e); }
  }, [token]);

  useEffect(() => { if (token) load(); }, [token]);
  useAutoRefresh(load, 30000);

  useEffect(() => {
    let result = [...devices];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(d =>
        d.name?.toLowerCase().includes(s) ||
        d.ip_address?.toLowerCase().includes(s) ||
        d.mac_address?.toLowerCase().includes(s) ||
        d.brand?.toLowerCase().includes(s) ||
        d.type?.toLowerCase().includes(s) ||
        d.location?.toLowerCase().includes(s) ||
        d.serial_number?.toLowerCase().includes(s)
      );
    }
    if (statusFilter !== "all") result = result.filter(d => d.status === statusFilter);
    if (typeFilter !== "all") result = result.filter(d => d.type === typeFilter);
    setFiltered(result);
    setSelected([]);
  }, [devices, search, statusFilter, typeFilter]);

  const uniqueTypes = [...new Set(devices.map(d => d.type).filter(Boolean))];

  const toggleSelect = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelected(
      selected.length === filtered.length ? [] : filtered.map(d => d.id)
    );
  };

  const openAdd = () => {
    setForm({ name: "", type: "", brand: "", serial_number: "", ip_address: "", mac_address: "", location: "", status: "online", purchase_date: "", warranty_expiry: "" });
    setError("");
    setModal("add");
  };

  const openEdit = (d) => {
    setForm({ ...d });
    setError("");
    setModal("edit");
  };

  const openQr = (d) => {
    const url = `${window.location.origin}/devices/${d.id}`;
    setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&bgcolor=0f172a&color=e2e8f0&margin=10`);
    setQrDevice(d);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setError("");
    try {
      if (modal === "add") await api.post("/devices/", form);
      else await api.put(`/devices/${form.id}`, form);
      await load();
      setModal(null);
    } catch (e) { setError(e.message); }
  };

  const del = async (id) => {
    if (!confirm("Delete this device?")) return;
    try {
      await api.del(`/devices/${id}`);
      await load();
    } catch (e) { alert(e.message); }
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.length} devices?`)) return;
    setBulkLoading(true);
    try {
      await Promise.all(selected.map(id => api.del(`/devices/${id}`)));
      setSelected([]);
      await load();
    } catch (e) { alert(e.message); }
    setBulkLoading(false);
  };

  const bulkUpdateStatus = async () => {
    setBulkLoading(true);
    try {
      await Promise.all(
        selected.map(id => {
          const device = devices.find(d => d.id === id);
          return api.put(`/devices/${id}`, { ...device, status: bulkStatus });
        })
      );
      setSelected([]);
      setBulkModal(false);
      await load();
    } catch (e) { alert(e.message); }
    setBulkLoading(false);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Devices"
        action={isAdmin && <Btn onClick={openAdd}>+ Add Device</Btn>}
      />

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, IP, MAC, brand..." />
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
          <option value="maintenance">Maintenance</option>
        </Select>
        <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option>
          {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </Select>
      </div>

      {/* Bulk action bar */}
      {selected.length > 0 && isAdmin && (
        <div className="card px-5 py-3 mb-4 flex items-center gap-4">
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {selected.length} device{selected.length > 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2 ml-auto">
            <Btn
              variant="outline"
              className="px-3 py-1.5 text-xs"
              onClick={() => setBulkModal(true)}
            >
              Update Status
            </Btn>
            <Btn
              variant="danger"
              className="px-3 py-1.5 text-xs"
              onClick={bulkDelete}
              disabled={bulkLoading}
            >
              {bulkLoading ? "Deleting..." : `Delete ${selected.length}`}
            </Btn>
            <Btn
              variant="ghost"
              className="px-3 py-1.5 text-xs"
              onClick={() => setSelected([])}
              style={{ color: "var(--text-muted)" }}
            >
              Clear
            </Btn>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Showing <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{filtered.length}</span> of {devices.length} devices
        </p>
        {lastUpdated && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Auto-refreshes every 30s · Last: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      <Table
        headers={[
          isAdmin ? "checkbox" : "",
          "Name", "Type", "Brand", "IP Address",
          "Location", "Status", "Warranty", "Actions"
        ].filter(Boolean)}
        empty={filtered.length === 0 ? "No devices found." : null}
      >
        {/* Select all header row */}
        {isAdmin && filtered.length > 0 && (
          <tr style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-secondary)" }}>
            <td className="px-4 py-2" colSpan={9}>
              <label className="flex items-center gap-2 cursor-pointer text-xs" style={{ color: "var(--text-muted)" }}>
                <input
                  type="checkbox"
                  checked={selected.length === filtered.length && filtered.length > 0}
                  onChange={toggleSelectAll}
                  className="w-3.5 h-3.5 accent-indigo-500"
                />
                {selected.length === filtered.length && filtered.length > 0
                  ? "Deselect all"
                  : `Select all ${filtered.length}`}
              </label>
            </td>
          </tr>
        )}

        {filtered.map((d) => {
          const today = new Date();
          const w = d.warranty_expiry ? new Date(d.warranty_expiry) : null;
          const expired = w && w < today;
          const daysLeft = w ? Math.ceil((w - today) / (1000 * 60 * 60 * 24)) : null;
          const isSelected = selected.includes(d.id);

          return (
            <Tr key={d.id}>
              {isAdmin && (
                <Td>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(d.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-3.5 h-3.5 accent-indigo-500"
                  />
                </Td>
              )}
              <Td>
                <button
                  onClick={() => router.push(`/devices/${d.id}`)}
                  className="font-semibold hover:text-indigo-400 transition text-left"
                  style={{ color: "var(--text-primary)" }}
                >
                  {d.name}
                </button>
              </Td>
              <Td>{d.type}</Td>
              <Td>{d.brand}</Td>
              <Td mono>{d.ip_address}</Td>
              <Td>{d.location}</Td>
              <Td><Badge value={d.status} /></Td>
              <Td>
                {w ? (
                  <span className={`text-xs font-mono ${expired ? "text-red-500" : daysLeft <= 30 ? "text-amber-500" : "text-green-500"}`}>
                    {expired ? "Expired" : `${daysLeft}d left`}
                  </span>
                ) : <span style={{ color: "var(--text-muted)" }}>—</span>}
              </Td>
              <Td>
                <div className="flex gap-2 flex-wrap">
                  <Btn
                    variant="outline"
                    className="px-2 py-1 text-xs"
                    onClick={() => openQr(d)}
                    title="Generate QR Code"
                  >
                    QR
                  </Btn>
                  {isAdmin && (
                    <>
                      <Btn variant="outline" className="px-2 py-1 text-xs" onClick={() => openEdit(d)}>Edit</Btn>
                      <Btn variant="danger" className="px-2 py-1 text-xs" onClick={() => del(d.id)}>Delete</Btn>
                    </>
                  )}
                </div>
              </Td>
            </Tr>
          );
        })}
      </Table>

      {/* Add/Edit Modal */}
      {modal && (
        <Modal title={modal === "add" ? "Add Device" : "Edit Device"} onClose={() => setModal(null)}>
          <ErrorAlert message={error} />
          {[
            ["Device Name", "name", "text"],
            ["Type", "type", "text"],
            ["Brand", "brand", "text"],
            ["Serial Number", "serial_number", "text"],
            ["IP Address", "ip_address", "text"],
            ["MAC Address", "mac_address", "text"],
            ["Location", "location", "text"],
            ["Purchase Date", "purchase_date", "date"],
            ["Warranty Expiry", "warranty_expiry", "date"],
          ].map(([label, key, type]) => (
            <Field key={key} label={label}>
              <Input type={type} value={form[key] || ""} onChange={(e) => set(key, e.target.value)} />
            </Field>
          ))}
          <Field label="Status">
            <Select value={form.status || "online"} onChange={(e) => set("status", e.target.value)}>
              {["online", "offline", "maintenance"].map(s => <option key={s}>{s}</option>)}
            </Select>
          </Field>
          <div className="flex gap-3 mt-2">
            <Btn onClick={save}>Save</Btn>
            <Btn variant="outline" onClick={() => setModal(null)}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {/* Bulk Status Modal */}
      {bulkModal && (
        <Modal title={`Update Status — ${selected.length} Devices`} onClose={() => setBulkModal(false)}>
          <Field label="New Status">
            <Select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="maintenance">Maintenance</option>
            </Select>
          </Field>
          <div className="flex gap-3 mt-4">
            <Btn onClick={bulkUpdateStatus} disabled={bulkLoading}>
              {bulkLoading ? "Updating..." : `Update ${selected.length} Devices`}
            </Btn>
            <Btn variant="outline" onClick={() => setBulkModal(false)}>Cancel</Btn>
          </div>
        </Modal>
      )}

      {/* QR Code Modal */}
      {qrDevice && (
        <Modal title={`QR Code — ${qrDevice.name}`} onClose={() => setQrDevice(null)}>
          <div className="flex flex-col items-center gap-5 py-4">
            <div className="p-4 rounded-xl" style={{ background: "#0f172a" }}>
              <img
                src={qrUrl}
                alt="QR Code"
                className="w-48 h-48 rounded-lg"
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{qrDevice.name}</p>
              <p className="text-xs font-mono mt-1" style={{ color: "var(--text-muted)" }}>{qrDevice.ip_address}</p>
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                Scan to open device detail page
              </p>
            </div>
            <div className="flex gap-3">
              
              <a href={qrUrl}
                download={`qr-${qrDevice.name}.png`}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
                Download QR
              </a>
              <Btn variant="outline" onClick={() => setQrDevice(null)}>Close</Btn>
            </div>
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}