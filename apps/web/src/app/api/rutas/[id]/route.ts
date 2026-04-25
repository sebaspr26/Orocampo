import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/lib/session";

const API_URL = process.env.API_URL ?? "http://localhost:4001";

async function authHeader() {
  const token = await getToken();
  return token ? `Bearer ${token}` : "";
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${API_URL}/rutas/${id}`, {
    method: "PUT",
    headers: { Authorization: await authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(await req.json()),
  });
  return NextResponse.json(await res.json(), { status: res.status });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${API_URL}/rutas/${id}`, {
    method: "DELETE",
    headers: { Authorization: await authHeader() },
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
