"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { createApi } from "@/lib/api";
import AppLayout from "@/components/AppLayout";
import { PageHeader, Field, Input, Btn, ErrorAlert } from "@/components/ui";

export default function ProfilePage() {
  const { user, token, updateUser } = useAuth();
  const api = createApi(token);

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const [notif, setNotif] = useState({
    email: "",
    notify_device_offline: true,
    notify_warranty_expiry: true,
    notify_new_alerts: false,
  });
  const [notifSuccess, setNotifSuccess] = useState("");
  const [notifError, setNotifError] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [savingNotif, setSavingNotif] = useState(false);

  const loadNotifSettings = useCallback(async () => {
    try {
      const data = await api.get("/notifications/settings");
      setNotif(data);
    } catch (e) { console.error(e); }
  }, [token]);

  useEffect(() => { if (token) loadNotifSettings(); }, [token]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setN = (k, v) => setNotif((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setError("");
    setSuccess("");
    if (form.password && form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }
    if (form.password && form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      const data = await api.put("/auth/profile", payload);
      updateUser(data.user);
      setSuccess("Profile updated successfully!");
      setForm((f) => ({ ...f, password: "", confirm_password: "" }));
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const saveNotif = async () => {
    setNotifError("");
    setNotifSuccess("");
    setSavingNotif(true);
    try {
      await api.put("/notifications/settings", notif);
      setNotifSuccess("Notification settings saved!");
      setTimeout(() => setNotifSuccess(""), 3000);
    } catch (e) {
      setNotifError(e.message);
    } finally {
      setSavingNotif(false);
    }
  };

  const sendTest = async () => {
    setTestSending(true);
    setNotifError("");
    setNotifSuccess("");
    try {
      await api.post("/notifications/test", {});
      setNotifSuccess("Test email sent! Check your inbox.");
      setTimeout(() => setNotifSuccess(""), 4000);
    } catch (e) {
      setNotifError(e.message);
    } finally {
      setTestSending(false);
    }
  };

  const Toggle = ({ value, onChange, label, description }) => (
    <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--border)" }}>
      <div>
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{label}</p>
        {description && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className="w-11 h-6 rounded-full relative transition-colors shrink-0 ml-4"
        style={{ background: value ? "#6366f1" : "var(--border)" }}
      >
        <div
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all"
          style={{ left: value ? "24px" : "4px" }}
        />
      </button>
    </div>
  );

  return (
    <AppLayout>
      <PageHeader title="Profile & Settings" />

      <div className="max-w-xl space-y-6">
        {/* Avatar card */}
        <div className="card p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-2xl font-extrabold text-white shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>{user?.name}</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{user?.email}</p>
            <span className={`text-xs px-2 py-0.5 rounded-md font-semibold capitalize mt-1 inline-block ${
              user?.role === "admin" ? "bg-indigo-500/20 text-indigo-400" : "bg-slate-500/20 text-slate-400"
            }`}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Account details */}
        <div className="card p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "var(--text-muted)" }}>
            Account Details
          </h2>
          <ErrorAlert message={error} />
          {success && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-500 rounded-lg px-4 py-3 text-sm mb-4">
              {success}
            </div>
          )}
          <Field label="Full Name">
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Email Address">
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <div className="mt-5 mb-5" style={{ borderTop: "1px solid var(--border)" }} />
          <h2 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "var(--text-muted)" }}>
            Change Password
          </h2>
          <Field label="New Password">
            <Input type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Leave blank to keep current" />
          </Field>
          <Field label="Confirm New Password">
            <Input type="password" value={form.confirm_password} onChange={(e) => set("confirm_password", e.target.value)} placeholder="Repeat new password" />
          </Field>
          <div className="flex gap-3 mt-4">
            <Btn onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Btn>
          </div>
        </div>

        {/* Notification settings */}
        <div className="card p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "var(--text-muted)" }}>
            Email Notifications
          </h2>

          {notifError && <ErrorAlert message={notifError} />}
          {notifSuccess && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-500 rounded-lg px-4 py-3 text-sm mb-4">
              {notifSuccess}
            </div>
          )}

          <Field label="Notification Email">
            <Input
              type="email"
              value={notif.email || ""}
              onChange={(e) => setN("email", e.target.value)}
              placeholder={user?.email}
            />
          </Field>

          <div className="mt-4 mb-2">
            <Toggle
              value={notif.notify_device_offline}
              onChange={(v) => setN("notify_device_offline", v)}
              label="Device Offline Alerts"
              description="Get emailed when a device goes offline"
            />
            <Toggle
              value={notif.notify_warranty_expiry}
              onChange={(v) => setN("notify_warranty_expiry", v)}
              label="Warranty Expiry Alerts"
              description="Get emailed when a warranty is expiring soon"
            />
            <Toggle
              value={notif.notify_new_alerts}
              onChange={(v) => setN("notify_new_alerts", v)}
              label="New Alert Notifications"
              description="Get emailed for every new system alert"
            />
          </div>

          <div className="flex gap-3 mt-5">
            <Btn onClick={saveNotif} disabled={savingNotif}>
              {savingNotif ? "Saving..." : "Save Notifications"}
            </Btn>
            <Btn variant="outline" onClick={sendTest} disabled={testSending}>
              {testSending ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Sending...
                </>
              ) : "Send Test Email"}
            </Btn>
          </div>
        </div>

        {/* Account info */}
        <div className="card p-6">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>
            Account Info
          </h2>
          <div className="space-y-3">
            {[
              { label: "User ID", value: `#${user?.id}` },
              { label: "Username", value: user?.username },
              { label: "Role", value: user?.role },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span style={{ color: "var(--text-muted)" }}>{label}</span>
                <span className="font-mono font-semibold" style={{ color: "var(--text-primary)" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}