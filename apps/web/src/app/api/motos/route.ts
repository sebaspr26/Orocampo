import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.API_URL ?? "http://localhost:4001";

async function getAuth() {
  const store = await cookies();
  const token = store.get("token")?.value;
  return token ? `Bearer ${token}` : "";
}

export async function GET() {
  const auth = await getAuth();
  const res = await fetch(`${API_URL}/motos`, {
    headers: { Authorization: auth },
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const auth = await getAuth();
  const body = await req.json();
  const res = await fetch(`${API_URL}/motos`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
