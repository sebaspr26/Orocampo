import { NextResponse } from "next/server";
import { getToken } from "@/lib/session";

const API_URL = process.env.API_URL ?? "http://localhost:4001";

export async function GET() {
  const token = await getToken();
  const res = await fetch(`${API_URL}/pagos/resumen`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
