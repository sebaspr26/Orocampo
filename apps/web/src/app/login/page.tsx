import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#fcf9f8] relative overflow-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-[#d4af37]/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-[#f2e0c3]/20 blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-[#735c00] text-5xl" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48" }}>brand_awareness</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-[#1c1b1b] uppercase" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>ORO CAMPO</h1>
          <p className="text-xs tracking-[0.2em] text-[#7f7663] font-semibold uppercase mt-2">Premium Dairy Management</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-[#1c1b1b]/5 p-10 border border-[#e5e2e1]/50">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#1c1b1b] tracking-tight" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>Bienvenido</h2>
            <p className="text-[#5f5e5e] text-sm mt-1">Ingresa tus credenciales para acceder al portal.</p>
          </div>
          <LoginForm />
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-center gap-6 opacity-40">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">verified_user</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">AES-256 Cifrado</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">public</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Acceso Seguro</span>
          </div>
        </div>
      </div>

      {/* Decorative batch card */}
      <div className="fixed top-20 -left-12 hidden lg:block rotate-12 opacity-80 pointer-events-none">
        <div className="bg-[#d4af37] text-[#554300] p-6 rounded-3xl shadow-2xl flex flex-col gap-4 w-56">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#554300]/10 flex items-center justify-center">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>grass</span>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em]">Estado del Lote</p>
              <p className="text-lg font-bold" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>Premium Gold 04</p>
            </div>
          </div>
          <div className="bg-[#554300]/5 rounded-2xl p-4">
            <div className="flex justify-between text-[10px] font-bold opacity-70 mb-1">
              <span>CALIDAD</span>
              <span>98.4%</span>
            </div>
            <div className="w-full bg-[#554300]/10 h-1 rounded-full overflow-hidden">
              <div className="bg-[#554300] w-[98%] h-full"></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
