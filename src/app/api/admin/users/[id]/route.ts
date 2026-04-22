import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { z } from "zod";

const ActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("ban"), reason: z.string().min(1).max(500) }),
  z.object({ action: z.literal("unban") }),
  z.object({
    action: z.literal("change_role"),
    newRole: z.enum(["participant", "coach", "admin"]),
  }),
]);

async function getAdminUser(clerkId: string) {
  return db.user.findUnique({
    where: { clerkId },
    select: { id: true, role: true },
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const admin = await getAdminUser(clerkId);
  if (!admin || admin.role !== "admin") {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }

  const { id: targetUserId } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = ActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_PAYLOAD", details: parsed.error.flatten() }, { status: 400 });
  }

  const target = await db.user.findUnique({
    where: { id: targetUserId, deletedAt: null },
    select: { id: true, role: true, bannedAt: true },
  });
  if (!target) return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;

  switch (parsed.data.action) {
    case "ban": {
      if (target.bannedAt) {
        return NextResponse.json({ error: "ALREADY_BANNED" }, { status: 409 });
      }
      await db.user.update({
        where: { id: targetUserId },
        data: { bannedAt: new Date(), bannedReason: parsed.data.reason },
      });
      await logAudit({
        adminId: admin.id,
        action: "BAN_USER",
        targetType: "user",
        targetId: targetUserId,
        metadata: { reason: parsed.data.reason },
        ip,
      });
      return NextResponse.json({ ok: true });
    }

    case "unban": {
      if (!target.bannedAt) {
        return NextResponse.json({ error: "NOT_BANNED" }, { status: 409 });
      }
      await db.user.update({
        where: { id: targetUserId },
        data: { bannedAt: null, bannedReason: null },
      });
      await logAudit({
        adminId: admin.id,
        action: "UNBAN_USER",
        targetType: "user",
        targetId: targetUserId,
        ip,
      });
      return NextResponse.json({ ok: true });
    }

    case "change_role": {
      const { newRole } = parsed.data;
      if (target.role === newRole) {
        return NextResponse.json({ error: "SAME_ROLE" }, { status: 409 });
      }
      await db.user.update({
        where: { id: targetUserId },
        data: { role: newRole },
      });
      await logAudit({
        adminId: admin.id,
        action: "CHANGE_ROLE",
        targetType: "user",
        targetId: targetUserId,
        metadata: { oldRole: target.role, newRole },
        ip,
      });
      return NextResponse.json({ ok: true });
    }
  }
}
