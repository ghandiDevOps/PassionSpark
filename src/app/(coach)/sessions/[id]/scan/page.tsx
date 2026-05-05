import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ScanClient } from "@/components/scanner/scan-client";

interface Props {
  params: { id: string };
}

export const metadata = { title: "Scanner · Passion Spark" };

export default async function ScanPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where:   { clerkId: userId },
    include: { coachProfile: true },
  });
  if (!user?.coachProfile) redirect("/onboarding");

  const session = await db.session.findUnique({
    where: { id: params.id },
    include: {
      bookings: {
        where:   { status: { in: ["confirmed", "attended"] } },
        orderBy: [{ status: "asc" }, { paidAt: "asc" }],
        select: {
          id:               true,
          qrToken:          true,
          participantName:  true,
          participantEmail: true,
          status:           true,
          scannedAt:        true,
        },
      },
    },
  });

  if (!session) notFound();
  if (session.coachId !== user.coachProfile.id) notFound();

  return (
    <ScanClient
      sessionId={session.id}
      sessionTitle={session.title}
      initialBookings={session.bookings.map((b) => ({
        id:               b.id,
        qrToken:          b.qrToken,
        participantName:  b.participantName,
        participantEmail: b.participantEmail,
        status:           b.status as "confirmed" | "attended",
        scannedAt:        b.scannedAt ? b.scannedAt.toISOString() : null,
      }))}
    />
  );
}
