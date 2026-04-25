import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.API_URL ?? "http://localhost:4001";

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const store = await cookies();
  const token = store.get("token")?.value;
  const { id } = await params;
  const res = await fetch(`${API_URL}/motos/${id}/toggle`, {
    method: "PATCH",
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
