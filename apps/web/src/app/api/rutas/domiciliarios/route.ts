import { NextResponse } from "next/server";
import { getToken } from "@/lib/session";

const API_URL = process.env.API_URL ?? "http://localhost:4001";

export async function GET() {
  const token = await getToken();
  const res = await fetch(`${API_URL}/rutas/domiciliarios`, {
    headers: { Authorization: token ? `Bearer ${token}` : "" },
    cache: "no-store",
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
