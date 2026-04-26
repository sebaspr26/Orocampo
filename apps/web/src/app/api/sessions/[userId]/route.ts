import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/lib/session";

const API_URL = process.env.API_URL ?? "http://localhost:4001";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const token = await getToken();
  const res = await fetch(`${API_URL}/sessions/${userId}`, {
    method: "DELETE",
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  });
  return NextResponse.json(await res.json(), { status: res.status });
}
