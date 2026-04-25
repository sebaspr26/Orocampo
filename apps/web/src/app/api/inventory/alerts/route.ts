import { NextResponse } from "next/server";
import { cookies } from "next/headers";
const API_URL = process.env.API_URL ?? "http://localhost:4001";
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ alerts: [] });
    const res = await fetch(`${API_URL}/inventory/alerts`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return NextResponse.json({ alerts: [] });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ alerts: [] });
  }
}
