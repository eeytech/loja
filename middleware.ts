import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("session_token")?.value;

  if (!sessionToken) {
    const loginUrl = new URL("/authentication", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
