import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifyToken } from "@/lib/auth/session";

/**
 * حماية مبدئية لمسارات الداشبورد (Next 16: Proxy بدل Middleware).
 * التحقق الحقيقي يتم أيضاً داخل كل Server Action عبر requireAdmin().
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isLogin = pathname === "/dashboard/login";
  const ok = await verifyToken(req.cookies.get(SESSION_COOKIE)?.value);

  if (!ok && !isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (ok && isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
