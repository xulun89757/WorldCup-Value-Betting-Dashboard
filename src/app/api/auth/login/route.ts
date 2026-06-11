import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  createAccessToken,
  isAccessGateEnabled,
  isCorrectPassword,
} from "@/lib/access-gate";

function getSafeNextPath(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "/";
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const password = formData.get("password");
  const nextPath = getSafeNextPath(formData.get("next"));

  if (!isAccessGateEnabled()) {
    return NextResponse.redirect(new URL(nextPath, request.url), 303);
  }

  if (typeof password !== "string" || !isCorrectPassword(password)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "1");
    loginUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(loginUrl, 303);
  }

  const response = NextResponse.redirect(new URL(nextPath, request.url), 303);
  response.cookies.set(ACCESS_COOKIE_NAME, await createAccessToken(), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
