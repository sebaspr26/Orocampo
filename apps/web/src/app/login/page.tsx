import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex">
      {/* ── Left: Brand Panel ──────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[44%] flex-col justify-between p-14 relative overflow-hidden"
        style={{ background: "linear-gradient(150deg, #2e2200 0%, #735c00 55%, #8a7000 100%)" }}
      >
        {/* Decorative rings */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full border border-white/[0.06] pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full border border-white/[0.04] pointer-events-none" />
        <div className="absolute -bottom-40 -left-20 w-[440px] h-[440px] rounded-full border border-white/[0.04] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[280px] h-[280px] rounded-full bg-white/[0.03] pointer-events-none" />

        {/* Wordmark */}
        <div className="relative z-10 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/orocampologo.png"
            alt="Oro Campo"
            width={34}
            height={34}
            className="object-contain"
            style={{ filter: "brightness(10) saturate(0)" }}
          />
          <span className="text-white font-black text-base tracking-[-0.03em]">ORO CAMPO</span>
        </div>

        {/* Headline + features */}
        <div className="relative z-10">
          <h2 className="text-white text-[2.6rem] font-black tracking-[-0.04em] leading-[1.04]">
            Gestión inteligente para distribución láctea
          </h2>
          <p className="text-white/45 text-sm mt-4 leading-relaxed max-w-[300px]">
            Control total de ventas, inventario, rutas y clientes desde una sola plataforma.
          </p>

          <div className="mt-10 flex flex-col gap-3.5">
            {[
              { icon: "inventory_2", label: "Control de inventario en tiempo real" },
              { icon: "route", label: "Gestión de rutas y domiciliarios" },
              { icon: "analytics", label: "Reportes y métricas de ventas" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-white/70" style={{ fontSize: "0.875rem" }}>
                    {f.icon}
                  </span>
                </div>
                <span className="text-white/55 text-sm">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-white/20 text-[10px] font-semibold uppercase tracking-[0.22em]">
            Acceso seguro · AES-256 · Gestión por roles
          </p>
        </div>
      </div>

      {/* ── Right: Form Panel ──────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#fcf9f8]">
        <div className="w-full max-w-[360px]">
          {/* Mobile brand */}
          <div className="lg:hidden text-center mb-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/orocampologo.png"
              alt=""
              width={52}
              height={52}
              className="mx-auto mb-3 object-contain"
            />
            <h1 className="text-xl font-black tracking-[-0.04em] text-[#735c00]">ORO CAMPO</h1>
          </div>

          <div className="mb-9">
            <h2 className="text-[1.85rem] font-black tracking-[-0.035em] text-[#1c1b1b] leading-tight">
              Bienvenido de nuevo
            </h2>
            <p className="text-sm text-[#1c1b1b]/40 mt-2 font-medium">
              Ingresa tus credenciales para continuar.
            </p>
          </div>

          <LoginForm />

          <p className="mt-9 text-center text-[9px] font-semibold uppercase tracking-[0.22em] text-[#1c1b1b]/18">
            Acceso seguro · AES-256 cifrado
          </p>
        </div>
      </div>
    </main>
  );
}
