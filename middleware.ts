import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // Paths that require authentication
  const protectedPaths = ["/", "/api/tasks", "/api/auth/me"]; // Adjust as needed
  const isProtectedPath = protectedPaths.some((path) => pathname === path || pathname.startsWith(path + "/"));

  // Paths that are only for guests (login, register)
  const guestPaths = ["/login", "/register"];
  const isGuestPath = guestPaths.some((path) => pathname === path);

  if (isProtectedPath) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (error) {
      console.error("JWT Verification failed:", error);
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("token");
      return response;
    }
  }

  if (isGuestPath && token) {
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.redirect(new URL("/", request.url));
    } catch (error) {
      // Token invalid, let them stay on guest path
      const response = NextResponse.next();
      response.cookies.delete("token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (except auth/me and actual protected APIs)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth/(?!me)|_next/static|_next/image|favicon.ico).*)",
  ],
};
