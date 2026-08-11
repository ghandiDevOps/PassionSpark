import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  // Ne jamais renvoyer qrToken ici : cet endpoint est public (guest checkout,
  // pas de session Clerk) et n'est utilisé que pour du polling de statut.
  // Le QR n'est affiché que côté page de confirmation (SSR, cf. page.tsx),
  // qui se re-render via router.refresh() une fois le statut "confirmed".
  const booking = await db.booking.findUnique({
    where: { id: params.id },
    select: { id: true, status: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ status: booking.status });
}
