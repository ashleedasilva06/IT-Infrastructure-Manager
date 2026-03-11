"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ ...form, role: "user" }),
      });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-10 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-indigo-600 flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 6H4V4h16v4zM4 14h16c1.1 0 2-.9 2-2v-.01c0-1.1-.9-1.99-2-1.99H4c-1.1 0-2 .89-2 1.99V12c0 1.1.9 2 2 2zm0 8h16c1.1 0 2-.9 2-2v-.01c0-1.1-.9-1.99-2-1.99H4c-1.1 0-2 .89-2 1.99V20c0 1.1.9 2 2 2z"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-100">Create Account</h1>
          <p className="text-slate-500 text-sm mt-1">You will be registered as a standard user</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg px-4 py-3 text-sm mb-6">
            Account created! Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            ["name", "Full Name", "text"],
            ["email", "Email", "email"],
            ["username", "Username", "text"],
            ["password", "Password", "password"]
          ].map(([key, label, type]) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                {label}
              </label>
              <input
                type={type}
                required
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          ))}

          {/* Role notice */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-xs text-slate-400">
            🔒 New accounts are created as <span className="text-indigo-400 font-semibold">Standard User</span>. Contact your admin to get elevated access.
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition text-sm"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>

          <p className="text-center text-slate-500 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}