import { NextResponse, type NextRequest } from "next/server";
import { DASHBOARD_ROUTES } from "@/lib/constants/routes";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Redirection racine vers dashboard par défaut
  if (pathname === "/") {
    return NextResponse.redirect(new URL(DASHBOARD_ROUTES.DEFAULT, request.url));
  }
  
  // Redirection /dashboard vers /dashboard/default
  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL(DASHBOARD_ROUTES.DEFAULT, request.url));
  }
  
  // Laisser l'AuthGuard gérer toute la logique d'authentification côté client
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, icons, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
};
