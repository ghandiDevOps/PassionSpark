import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import {
  stripe,
  createConnectAccount,
  createConnectOnboardingLink,
} from "@/lib/stripe";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { coachProfile: true },
    });

    if (!user?.coachProfile) {
      return Response.json({ error: "Coach profile not found" }, { status: 404 });
    }

    let stripeAccountId = user.coachProfile.stripeAccountId;

    if (!stripeAccountId) {
      // Un compte Stripe Connect est lié à un email : on n'en crée pas
      // tant que Clerk n'a pas confirmé la possession de l'adresse
      // (sinon un attaquant qui ajoute un email non-vérifié sur son
      // compte peut se faire attribuer un Stripe account à cet email).
      if (!user.emailVerified) {
        return Response.json({ error: "EMAIL_NOT_VERIFIED" }, { status: 403 });
      }
      const account = await createConnectAccount(user.email);
      stripeAccountId = account.id;

      await db.coachProfile.update({
        where: { id: user.coachProfile.id },
        data:  { stripeAccountId },
      });
    }

    const accountLink = await createConnectOnboardingLink(
      stripeAccountId,
      `${process.env.NEXT_PUBLIC_APP_URL}/onboarding?stripe_success=true`,
      `${process.env.NEXT_PUBLIC_APP_URL}/onboarding?stripe_refresh=true`,
    );

    return Response.json({ url: accountLink.url });
  } catch (error) {
    console.error("[STRIPE_CONNECT_ERROR]", error);
    return Response.json({ error: "Failed to create Stripe onboarding link" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { coachProfile: true },
    });

    if (!user?.coachProfile?.stripeAccountId) {
      return Response.json({ status: "not_started" });
    }

    const account = await stripe.accounts.retrieve(user.coachProfile.stripeAccountId);

    const chargesEnabled = account.charges_enabled;
    const payoutsEnabled = account.payouts_enabled;
    const hasPendingReqs = !!account.requirements?.currently_due?.length;

    const newStatus =
      chargesEnabled && payoutsEnabled ? "active"
      : hasPendingReqs                 ? "pending"
      :                                  "incomplete";

    if (user.coachProfile.stripeOnboardingStatus !== newStatus) {
      await db.coachProfile.update({
        where: { id: user.coachProfile.id },
        data:  { stripeOnboardingStatus: newStatus as any },
      });
    }

    return Response.json({
      status: newStatus,
      chargesEnabled,
      payoutsEnabled,
      requirements: account.requirements?.currently_due || [],
    });
  } catch (error) {
    console.error("[STRIPE_STATUS_ERROR]", error);
    return Response.json({ error: "Failed to check Stripe status" }, { status: 500 });
  }
}
