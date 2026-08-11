import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { z } from "zod";

const ActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("cancel"), reason: z.string().min(1).max(500) }),
  z.object({ action: z.literal("unpublish") }),
  z.object({ action: z.literal("publish") }),
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

  const { id: sessionId } = await params;

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

  const session = await db.session.findUnique({
    where: { id: sessionId },
    select: { id: true, status: true, title: true },
  });
  if (!session) return NextResponse.json({ error: "SESSION_NOT_FOUND" }, { status: 404 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;

  switch (parsed.data.action) {
    case "cancel": {
      if (session.status === "cancelled") {
        return NextResponse.json({ error: "ALREADY_CANCELLED" }, { status: 409 });
      }
      await db.session.update({
        where: { id: sessionId },
        data: { status: "cancelled", cancellationReason: parsed.data.reason },
      });
      await logAudit({
        adminId: admin.id,
        action: "CANCEL_SESSION",
        targetType: "session",
        targetId: sessionId,
        metadata: { reason: parsed.data.reason, title: session.title },
        ip,
      });
      return NextResponse.json({ ok: true });
    }

    case "unpublish": {
      if (!["published", "full"].includes(session.status)) {
        return NextResponse.json({ error: "CANNOT_UNPUBLISH" }, { status: 409 });
      }
      await db.session.update({
        where: { id: sessionId },
        data: { status: "draft" },
      });
      await logAudit({
        adminId: admin.id,
        action: "UNPUBLISH_SESSION",
        targetType: "session",
        targetId: sessionId,
        metadata: { title: session.title, previousStatus: session.status },
        ip,
      });
      return NextResponse.json({ ok: true });
    }

    case "publish": {
      if (session.status !== "draft") {
        return NextResponse.json({ error: "NOT_A_DRAFT" }, { status: 409 });
      }
      await db.session.update({
        where: { id: sessionId },
        data: { status: "published" },
      });
      await logAudit({
        adminId: admin.id,
        action: "PUBLISH_SESSION",
        targetType: "session",
        targetId: sessionId,
        metadata: { title: session.title },
        ip,
      });
      return NextResponse.json({ ok: true });
    }
  }
}
