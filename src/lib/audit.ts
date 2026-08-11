import { db } from "@/lib/db";

export type AuditAction =
  | "BAN_USER"
  | "UNBAN_USER"
  | "CHANGE_ROLE"
  | "CANCEL_SESSION"
  | "UNPUBLISH_SESSION"
  | "PUBLISH_SESSION"
  | "REFUND_BOOKING"
  | "DELETE_REVIEW";

export type AuditTargetType = "user" | "session" | "booking" | "review";

export async function logAudit({
  adminId,
  action,
  targetType,
  targetId,
  metadata,
  ip,
}: {
  adminId: string;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
  ip?: string;
}) {
  try {
    await db.auditLog.create({
      data: { adminId, action, targetType, targetId, metadata, ip },
    });
  } catch (err) {
    // Ne pas bloquer l'action si le log échoue — juste alerter
    console.error("[Audit] Failed to log action:", action, err);
  }
}
