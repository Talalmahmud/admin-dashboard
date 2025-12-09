import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const token = req.cookies.get("accessToken")?.value || null;
  const role = req.cookies.get("role")?.value || null;

  const { pathname } = req.nextUrl;

  // --- PUBLIC ROUTES ---
  const publicRoutes = ["/", "/register"];
  if (publicRoutes.includes(pathname)) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // --- PROTECTED ROUTES (must have token) ---
  const protectedRoutes = ["/dashboard", "/admin", "/branch", "/delivery"];
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!token && isProtected) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // --- ROLE-BASED PROTECTION ---
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/branch") && role !== "branch") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/delivery") && role !== "delivery") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/branch/:path*",
    "/delivery/:path*",
    "/",
  ],
};
