import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { db } from "@/lib/db";

// ── Types Clerk ──────────────────────────────────────────────────────────────

type EmailAddress = {
  email_address: string;
  id: string;
  verification: { status: "verified" | "unverified" | null } | null;
};

type ClerkUserData = {
  id: string;
  email_addresses: EmailAddress[];
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
};

type ClerkEvent =
  | { type: "user.created"; data: ClerkUserData }
  | { type: "user.updated"; data: ClerkUserData }
  | { type: "user.deleted"; data: { id: string } };

// ── Handler principal ────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing webhook secret" }, { status: 500 });
  }

  const svixId        = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const body = await req.text();
  const wh   = new Webhook(webhookSecret);

  let event: ClerkEvent;
  try {
    event = wh.verify(body, {
      "svix-id":        svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "user.created":
        await handleUserCreated(event.data);
        break;
      case "user.updated":
        await handleUserUpdated(event.data);
        break;
      case "user.deleted":
        await handleUserDeleted(event.data.id);
        break;
    }
  } catch (err) {
    console.error(`[Clerk Webhook] Handler error (${event.type}):`, err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ── Handlers ─────────────────────────────────────────────────────────────────

function extractUserFields(data: ClerkUserData) {
  const primaryEmail = data.email_addresses[0];
  return {
    email:         primaryEmail?.email_address ?? "",
    name:          [data.first_name, data.last_name].filter(Boolean).join(" ") || "Utilisateur",
    avatarUrl:     data.image_url,
    emailVerified: primaryEmail?.verification?.status === "verified",
  };
}

async function handleUserCreated(data: ClerkUserData) {
  const fields = extractUserFields(data);

  await db.user.upsert({
    where:  { clerkId: data.id },
    update: fields,
    create: {
      clerkId: data.id,
      role:    "participant",
      ...fields,
    },
  });
}

async function handleUserUpdated(data: ClerkUserData) {
  const { email, emailVerified, name, avatarUrl } = extractUserFields(data);

  // Un email non-vérifié ne doit jamais écraser un email existant :
  // sinon un attaquant qui ajoute une adresse non-confirmée sur son compte
  // Clerk peut détourner l'identité (ex : Reviews IDOR sur participantEmail,
  // Stripe Connect créé sur le nouvel email…). On garde donc l'ancien email
  // tant que la nouvelle valeur n'est pas confirmée par Clerk.
  const data_ = emailVerified
    ? { email, emailVerified, name, avatarUrl }
    : { name, avatarUrl };

  await db.user.updateMany({
    where: { clerkId: data.id },
    data:  data_,
  });
}

async function handleUserDeleted(clerkId: string) {
  await db.user.updateMany({
    where: { clerkId },
    data:  { deletedAt: new Date() },
  });
}
