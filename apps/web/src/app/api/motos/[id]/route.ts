import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.API_URL ?? "http://localhost:4001";

async function getAuth() {
  const store = await cookies();
  const token = store.get("token")?.value;
  return token ? `Bearer ${token}` : "";
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const [auth, { id }, body] = await Promise.all([getAuth(), params, req.json()]);
  const res = await fetch(`${API_URL}/motos/${id}`, {
    method: "PUT",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const [auth, { id }] = await Promise.all([getAuth(), params]);
  const res = await fetch(`${API_URL}/motos/${id}`, {
    method: "DELETE",
    headers: { Authorization: auth },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
