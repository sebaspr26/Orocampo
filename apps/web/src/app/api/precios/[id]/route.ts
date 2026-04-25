import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/lib/session";

const API_URL = process.env.API_URL ?? "http://localhost:4001";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/precios/${params.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
