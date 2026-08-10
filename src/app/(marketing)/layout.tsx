import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";

async function getUserRole(userId: string | null) {
  if (!userId) return null;
  try {
    const user = await db.user.findUnique({
      where:  { clerkId: userId },
      select: { role: true },
    });
    return user?.role ?? null;
  } catch {
    return null;
  }
}

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  const role = await getUserRole(userId ?? null);

  const isCoach       = role === "coach";
  const isParticipant = role === "participant";
  const isSignedIn    = !!userId;

  return (
    <>
      <MarketingNav
        isSignedIn={isSignedIn}
        isCoach={isCoach}
        isParticipant={isParticipant}
      />
      {children}
      <MarketingFooter />
    </>
  );
}
