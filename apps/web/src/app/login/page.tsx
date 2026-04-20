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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/orocampologo.png" alt="Oro Campo" width={80} height={80} className="object-contain" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-[#1c1b1b] uppercase" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>ORO CAMPO</h1>
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

    </main>
  );
}
