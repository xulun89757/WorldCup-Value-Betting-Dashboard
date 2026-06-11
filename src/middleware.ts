import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  isAccessGateEnabled,
  isValidAccessToken,
} from "./lib/access-gate";

const PUBLIC_PATHS = ["/login"];
const AUTH_API_PREFIX = "/api/auth";

function isPublicPath(pathname: string) {
  return (
    PUBLIC_PATHS.includes(pathname) || pathname.startsWith(AUTH_API_PREFIX)
  );
}

export async function middleware(request: NextRequest) {
  if (!isAccessGateEnabled()) {
    return NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const hasAccess = await isValidAccessToken(token);

  if (hasAccess && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (hasAccess || isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "需要先输入访问密码。" },
      { status: 401 },
    );
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
