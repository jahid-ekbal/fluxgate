import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { describeVisit } from "@/server/geo";

const SKIP = ["/api/", "/_next/", "/favicon.ico"];

export const proxy = (request: NextRequest, event: NextFetchEvent) => {
  const { pathname } = request.nextUrl;
  const isPrivate =
    pathname.startsWith("/browse") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/seller") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/profile");
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie && isPrivate) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (!SKIP.some((prefix) => pathname.startsWith(prefix))) {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
    const visit = describeVisit(request.headers, ip, pathname);
    event.waitUntil(
      fetch(new URL("/api/visits", request.url), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(visit),
      })
        .then(async (response) => {
          if (!response.ok) {
            console.log(`[proxy-visit] ${pathname} -> ${response.status}`);
          }
        })
        .catch((error: unknown) => {
          console.log(`[proxy-visit] ${pathname} failed: ${String(error)}`);
        }),
    );
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    "/browse/:path*",
    "/admin/:path*",
    "/seller/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/sign-in",
    "/sign-up",
    "/",
  ],
};
