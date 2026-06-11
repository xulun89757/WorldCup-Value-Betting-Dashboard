import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE_NAME } from "@/lib/access-gate";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url), 303);

  response.cookies.set(ACCESS_COOKIE_NAME, "", {
    expires: new Date(0),
    path: "/",
  });

  return response;
}
