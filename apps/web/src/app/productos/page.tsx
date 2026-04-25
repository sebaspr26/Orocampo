import { redirect } from "next/navigation";
import { getSession, getToken } from "@/lib/session";
import AppLayout from "@/components/layout/AppLayout";
import ProductosView from "@/components/productos/ProductosView";

const API_URL = process.env.API_URL ?? "http://localhost:4001";

export default async function ProductosPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (!["Administrador", "Secretaria"].includes(user.role)) redirect("/dashboard");

  const token = await getToken();
  const res = await fetch(`${API_URL}/product-types`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = res.ok ? await res.json() : { productTypes: [] };

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-[#1c1b1b]" style={{ fontFamily: "var(--font-manrope), sans-serif" }}>
            Tipos de producto
          </h1>
          <p className="text-sm text-[#7f7663] mt-1">
            {data.productTypes.length} producto{data.productTypes.length !== 1 ? "s" : ""} registrado{data.productTypes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <ProductosView initialProductos={data.productTypes} />
      </div>
    </AppLayout>
  );
}
