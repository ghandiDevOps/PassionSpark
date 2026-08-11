import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Appelé après connexion — redirige vers le bon espace selon le rôle
export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", appUrl));
    }

    const user = await db.user.findUnique({
      where:  { clerkId: userId },
      select: { role: true },
    });

    if (user?.role === "coach") {
      return NextResponse.redirect(new URL("/dashboard", appUrl));
    }

    return NextResponse.redirect(new URL("/my", appUrl));
  } catch (error) {
    console.error("[auth/redirect] failed to resolve post-auth redirect:", error);
    return NextResponse.redirect(new URL("/sign-in?error=redirect_failed", appUrl));
  }
}
