import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import path from "path";

// Charger les variables d'environnement depuis .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // ── Coach de test ──────────────────────────────────────────────────────────

  const testCoachId = "coach_test_001";
  const testCoachClerkId = "user_test_coach_001";

  // Vérifier s'il existe déjà
  let coachUser = await db.user.findUnique({ where: { clerkId: testCoachClerkId } });

  if (!coachUser) {
    coachUser = await db.user.create({
      data: {
        clerkId: testCoachClerkId,
        email: "coach@test.local",
        name: "Karim Testeur",
        role: "coach",
      },
    });
    console.log(`✅ User coach créé: ${coachUser.email}`);
  } else {
    console.log(`⏭️  User coach existe déjà: ${coachUser.email}`);
  }

  // Profil coach
  let coachProfile = await db.coachProfile.findUnique({ where: { userId: coachUser.id } });

  if (!coachProfile) {
    coachProfile = await db.coachProfile.create({
      data: {
        userId: coachUser.id,
        domains: ["sport"],
        specialties: ["MMA", "Boxe"],
        bio: "Expert en MMA avec 10 ans d'expérience",
        stripeAccountId: "acct_test_coach_001",
        stripeOnboardingStatus: "active",
        totalSessions: 0,
      },
    });
    console.log(`✅ Coach profile créé: ${coachProfile.domains.join(", ")}`);
  } else {
    console.log(`⏭️  Coach profile existe déjà`);
  }

  // ── Session de test ────────────────────────────────────────────────────────

  const sessionSlug = "defence-au-sol-paris-test";

  let session = await db.session.findUnique({ where: { slug: sessionSlug } });

  if (!session) {
    session = await db.session.create({
      data: {
        coachId: coachProfile.id,
        title: "Défense au sol MMA",
        description: "Apprenez les techniques fondamentales de défense au sol en MMA. Parfait pour les débutants.",
        sessionType: "discovery",
        domain: "sport",
        category: "MMA",
        skillFocus: "défense au sol",
        dateStart: new Date("2026-05-15T19:00:00"),
        durationMin: 60,
        locationAddress: "Gym Combat Club, 123 Rue de Paris, 75001 Paris",
        locationLat: 48.8566,
        locationLng: 2.3522,
        priceCents: 1500, // 15€
        maxSpots: 12,
        spotsTaken: 0,
        status: "published",
        slug: sessionSlug,
      },
    });
    console.log(`✅ Session créée: "${session.title}" (${session.slug})`);
    console.log(`   📅 ${session.dateStart.toLocaleString("fr-FR")}`);
    console.log(`   💰 ${session.priceCents / 100}€ · 👥 ${session.maxSpots} places`);
  } else {
    console.log(`⏭️  Session existe déjà: ${session.slug}`);
  }

  // ── Participant de test (pour booking) ──────────────────────────────────────

  const testParticipantId = "user_test_participant_001";

  let participant = await db.user.findUnique({ where: { clerkId: testParticipantId } });

  if (!participant) {
    participant = await db.user.create({
      data: {
        clerkId: testParticipantId,
        email: "participant@test.local",
        name: "Léa Testeuse",
        role: "participant",
      },
    });
    console.log(`✅ User participant créé: ${participant.email}`);
  } else {
    console.log(`⏭️  User participant existe déjà`);
  }

  console.log("\n✨ Seed complète!");
  console.log("\n🚀 Pour tester le formulaire:");
  console.log("   1. npm run dev");
  console.log("   2. Se connecter avec email: coach@test.local (mode dev Clerk)");
  console.log("   3. Aller à /dashboard → Sessions → Créer une session");
  console.log("   4. Remplir les 6 étapes et publier");
  console.log("   5. La session apparaîtra à /s/[slug]");
}

main()
  .catch((e) => {
    console.error("❌ Erreur lors du seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
