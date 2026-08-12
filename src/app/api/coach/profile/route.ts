import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const PatchSchema = z.object({
  bio: z.string().max(200).optional(),
  instagramUrl: z.string().url("URL Instagram invalide").optional().or(z.literal("")),
  tiktokUrl:    z.string().url("URL TikTok invalide").optional().or(z.literal("")),
});

/** GET — récupère le profil du coach connecté */
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const user = await db.user.findUnique({
    where:   { clerkId: userId },
    include: { coachProfile: true },
  });

  if (!user?.coachProfile) {
    return NextResponse.json({ error: "PROFILE_NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({
    name:                  user.name,
    email:                 user.email,
    avatarUrl:             user.avatarUrl,
    bio:                   user.coachProfile.bio,
    domains:               user.coachProfile.domains,
    instagramUrl:          user.coachProfile.instagramUrl,
    tiktokUrl:             user.coachProfile.tiktokUrl,
    stripeOnboardingStatus: user.coachProfile.stripeOnboardingStatus,
    avgRating:             user.coachProfile.avgRating,
    totalSessions:         user.coachProfile.totalSessions,
  });
}

/** PATCH — met à jour bio + réseaux sociaux */
export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_PAYLOAD", details: parsed.error.flatten() }, { status: 400 });
  }

  const user = await db.user.findUnique({
    where:   { clerkId: userId },
    include: { coachProfile: true },
  });

  if (!user?.coachProfile) {
    return NextResponse.json({ error: "PROFILE_NOT_FOUND" }, { status: 404 });
  }

  const { bio, instagramUrl, tiktokUrl } = parsed.data;

  const updated = await db.coachProfile.update({
    where: { id: user.coachProfile.id },
    data:  {
      bio:          bio ?? undefined,
      instagramUrl: instagramUrl !== undefined ? (instagramUrl || null) : undefined,
      tiktokUrl:    tiktokUrl !== undefined    ? (tiktokUrl    || null) : undefined,
    },
  });

  return NextResponse.json({ ok: true, bio: updated.bio });
}
