import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "orocampo-dev-secret-2024"
);

const publicRoutes = ["/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = publicRoutes.some((r) => pathname.startsWith(r));
  const isApiRoute = pathname.startsWith("/api");

  if (isApiRoute) return NextResponse.next();

  const token = request.cookies.get("token")?.value;

  if (!token) {
    if (isPublicRoute) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload.role as string;

    if (isPublicRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    const roleRoutes: Array<{ path: string; roles: string[] }> = [
      { path: "/admin", roles: ["Root"] },
      { path: "/secretaria", roles: ["Secretaria"] },
    ];

    const restricted = roleRoutes.find((r) => pathname.startsWith(r.path));
    if (restricted && !restricted.roles.includes(role)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("token");
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
