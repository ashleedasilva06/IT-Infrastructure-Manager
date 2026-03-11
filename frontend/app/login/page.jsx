"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { createApi } from "@/lib/api";
import Image from "next/image";
export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const api = createApi(null);
      const data = await api.post("/auth/login", form);
      login(data.user, data.access_token);
    } catch (e) {
      setError(e.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #020617 0%, #0f172a 50%, #020617 100%)" }}>

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "0.5s" }} />

        {/* Grid */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: "50px 50px"
        }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <Image
      src="/logo3.png"
      alt="IT Infrastructure Manager Logo"
      width={600}
      height={120}
      className="h-44 w-auto object-cover"
      priority
    />
          </div>

          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Manage your infrastructure
            <span className="block" style={{ background: "linear-gradient(90deg, #818cf8, #22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              with confidence
            </span>
          </h1>

          <p className="text-slate-400 text-lg mb-12 max-w-md">
            Streamline your IT operations with our comprehensive infrastructure management platform.
          </p>

          <div className="space-y-5">
            {[
              { title: "Enterprise Security", desc: "Bank-grade encryption & compliance", icon: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" },
              { title: "Real-time Monitoring", desc: "24/7 system health tracking", icon: "M7 2v11h3v9l7-12h-4l4-8z" },
              { title: "Scalable Infrastructure", desc: "Grow without limits", icon: "M20 2H4c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 6H4V4h16v4z" },
            ].map((f, i) => (
              <div key={f.title} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(30,41,59,0.5)", border: "1px solid rgba(71,85,105,0.5)" }}>
                  <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d={f.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-medium text-sm">{f.title}</h3>
                  <p className="text-slate-500 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg" style={{ background: "linear-gradient(135deg, #6366f1, #9333ea)" }}>
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 6H4V4h16v4zM4 14h16c1.1 0 2-.9 2-2v-.01c0-1.1-.9-1.99-2-1.99H4c-1.1 0-2 .89-2 1.99V12c0 1.1.9 2 2 2zm0 8h16c1.1 0 2-.9 2-2v-.01c0-1.1-.9-1.99-2-1.99H4c-1.1 0-2 .89-2 1.99V20c0 1.1.9 2 2 2z"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">IT Infrastructure</h1>
          </div>

          {/* Card */}
          <div style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(20px)", border: "1px solid rgba(51,65,85,0.5)", borderRadius: "16px", padding: "32px" }}>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
              <p className="text-slate-400 text-sm">Enter your credentials to access your account</p>
            </div>

            {error && (
              <div className="mb-6 px-4 py-3 rounded-lg text-sm text-red-400" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full h-11 px-4 rounded-lg text-white text-sm outline-none transition"
                  style={{ background: "rgba(2,6,23,0.5)", border: "1px solid #334155", fontFamily: "inherit" }}
                  onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                  onBlur={(e) => e.target.style.borderColor = "#334155"}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full h-11 px-4 pr-11 rounded-lg text-white text-sm outline-none transition"
                    style={{ background: "rgba(2,6,23,0.5)", border: "1px solid #334155", fontFamily: "inherit" }}
                    onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                    onBlur={(e) => e.target.style.borderColor = "#334155"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-indigo-500" />
                  <span className="text-sm text-slate-400">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-indigo-400 hover:text-indigo-300 transition">
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg text-white text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #6366f1, #9333ea)", boxShadow: "0 4px 15px rgba(99,102,241,0.25)" }}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Signing in...
                  </>
                ) : "Sign In"}
              </button>
            </form>

            <p className="mt-8 text-center text-slate-400 text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition">
                Create an account
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-slate-600 text-xs">
            © 2025 IT Infrastructure Manager. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}