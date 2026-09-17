import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;
  const isProtected =
    pathname === "/" ||
    pathname.startsWith("/coaching") ||
    pathname.startsWith("/dashboard");

  if (!token && isProtected) {
    const callbackUrl = pathname === "/" ? "/coaching/new" : pathname;
    return NextResponse.redirect(
      new URL(
        `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`,
        request.url,
      ),
    );
  }

  if (token && !token.acceptedAgreementVersion && isProtected) {
    return NextResponse.redirect(new URL("/agreement", request.url));
  }

  if (token && pathname.startsWith("/dashboard") && token.role !== "admin") {
    return NextResponse.redirect(new URL("/coaching/new", request.url));
  }

  if (token?.acceptedAgreementVersion && pathname === "/agreement") {
    return NextResponse.redirect(
      new URL(
        token.role === "admin" ? "/dashboard" : "/coaching/new",
        request.url,
      ),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|assets|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
