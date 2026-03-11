"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createApi } from "@/lib/api";
import AppLayout from "@/components/AppLayout";
import { Btn, ErrorAlert, Field, Input, Modal, PageHeader, Table, Td, Tr } from "@/components/ui";

const EMPTY = { device_id: "", user_id: "", employee_name: "", department: "", assigned_date: "" };

export default function AssignmentsPage() {
  const { token, user } = useAuth();
  const api = createApi(token);
  const [assignments, setAssignments] = useState([]);
  const [users, setUsers] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  const load = () => api.get("/assignments/").then(setAssignments);
  const loadUsers = () => api.get("/auth/users").then(setUsers);

  useEffect(() => {
    if (token) {
      load();
      if (user?.role === "admin") loadUsers();
    }
  }, [token]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const openAdd = () => { setForm(EMPTY); setError(""); setModal("add"); };
  const openEdit = (a) => {
    setForm({ ...a, assigned_date: a.assigned_date?.slice(0, 10) });
    setError(""); setModal(a);
  };

  const save = async () => {
    setError("");
    try {
      const payload = {
        ...form,
        device_id: parseInt(form.device_id),
        user_id: form.user_id ? parseInt(form.user_id) : null,
      };
      if (modal === "add") await api.post("/assignments/", payload);
      else await api.put(`/assignments/${modal.id}`, payload);
      setModal(null); load();
    } catch (e) { setError(e.message); }
  };

  const remove = async (id) => {
    if (!confirm("Remove this assignment?")) return;
    await api.del(`/assignments/${id}`); load();
  };

  return (
    <AppLayout>
      <PageHeader
        title="Assignments"
        action={user?.role === "admin" && (
          <Btn onClick={openAdd}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            Assign Device
          </Btn>
        )}
      />

      {user?.role !== "admin" && (
        <div className="bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-lg px-4 py-3 text-sm mb-6">
          Showing only devices assigned to you.
        </div>
      )}

      <Table
        headers={["#", "Device ID", "Employee", "Department", "Assigned To", "Assigned Date", "Actions"]}
        empty={assignments.length === 0 ? "No assignments found." : null}
      >
        {assignments.map((a) => (
          <Tr key={a.id}>
            <Td mono>{a.id}</Td>
            <Td mono>{a.device_id}</Td>
            <Td><span className="font-semibold text-slate-100">{a.employee_name}</span></Td>
            <Td>{a.department}</Td>
            <Td mono>{a.user_id ? `User #${a.user_id}` : "—"}</Td>
            <Td mono>{a.assigned_date}</Td>
            <Td>
              {user?.role === "admin" && (
                <div className="flex gap-2">
                  <Btn variant="outline" className="px-2 py-1 text-xs" onClick={() => openEdit(a)}>Edit</Btn>
                  <Btn variant="danger" className="px-2 py-1 text-xs" onClick={() => remove(a.id)}>Delete</Btn>
                </div>
              )}
            </Td>
          </Tr>
        ))}
      </Table>

      {modal && (
        <Modal title={modal === "add" ? "Assign Device" : "Edit Assignment"} onClose={() => setModal(null)}>
          <ErrorAlert message={error} />
          <Field label="Device ID">
            <Input type="number" value={form.device_id || ""} onChange={(e) => set("device_id", e.target.value)} />
          </Field>
          <Field label="Assign To User">
            <select
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition"
              value={form.user_id || ""}
              onChange={(e) => {
                const selected = users.find(u => u.id === parseInt(e.target.value));
                set("user_id", e.target.value);
                if (selected) set("employee_name", selected.name);
              }}
            >
              <option value="">-- Select User --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.username})</option>
              ))}
            </select>
          </Field>
          <Field label="Employee Name">
            <Input value={form.employee_name || ""} onChange={(e) => set("employee_name", e.target.value)} />
          </Field>
          <Field label="Department">
            <Input value={form.department || ""} onChange={(e) => set("department", e.target.value)} />
          </Field>
          <Field label="Assigned Date">
            <Input type="date" value={form.assigned_date || ""} onChange={(e) => set("assigned_date", e.target.value)} />
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