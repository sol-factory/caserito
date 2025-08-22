import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "./helpers/auth";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get("jwt")?.value;
  let user;

  if (!!token) {
    user = await verifyJWT(token);
  }
  const regex = /^\/(ig|wsp|fb).*\//;
  const isLinkTracker = regex.test(pathname);

  if (!isLinkTracker) {
    if (pathname === "/" && !!user?.company) {
      return NextResponse.redirect(new URL("/washes", request.url));
    }

    const isLoginPage = ["/", "/login"].includes(pathname);

    if (!isLoginPage && !user) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (!isLoginPage && pathname !== "/companies/new" && !user?.company) {
      return NextResponse.redirect(new URL("/companies/new", request.url));
    }
    const isProtectedRoute = ["/brands", "/institutions", "/admin"].includes(
      pathname
    );
    if (isProtectedRoute && user?.email !== "mgesualdo14@gmail.com") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|logo.png|user.png|sitemap.xml|icon.png|icons/*|robots.txt|manifest.json).*)",
  ],
};
