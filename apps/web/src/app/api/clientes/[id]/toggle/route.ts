import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/lib/session";

const API_URL = process.env.API_URL ?? "http://localhost:4001";

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getToken();
  const { id } = await params;
  const res = await fetch(`${API_URL}/clientes/${id}/toggle`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
