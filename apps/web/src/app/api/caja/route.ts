import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/lib/session";

const API_URL = process.env.API_URL ?? "http://localhost:4001";

export async function GET(req: NextRequest) {
  const token = await getToken();
  const search = req.nextUrl.searchParams.toString();
  const url = search.includes("preview") ? `${API_URL}/caja/preview` : `${API_URL}/caja`;
  const res = await fetch(search ? `${url}?${search}` : url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const token = await getToken();
  const body = await req.json();
  const res = await fetch(`${API_URL}/caja`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
