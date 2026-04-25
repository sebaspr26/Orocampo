import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/lib/session";

const API_URL = process.env.API_URL ?? "http://localhost:4001";

export async function GET(req: NextRequest, { params }: { params: { tipo: string } }) {
  const token = await getToken();
  const search = req.nextUrl.searchParams.toString();
  const url = `${API_URL}/reportes/${params.tipo}${search ? `?${search}` : ""}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
