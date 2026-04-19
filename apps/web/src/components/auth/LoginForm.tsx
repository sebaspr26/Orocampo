"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Correo o contraseña incorrectos");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Ocurrió un error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-[#ffdad6] border border-[#ba1a1a]/20 text-[#93000a] text-sm px-4 py-3 rounded-2xl flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">error</span>
          {error}
        </div>
      )}

      {/* Email */}
      <div className="space-y-2">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-[#7f7663] px-1">
          Correo institucional
        </label>
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#7f7663] text-lg transition-colors group-focus-within:text-[#735c00]">mail</span>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@orocampo.com"
            className="w-full pl-12 pr-4 py-4 bg-[#f6f3f2] border-none rounded-2xl text-[#1c1b1b] placeholder:text-[#d0c5af] focus:outline-none focus:ring-1 focus:ring-[#d4af37] transition-all text-sm"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-[#7f7663]">
            Contraseña
          </label>
        </div>
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#7f7663] text-lg transition-colors group-focus-within:text-[#735c00]">lock</span>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••••••"
            className="w-full pl-12 pr-12 py-4 bg-[#f6f3f2] border-none rounded-2xl text-[#1c1b1b] placeholder:text-[#d0c5af] focus:outline-none focus:ring-1 focus:ring-[#d4af37] transition-all text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7f7663] hover:text-[#1c1b1b] transition-colors"
          >
            <span className="material-symbols-outlined text-lg">
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full editorial-gradient py-5 rounded-full text-white font-extrabold text-sm tracking-widest uppercase shadow-xl shadow-[#d4af37]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        style={{ fontFamily: 'var(--font-manrope), sans-serif' }}
      >
        <span>{loading ? "Verificando..." : "Ingresar al Sistema"}</span>
        {!loading && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
        {loading && <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>}
      </button>
    </form>
  );
}
