import Stripe from "stripe";

// Singleton Stripe Server
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
  typescript: true,
});

// ─── Répartition Passion Spark ───────────────────────────────────────────────
// Coach         : 70%
// Passion Spark : 23%  (frais de plateforme retenus via application_fee_amount)
// Parrainage    :  7%  (inclus dans les 30% non-coach ; reversé au référent si applicable)
export const COACH_SHARE        = 0.70;
export const PLATFORM_FEE      = 0.23;
export const REFERRAL_FEE      = 0.07;

/** @deprecated use PLATFORM_FEE */
export const PLATFORM_FEE_PERCENT = PLATFORM_FEE;

/**
 * Calcule la décomposition complète d'un paiement Passion Spark.
 * application_fee_amount = frais Passion Spark (23%) + parrainage (7%) = 30%
 * Le coach reçoit 70% via Stripe Connect Destination Charge.
 * Note : si le coach est lui-même le référent, le 7% lui est reversé manuellement
 * (ou via un Transfer séparé post-session).
 */
export function calculateAmounts(
  priceCents: number,
  coachIsReferrer = false,
) {
  const platformFeeCents = Math.round(priceCents * PLATFORM_FEE);
  const referralFeeCents = Math.round(priceCents * REFERRAL_FEE);
  // application_fee = tout ce que Passion Spark retient via Stripe (23% + 7%)
  const applicationFeeCents = platformFeeCents + referralFeeCents;
  const coachNetCents = priceCents - applicationFeeCents; // = 70% arrondi
  return {
    priceCents,
    platformFeeCents,
    referralFeeCents,
    applicationFeeCents,
    coachNetCents,
    coachIsReferrer,
  };
}

/**
 * Crée un PaymentIntent Stripe pour une réservation
 */
export async function createPaymentIntent({
  amountCents,
  coachStripeAccountId,
  coachStripeActive = false,
  metadata,
}: {
  amountCents: number;
  coachStripeAccountId: string;
  coachStripeActive?: boolean;
  metadata: Record<string, string>;
}) {
  const { applicationFeeCents } = calculateAmounts(amountCents);

  // Destination Charge uniquement si le compte Stripe est actif (capabilities activées).
  // Comptes seed (acct_seed_*) ou comptes en cours d'onboarding → PaymentIntent simple,
  // la plateforme collecte et reverse manuellement.
  const isSeedAccount  = coachStripeAccountId.startsWith("acct_seed_");
  const useDestination = coachStripeActive && !isSeedAccount;

  return stripe.paymentIntents.create({
    amount: amountCents,
    currency: "eur",
    automatic_payment_methods: { enabled: true },
    ...(useDestination && {
      application_fee_amount: applicationFeeCents,
      transfer_data: { destination: coachStripeAccountId },
    }),
    metadata,
  });
}

/**
 * Crée un lien d'onboarding Stripe Connect Express pour un coach
 */
export async function createConnectOnboardingLink(
  accountId: string,
  returnUrl: string,
  refreshUrl: string,
) {
  return stripe.accountLinks.create({
    account: accountId,
    return_url: returnUrl,
    refresh_url: refreshUrl,
    type: "account_onboarding",
  });
}

/**
 * Crée un compte Stripe Connect Express vide (initiation)
 */
export async function createConnectAccount(email: string) {
  return stripe.accounts.create({
    type: "express",
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: "individual",
    settings: {
      payouts: {
        schedule: { interval: "weekly", weekly_anchor: "monday" },
      },
    },
  });
}

/**
 * Vérifie la signature d'un webhook Stripe
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!,
  );
}

/**
 * Déclenche un remboursement Stripe
 */
export async function refundPayment(
  paymentIntentId: string,
  amountCents?: number,
) {
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    ...(amountCents ? { amount: amountCents } : {}),
  });
}
