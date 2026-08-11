import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const paramsSchema = z.string().uuid();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  // Endpoint public (guest checkout, pas de session Clerk). Le polling
  // légitime = 1 requête par seconde pendant ~60s après paiement. On plafonne
  // à 120 req/min/IP pour ne pas gêner un utilisateur normal tout en bloquant
  // l'énumération de bookingId (UUID v4 non-devinable statistiquement, mais
  // pas de raison de laisser un scan tourner en libre-service).
  const { ok } = checkRateLimit(`booking-status:${getClientIp(req)}`, { limit: 120, windowMs: 60_000 });
  if (!ok) {
    return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
  }

  // Valide l'UUID avant d'aller en DB — évite les erreurs Prisma renvoyées
  // avec un stack trace sur un id mal formé.
  if (!paramsSchema.safeParse(params.id).success) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  // Ne jamais renvoyer qrToken ici. Le QR n'est affiché que par la page de
  // confirmation (SSR), qui se re-render via router.refresh() une fois
  // status === "confirmed".
  const booking = await db.booking.findUnique({
    where: { id: params.id },
    select: { id: true, status: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ status: booking.status });
}
