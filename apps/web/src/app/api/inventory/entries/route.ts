import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
const API_URL = process.env.API_URL ?? "http://localhost:4001";
async function getAuth() {
  const c = await cookies();
  return `Bearer ${c.get("token")?.value ?? ""}`;
}
export async function GET() {
  const auth = await getAuth();
  const res = await fetch(`${API_URL}/inventory/entries`, { headers: { Authorization: auth }, cache: "no-store" });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
export async function POST(req: NextRequest) {
  const auth = await getAuth();
  const body = await req.json();
  const res = await fetch(`${API_URL}/inventory/entries`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: auth }, body: JSON.stringify(body) });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
