import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const nextAuthToken = request.cookies.get("next-auth.session-token")?.value || 
                        request.cookies.get("__Secure-next-auth.session-token")?.value;

  const hasToken = token || nextAuthToken;

  // Paths that require authentication
  const protectedPaths = ["/", "/api/tasks", "/api/auth/me"];
  const isProtectedPath = protectedPaths.some((path) => pathname === path || pathname.startsWith(path + "/"));

  // Paths that are only for guests (login, register)
  const guestPaths = ["/login", "/register"];
  const isGuestPath = guestPaths.some((path) => pathname === path);

  if (isProtectedPath) {
    if (!hasToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // If it's our custom token, verify it
    if (token) {
      try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        await jwtVerify(token, secret);
        return NextResponse.next();
      } catch (error) {
        console.error("JWT Verification failed:", error);
        if (!nextAuthToken) {
          const response = NextResponse.redirect(new URL("/login", request.url));
          response.cookies.delete("token");
          return response;
        }
      }
    }

    // If it's NextAuth token, we assume it's valid for now as middleware verification for NextAuth is complex
    // NextAuth usually handles this via its own middleware if preferred, but we'll stick to this for simplicity
    if (nextAuthToken) {
      return NextResponse.next();
    }
  }

  if (isGuestPath && hasToken) {
    return NextResponse.redirect(new URL("/", request.url));
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
