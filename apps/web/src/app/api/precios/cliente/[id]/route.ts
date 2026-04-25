import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/lib/session";

const API_URL = process.env.API_URL ?? "http://localhost:4001";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/precios/cliente/${params.id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
