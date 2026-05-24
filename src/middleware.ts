import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as string | undefined;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/analista")) {
      if (role !== "ANALISTA" && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/requerente", req.url));
      }
    }

    if (path.startsWith("/requerente")) {
      if (role !== "REQUERENTE") {
        return NextResponse.redirect(new URL("/analista", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/login",
    },
  }
);

export const config = {
  matcher: ["/requerente/:path*", "/analista/:path*"],
};
