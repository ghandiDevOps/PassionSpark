import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const Schema = z.object({
  domains: z.array(z.enum(["sport", "music", "cooking", "language", "business", "art", "other"])).min(1),
  bio: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_PAYLOAD", details: parsed.error.flatten() }, { status: 400 });
  }

  // Upsert user depuis Clerk si absent en base (webhook manqué)
  let user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, role: true, coachProfile: { select: { id: true } } },
  });

  if (!user) {
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
    const name  = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || "Coach";

    const created = await db.user.upsert({
      where:  { clerkId: userId },
      update: { email, name, avatarUrl: clerkUser.imageUrl },
      create: { clerkId: userId, email, name, avatarUrl: clerkUser.imageUrl, role: "participant" },
      select: { id: true, role: true, coachProfile: { select: { id: true } } },
    });
    user = created;
    console.log(`[Onboarding] Auto-created user from Clerk: ${userId}`);
  }

  const { domains, bio } = parsed.data;

  // Atomic: change role + create/update coachProfile
  await db.$transaction([
    db.user.update({
      where: { id: user.id },
      data:  { role: "coach" },
    }),
    user.coachProfile
      ? db.coachProfile.update({
          where: { id: user.coachProfile.id },
          data:  { domains, bio: bio ?? null },
        })
      : db.coachProfile.create({
          data: { userId: user.id, domains, bio: bio ?? null },
        }),
  ]);

  return NextResponse.json({ ok: true });
}
