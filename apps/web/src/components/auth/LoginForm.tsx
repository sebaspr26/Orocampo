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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className="bg-[#ffdad6] border border-[#ba1a1a]/15 text-[#93000a] text-sm px-4 py-3 rounded-2xl flex items-center gap-2.5">
          <span className="material-symbols-outlined" style={{ fontSize: "1rem", fontVariationSettings: "'FILL' 1" }}>error</span>
          {error}
        </div>
      )}

      {/* Email */}
      <div>
        <label className="input-label px-1">Correo institucional</label>
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#735c00]"
            style={{ fontSize: "1.125rem", color: "#c8c4b8" }}>
            mail
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@orocampo.com"
            className="input pl-11"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="input-label px-1">Contraseña</label>
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-[#735c00]"
            style={{ fontSize: "1.125rem", color: "#c8c4b8" }}>
            lock
          </span>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••••"
            className="input pl-11 pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c8c4b8] hover:text-[#735c00] transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "1.125rem" }}>
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 bg-[#735c00] py-4 rounded-full text-white font-semibold text-sm tracking-[-0.01em] shadow-md shadow-[#735c00]/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-55"
      >
        {loading ? (
          <>
            <span className="material-symbols-outlined animate-spin" style={{ fontSize: "1rem" }}>progress_activity</span>
            <span>Verificando...</span>
          </>
        ) : (
          <>
            <span>Ingresar al sistema</span>
            <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>arrow_forward</span>
          </>
        )}
      </button>
    </form>
  );
}
