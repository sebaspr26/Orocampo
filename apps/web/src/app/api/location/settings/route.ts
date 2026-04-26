import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/lib/session";

const API_URL = process.env.API_URL ?? "http://localhost:4001";

async function authHeader() {
  const token = await getToken();
  return token ? `Bearer ${token}` : "";
}

export async function GET() {
  const res = await fetch(`${API_URL}/location/settings`, {
    headers: { Authorization: await authHeader() },
    cache: "no-store",
  });
  return NextResponse.json(await res.json(), { status: res.status });
}

export async function PUT(req: NextRequest) {
  const res = await fetch(`${API_URL}/location/settings`, {
    method: "PUT",
    headers: { Authorization: await authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(await req.json()),
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
