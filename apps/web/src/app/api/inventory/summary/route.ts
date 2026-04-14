import { NextResponse } from "next/server";
import { cookies } from "next/headers";
const API_URL = process.env.API_URL ?? "http://localhost:4001";
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value ?? "";
  const res = await fetch(`${API_URL}/inventory/summary`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
