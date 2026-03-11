"use client";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { createApi } from "@/lib/api";
import AppLayout from "@/components/AppLayout";
import {
  Btn, Modal, Field, Input, Select, Textarea, ErrorAlert,
  PageHeader, Badge, Table, Tr, Td, SearchBar, useAutoRefresh
} from "@/components/ui";

export default function MaintenancePage() {
  const { token, user } = useAuth();
  const api = createApi(token);
  const isAdmin = user?.role === "admin";

  const [records, setRecords] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [devices, setDevices] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async () => {
    try {
      const [m, d] = await Promise.all([
        api.get("/maintenance/"),
        api.get("/devices/"),
      ]);
      setRecords(m);
      setDevices(d);
      setLastUpdated(new Date());
    } catch (e) { console.error(e); }
  }, [token]);

  useEffect(() => { if (token) load(); }, [token]);
  useAutoRefresh(load, 30000);

  useEffect(() => {
    let result = [...records];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(r =>
        r.issue?.toLowerCase().includes(s) ||
        r.notes?.toLowerCase().includes(s) ||
        r.reported_by?.toLowerCase().includes(s) ||
        String(r.device_id).includes(s)
      );
    }
    if (statusFilter !== "all") result = result.filter(r => r.status === statusFilter);
    setFiltered(result);
  }, [records, search, statusFilter]);

  const openAdd = () => {
    setForm({
      device_id: devices[0]?.id || "",
      issue: "",
      status: "open",
      notes: "",
      maintenance_date: new Date().toISOString().split("T")[0],
    });
    setError("");
    setModal("add");
  };

  const openEdit = (r) => {
    setForm({ ...r });
    setError("");
    setModal("edit");
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setError("");
    try {
      if (modal === "add") await api.post("/maintenance/", form);
      else await api.put(`/maintenance/${form.id}`, form);
      await load();
      setModal(null);
    } catch (e) { setError(e.message); }
  };

  const del = async (id) => {
    if (!confirm("Delete this record?")) return;
    try {
      await api.del(`/maintenance/${id}`);
      await load();
    } catch (e) { alert(e.message); }
  };

  const openCount = records.filter(r => r.status === "open").length;
  const inProgressCount = records.filter(r => r.status === "in_progress").length;

  const getDeviceName = (id) => devices.find(d => d.id === id)?.name || `Device #${id}`;

  return (
    <AppLayout>
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <span>Maintenance</span>
            {openCount > 0 && (
              <span className="bg-red-500/20 text-red-500 border border-red-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {openCount} open
              </span>
            )}
            {inProgressCount > 0 && (
              <span className="bg-amber-500/20 text-amber-500 border border-amber-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {inProgressCount} in progress
              </span>
            )}
          </div>
        }
        action={<Btn onClick={openAdd}>+ Report Issue</Btn>}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Open", value: openCount, color: "text-red-500", bg: "bg-red-500/10 border-red-500/30" },
          { label: "In Progress", value: inProgressCount, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/30" },
          { label: "Resolved", value: records.filter(r => r.status === "resolved").length, color: "text-green-500", bg: "bg-green-500/10 border-green-500/30" },
        ].map(s => (
          <div key={s.label} className={`card border ${s.bg} p-4`}>
            <div className={`text-2xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by issue, notes, reporter..." />
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </Select>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Showing <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{filtered.length}</span> of {records.length} records
        </p>
        {lastUpdated && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Auto-refreshes every 30s · Last: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      <Table
        headers={["ID", "Device", "Issue", "Status", "Reported By", "Date", "Actions"]}
        empty={filtered.length === 0 ? "No maintenance records found." : null}
      >
        {filtered.map((r) => (
          <Tr key={r.id}>
            <Td mono>{r.id}</Td>
            <Td>
              <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                {getDeviceName(r.device_id)}
              </span>
            </Td>
            <Td>
              <span style={{ color: "var(--text-primary)" }}>{r.issue}</span>
              {r.notes && (
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{r.notes}</p>
              )}
            </Td>
            <Td><Badge value={r.status} /></Td>
            <Td>
              <span style={{ color: "var(--text-secondary)" }}>{r.reported_by || "—"}</span>
            </Td>
            <Td mono>{r.maintenance_date}</Td>
            <Td>
              <div className="flex gap-2">
                {isAdmin && (
                  <>
                    <Btn variant="outline" className="px-2 py-1 text-xs" onClick={() => openEdit(r)}>Edit</Btn>
                    <Btn variant="danger" className="px-2 py-1 text-xs" onClick={() => del(r.id)}>Delete</Btn>
                  </>
                )}
                {!isAdmin && r.status !== "resolved" && (
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>Pending review</span>
                )}
              </div>
            </Td>
          </Tr>
        ))}
      </Table>

      {modal && (
        <Modal
          title={modal === "add" ? "Report Issue" : "Edit Maintenance Record"}
          onClose={() => setModal(null)}
        >
          <ErrorAlert message={error} />

          <Field label="Device">
            <Select value={form.device_id} onChange={(e) => set("device_id", e.target.value)}>
              {devices.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>
          </Field>

          <Field label="Issue Description">
            <Textarea
              value={form.issue || ""}
              onChange={(e) => set("issue", e.target.value)}
              placeholder="Describe the issue..."
            />
          </Field>

          <Field label="Notes">
            <Textarea
              value={form.notes || ""}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Additional notes..."
            />
          </Field>

          {isAdmin && (
            <Field label="Status">
              <Select value={form.status || "open"} onChange={(e) => set("status", e.target.value)}>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </Select>
            </Field>
          )}

          <Field label="Maintenance Date">
            <Input
              type="date"
              value={form.maintenance_date || ""}
              onChange={(e) => set("maintenance_date", e.target.value)}
            />
          </Field>

          <div className="flex gap-3 mt-2">
            <Btn onClick={save}>Save</Btn>
            <Btn variant="outline" onClick={() => setModal(null)}>Cancel</Btn>
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}