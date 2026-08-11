import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// `/api/admin(.*)` en plus des pages : chaque handler admin recheck déjà le
// rôle en DB, mais on force auth() au niveau middleware pour éviter qu'une
// future route admin oubliée puisse être hit sans session Clerk.
const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);

const isCoachRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/sessions(.*)",
  "/profile(.*)",
  "/earnings(.*)",
  "/onboarding(.*)",
  "/analytics(.*)",
]);

const isUserRoute = createRouteMatcher([
  "/my(.*)",
  "/api/auth/redirect",
  "/api/reviews(.*)",
]);

const isPublicRoute = createRouteMatcher([
  "/",
  "/v2(.*)",
  "/s/(.*)",
  "/book/(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/explore(.*)",
  "/coaches/(.*)",
  "/legal/(.*)",
  "/api/webhooks/(.*)",
  "/api/cron/(.*)",
  "/api/bookings/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return NextResponse.next();

  // Admin, coach et user routes nécessitent une auth Clerk
  // La vérification du rôle admin se fait dans le layout admin (accès DB)
  if (isAdminRoute(req) || isCoachRoute(req) || isUserRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
