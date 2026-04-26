import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:4001";

export async function POST(req: NextRequest) {
  const apiUrl = process.env.API_URL ?? "http://localhost:4001";
  try {
    const body = await req.json();

    const apiRes = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const text = await apiRes.text();
    let data;
    try { data = JSON.parse(text); } catch { return NextResponse.json({ error: "API response not JSON", body: text, url: apiUrl }, { status: 502 }); }

    if (!apiRes.ok) {
      return NextResponse.json(data, { status: apiRes.status });
    }

    const response = NextResponse.json({ success: true, user: data.user });

    response.cookies.set("token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    return NextResponse.json({ error: "Error al conectar con el servidor", detail: String(err), apiUrl }, { status: 500 });
  }
}
