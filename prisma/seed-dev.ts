/**
 * SEED DE DÉVELOPPEMENT — données de simulation uniquement
 *
 * ⚠️  Ne jamais exécuter en production.
 * Toutes les entrées créées ici ont le préfixe "seed_" dans leurs IDs Clerk
 * pour être facilement identifiables et supprimables.
 *
 * Usage :
 *   npm run db:seed:dev        → injecte les données
 *   npm run db:seed:dev:reset  → supprime toutes les données seed puis réinjecte
 */

import * as fs from "fs";
import * as path from "path";

// Charge .env.local
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const match = line.match(/^([^#=\s]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (match) process.env[match[1]] = match[2];
  }
}
// Pour les seeds on utilise le pooler en mode session (port 5432 direct souvent bloqué)
// DATABASE_URL reste tel quel (pooler pgbouncer port 6543)

import { PrismaClient } from "@prisma/client";
import type {
  SessionType,
  SessionDomain,
  SessionStatus,
  BookingStatus,
  StripeOnboardingStatus,
} from "@prisma/client";

const db = new PrismaClient();

const SEED_CLERK_PREFIX = "seed_clerk_";

// ─── Dates relatives ─────────────────────────────────────────────────────────

const future = (days: number, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
};

const past = (days: number, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d;
};

// ─── Coachs (10) — tous domaines ─────────────────────────────────────────────

const COACHES = [
  // ── Sport ──
  {
    clerkId:     `${SEED_CLERK_PREFIX}karim`,
    email:       "karim.seed@passionspark-dev.fr",
    name:        "Karim Daoudi",
    avatarUrl:   "https://i.pravatar.cc/150?u=karim",
    bio:         "Champion régional MMA 2019. Je transmets ma passion, pas juste des techniques. 12 ans sur les tapis.",
    specialties: ["Défense au sol", "Frappe debout", "Clinch"],
    domains:     ["sport"] as SessionDomain[],
    tiktokUrl:   "https://tiktok.com/@karim_mma",
    stripeAccountId:        "acct_seed_karim_001",
    stripeOnboardingStatus: "active" as StripeOnboardingStatus,
    avgRating:    4.9,
    totalSessions: 14,
    totalParticipants: 182,
  },
  {
    clerkId:     `${SEED_CLERK_PREFIX}sarah`,
    email:       "sarah.seed@passionspark-dev.fr",
    name:        "Sarah Lemos",
    avatarUrl:   "https://i.pravatar.cc/150?u=sarah",
    bio:         "Ex-pro tennis reconvertie padel. Je décortique le geste technique pour que tu progresses vite.",
    specialties: ["Smash", "Volée de fond", "Service"],
    domains:     ["sport"] as SessionDomain[],
    instagramUrl:"https://instagram.com/sarah_padel",
    stripeAccountId:        "acct_seed_sarah_002",
    stripeOnboardingStatus: "active" as StripeOnboardingStatus,
    avgRating:    4.8,
    totalSessions: 9,
    totalParticipants: 98,
  },
  {
    clerkId:     `${SEED_CLERK_PREFIX}thomas`,
    email:       "thomas.seed@passionspark-dev.fr",
    name:        "Thomas Renaud",
    avatarUrl:   "https://i.pravatar.cc/150?u=thomas",
    bio:         "Ancien joueur N2, maintenant coach basket. Spécialiste du shoot et de la lecture de jeu.",
    specialties: ["Tir à 3 points", "Dribble", "Défense individuelle"],
    domains:     ["sport"] as SessionDomain[],
    stripeAccountId:        "acct_seed_thomas_003",
    stripeOnboardingStatus: "active" as StripeOnboardingStatus,
    avgRating:    4.7,
    totalSessions: 7,
    totalParticipants: 76,
  },
  // ── Musique ──
  {
    clerkId:     `${SEED_CLERK_PREFIX}maya`,
    email:       "maya.seed@passionspark-dev.fr",
    name:        "Maya Fontaine",
    avatarUrl:   "https://i.pravatar.cc/150?u=maya",
    bio:         "Guitariste professionnelle, 15 ans de scène. Je t'apprends à jouer ce que tu écoutes, pas des gammes.",
    specialties: ["Guitare acoustique", "Fingerpicking", "Improvisation blues"],
    domains:     ["music"] as SessionDomain[],
    instagramUrl:"https://instagram.com/maya_guitare",
    stripeAccountId:        "acct_seed_maya_004",
    stripeOnboardingStatus: "active" as StripeOnboardingStatus,
    avgRating:    5.0,
    totalSessions: 11,
    totalParticipants: 134,
  },
  {
    clerkId:     `${SEED_CLERK_PREFIX}alex`,
    email:       "alex.seed@passionspark-dev.fr",
    name:        "Alex Dubois",
    avatarUrl:   "https://i.pravatar.cc/150?u=alex",
    bio:         "Beatmaker & producteur depuis 10 ans. J'aide les débutants à créer leur premier son en 1h.",
    specialties: ["Beatmaking", "Mixage basique", "FL Studio"],
    domains:     ["music"] as SessionDomain[],
    tiktokUrl:   "https://tiktok.com/@alex_beats",
    stripeAccountId:        "acct_seed_alex_005",
    stripeOnboardingStatus: "active" as StripeOnboardingStatus,
    avgRating:    4.6,
    totalSessions: 5,
    totalParticipants: 52,
  },
  // ── Cuisine ──
  {
    clerkId:     `${SEED_CLERK_PREFIX}isabelle`,
    email:       "isabelle.seed@passionspark-dev.fr",
    name:        "Isabelle Moreau",
    avatarUrl:   "https://i.pravatar.cc/150?u=isabelle",
    bio:         "Chef ex-étoilée reconvertie en pédagogie culinaire. Une technique par session, mémorisée à vie.",
    specialties: ["Sauces mères", "Découpe pro", "Pâtisserie fine"],
    domains:     ["cooking"] as SessionDomain[],
    instagramUrl:"https://instagram.com/isabelle_chef",
    stripeAccountId:        "acct_seed_isabelle_006",
    stripeOnboardingStatus: "active" as StripeOnboardingStatus,
    avgRating:    4.9,
    totalSessions: 10,
    totalParticipants: 118,
  },
  {
    clerkId:     `${SEED_CLERK_PREFIX}riad`,
    email:       "riad.seed@passionspark-dev.fr",
    name:        "Riad Mansour",
    avatarUrl:   "https://i.pravatar.cc/150?u=riad",
    bio:         "Boulanger artisan depuis 8 ans. Pains, levains, viennoiseries — je partage mes secrets de fournil.",
    specialties: ["Pain au levain", "Croissant", "Pétrissage"],
    domains:     ["cooking"] as SessionDomain[],
    stripeAccountId:        "acct_seed_riad_007",
    stripeOnboardingStatus: "active" as StripeOnboardingStatus,
    avgRating:    4.8,
    totalSessions: 6,
    totalParticipants: 67,
  },
  // ── Art ──
  {
    clerkId:     `${SEED_CLERK_PREFIX}lucie`,
    email:       "lucie.seed@passionspark-dev.fr",
    name:        "Lucie Chen",
    avatarUrl:   "https://i.pravatar.cc/150?u=lucie",
    bio:         "Illustratrice freelance pour Netflix et Studio Ghibli France. J'enseigne à voir avant de dessiner.",
    specialties: ["Portrait", "Composition", "Encre & aquarelle"],
    domains:     ["art"] as SessionDomain[],
    instagramUrl:"https://instagram.com/lucie_illustre",
    stripeAccountId:        "acct_seed_lucie_008",
    stripeOnboardingStatus: "active" as StripeOnboardingStatus,
    avgRating:    4.9,
    totalSessions: 8,
    totalParticipants: 89,
  },
  // ── Bien-être ──
  {
    clerkId:     `${SEED_CLERK_PREFIX}priya`,
    email:       "priya.seed@passionspark-dev.fr",
    name:        "Priya Nair",
    avatarUrl:   "https://i.pravatar.cc/150?u=priya",
    bio:         "Professeure de yoga certifiée Inde & France. Spécialiste du yoga thérapeutique et de la méditation guidée.",
    specialties: ["Yoga Hatha", "Pranayama", "Méditation"],
    domains:     ["other"] as SessionDomain[],
    instagramUrl:"https://instagram.com/priya_yoga",
    stripeAccountId:        "acct_seed_priya_009",
    stripeOnboardingStatus: "active" as StripeOnboardingStatus,
    avgRating:    5.0,
    totalSessions: 16,
    totalParticipants: 210,
  },
  // ── Tech ──
  {
    clerkId:     `${SEED_CLERK_PREFIX}nicolas`,
    email:       "nicolas.seed@passionspark-dev.fr",
    name:        "Nicolas Petit",
    avatarUrl:   "https://i.pravatar.cc/150?u=nicolas",
    bio:         "Dev fullstack senior. J'enseigne le code en résolvant de vrais problèmes, pas des exercices abstraits.",
    specialties: ["JavaScript", "React", "APIs REST"],
    domains:     ["other"] as SessionDomain[],
    tiktokUrl:   "https://tiktok.com/@nicolas_code",
    stripeAccountId:        "acct_seed_nicolas_010",
    stripeOnboardingStatus: "active" as StripeOnboardingStatus,
    avgRating:    4.7,
    totalSessions: 4,
    totalParticipants: 44,
  },
];

// ─── Participants (20) ────────────────────────────────────────────────────────

const PARTICIPANTS = [
  { clerkId: `${SEED_CLERK_PREFIX}lea`,      email: "lea.seed@passionspark-dev.fr",      name: "Léa Martin",      avatarUrl: "https://i.pravatar.cc/150?u=lea" },
  { clerkId: `${SEED_CLERK_PREFIX}hugo`,     email: "hugo.seed@passionspark-dev.fr",     name: "Hugo Bernard",    avatarUrl: "https://i.pravatar.cc/150?u=hugo" },
  { clerkId: `${SEED_CLERK_PREFIX}chloe`,    email: "chloe.seed@passionspark-dev.fr",    name: "Chloé Dupont",    avatarUrl: "https://i.pravatar.cc/150?u=chloe" },
  { clerkId: `${SEED_CLERK_PREFIX}maxime`,   email: "maxime.seed@passionspark-dev.fr",   name: "Maxime Girard",   avatarUrl: "https://i.pravatar.cc/150?u=maxime" },
  { clerkId: `${SEED_CLERK_PREFIX}sofia`,    email: "sofia.seed@passionspark-dev.fr",    name: "Sofia Nakamura",  avatarUrl: "https://i.pravatar.cc/150?u=sofia" },
  { clerkId: `${SEED_CLERK_PREFIX}remi`,     email: "remi.seed@passionspark-dev.fr",     name: "Rémi Faure",      avatarUrl: "https://i.pravatar.cc/150?u=remi" },
  { clerkId: `${SEED_CLERK_PREFIX}camille`,  email: "camille.seed@passionspark-dev.fr",  name: "Camille Petit",   avatarUrl: "https://i.pravatar.cc/150?u=camille" },
  { clerkId: `${SEED_CLERK_PREFIX}nour`,     email: "nour.seed@passionspark-dev.fr",     name: "Nour Benali",     avatarUrl: "https://i.pravatar.cc/150?u=nour" },
  { clerkId: `${SEED_CLERK_PREFIX}theo`,     email: "theo.seed@passionspark-dev.fr",     name: "Théo Lambert",    avatarUrl: "https://i.pravatar.cc/150?u=theo" },
  { clerkId: `${SEED_CLERK_PREFIX}jade`,     email: "jade.seed@passionspark-dev.fr",     name: "Jade Moreau",     avatarUrl: "https://i.pravatar.cc/150?u=jade" },
  { clerkId: `${SEED_CLERK_PREFIX}antoine`,  email: "antoine.seed@passionspark-dev.fr",  name: "Antoine Roux",    avatarUrl: "https://i.pravatar.cc/150?u=antoine" },
  { clerkId: `${SEED_CLERK_PREFIX}emma`,     email: "emma.seed@passionspark-dev.fr",     name: "Emma Lefèvre",    avatarUrl: "https://i.pravatar.cc/150?u=emma" },
  { clerkId: `${SEED_CLERK_PREFIX}mathis`,   email: "mathis.seed@passionspark-dev.fr",   name: "Mathis Perrin",   avatarUrl: "https://i.pravatar.cc/150?u=mathis" },
  { clerkId: `${SEED_CLERK_PREFIX}inès`,     email: "ines.seed@passionspark-dev.fr",     name: "Inès Aubert",     avatarUrl: "https://i.pravatar.cc/150?u=ines" },
  { clerkId: `${SEED_CLERK_PREFIX}ethan`,    email: "ethan.seed@passionspark-dev.fr",    name: "Ethan Garnier",   avatarUrl: "https://i.pravatar.cc/150?u=ethan" },
  { clerkId: `${SEED_CLERK_PREFIX}yasmine`,  email: "yasmine.seed@passionspark-dev.fr",  name: "Yasmine Hadj",    avatarUrl: "https://i.pravatar.cc/150?u=yasmine" },
  { clerkId: `${SEED_CLERK_PREFIX}baptiste`, email: "baptiste.seed@passionspark-dev.fr", name: "Baptiste Simon",  avatarUrl: "https://i.pravatar.cc/150?u=baptiste" },
  { clerkId: `${SEED_CLERK_PREFIX}aline`,    email: "aline.seed@passionspark-dev.fr",    name: "Aline Favre",     avatarUrl: "https://i.pravatar.cc/150?u=aline" },
  { clerkId: `${SEED_CLERK_PREFIX}kevin`,    email: "kevin.seed@passionspark-dev.fr",    name: "Kevin Nguyen",    avatarUrl: "https://i.pravatar.cc/150?u=kevin" },
  { clerkId: `${SEED_CLERK_PREFIX}amandine`, email: "amandine.seed@passionspark-dev.fr", name: "Amandine Blanc",  avatarUrl: "https://i.pravatar.cc/150?u=amandine" },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

function pick<T>(arr: T[], count: number): T[] {
  return arr.slice(0, count);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 [SEED-DEV] Démarrage de l'injection de données de simulation...\n");

  // 1. Créer les coaches
  const createdCoaches: { userId: string; coachProfileId: string; data: typeof COACHES[0] }[] = [];

  for (const c of COACHES) {
    const user = await db.user.upsert({
      where:  { clerkId: c.clerkId },
      update: {},
      create: {
        clerkId:       c.clerkId,
        email:         c.email,
        name:          c.name,
        avatarUrl:     c.avatarUrl,
        role:          "coach",
        emailVerified: true,
      },
    });

    const coachProfile = await db.coachProfile.upsert({
      where:  { userId: user.id },
      update: {},
      create: {
        userId:                 user.id,
        bio:                    c.bio,
        specialties:            c.specialties,
        domains:                c.domains,
        instagramUrl:           (c as any).instagramUrl ?? null,
        tiktokUrl:              (c as any).tiktokUrl ?? null,
        stripeAccountId:        c.stripeAccountId,
        stripeOnboardingStatus: c.stripeOnboardingStatus,
        avgRating:              c.avgRating,
        totalSessions:          c.totalSessions,
        totalParticipants:      c.totalParticipants,
      },
    });

    createdCoaches.push({ userId: user.id, coachProfileId: coachProfile.id, data: c });
    console.log(`  ✅ Coach : ${c.name} (${c.domains.join(", ")})`);
  }

  // 2. Créer les participants
  const createdParticipants: { id: string; name: string; email: string }[] = [];

  for (const p of PARTICIPANTS) {
    const user = await db.user.upsert({
      where:  { clerkId: p.clerkId },
      update: {},
      create: {
        clerkId:       p.clerkId,
        email:         p.email,
        name:          p.name,
        avatarUrl:     p.avatarUrl,
        role:          "participant",
        emailVerified: true,
      },
    });
    createdParticipants.push({ id: user.id, name: p.name, email: p.email });
  }
  console.log(`\n  ✅ ${createdParticipants.length} participants créés\n`);

  // Index coaches par clé
  const coachByKey: Record<string, typeof createdCoaches[0]> = {};
  for (const c of createdCoaches) {
    const key = c.data.clerkId.replace(SEED_CLERK_PREFIX, "");
    coachByKey[key] = c;
  }

  // 3. Créer les sessions (26 sessions, tous domaines, Paris / Lyon / Marseille / Bordeaux)
  type SessionSeed = {
    slug: string;
    coachKey: string;
    title: string;
    tagline: string;
    description: string;
    sessionType: SessionType;
    domain: SessionDomain;
    category: string;
    skillFocus: string;
    dateStart: Date;
    durationMin: number;
    locationAddress: string;
    locationLat: number;
    locationLng: number;
    priceCents: number;
    maxSpots: number;
    spotsTaken: number;
    status: SessionStatus;
    coverImageUrl?: string;
    bookingsToCreate?: number;          // nb confirmed bookings
    bookingsPast?: number;              // nb attended (sessions passées)
    noShows?: number;
  };

  const SESSIONS: SessionSeed[] = [

    // ══ SPORT ══════════════════════════════════════════════════════════════════

    {
      slug:            "seed-mma-frappe-defense-karim",
      coachKey:        "karim",
      title:           "Initiation MMA — Frappe & Défense",
      tagline:         "Apprends les bases en 1h. Zéro expérience requise.",
      description:     "Une session pour découvrir le MMA dans un cadre bienveillant. On travaille les gardes, les déplacements et les premières combinaisons frappe/défense. Pas de sparring, juste de la technique avec du fun.",
      sessionType:     "discovery",
      domain:          "sport",
      category:        "MMA",
      skillFocus:      "Garde + jab-cross + esquive",
      dateStart:       future(3, 10),
      durationMin:     60,
      locationAddress: "Salle Combat Club, 12 rue de la Roquette, Paris 11e",
      locationLat:     48.854,
      locationLng:     2.373,
      priceCents:      1500,
      maxSpots:        15,
      spotsTaken:      11,
      status:          "published",
      bookingsToCreate: 11,
    },
    {
      slug:            "seed-mma-clinch-karim",
      coachKey:        "karim",
      title:           "MMA — Clinch & Projections",
      tagline:         "Contrôle la distance, domine le clinch.",
      description:     "Session dédiée au travail du clinch : placements, contrôle de la nuque, genoux et projections de base. Niveau intermédiaire. Protections obligatoires.",
      sessionType:     "progression",
      domain:          "sport",
      category:        "MMA",
      skillFocus:      "Contrôle du clinch et projections",
      dateStart:       future(10, 19),
      durationMin:     60,
      locationAddress: "Salle Combat Club, 12 rue de la Roquette, Paris 11e",
      locationLat:     48.854,
      locationLng:     2.373,
      priceCents:      1500,
      maxSpots:        10,
      spotsTaken:      8,
      status:          "published",
      bookingsToCreate: 8,
    },
    {
      slug:            "seed-boxe-jab-crochet-karim",
      coachKey:        "karim",
      title:           "Boxe — Jab & Crochet Parfait",
      tagline:         "2 coups. 1h. Des automatismes pour la vie.",
      description:     "On ne travaille que deux coups, mais on les travaille à fond. Technique, timing, enchaînements. Sac de frappe, pattes d'ours, shadow boxing. Débutant bienvenu.",
      sessionType:     "discovery",
      domain:          "sport",
      category:        "Boxe",
      skillFocus:      "Jab + crochet gauche",
      dateStart:       future(2, 9),
      durationMin:     60,
      locationAddress: "Boxing Studio, 45 rue de Ménilmontant, Paris 20e",
      locationLat:     48.870,
      locationLng:     2.384,
      priceCents:      1700,
      maxSpots:        10,
      spotsTaken:      9,
      status:          "published",
      bookingsToCreate: 9,
    },
    {
      slug:            "seed-padel-smash-sarah",
      coachKey:        "sarah",
      title:           "Padel — Maîtrise du Smash",
      tagline:         "Débloquer ce coup qui te résiste depuis des mois.",
      description:     "Le smash au padel c'est technique. On décortique le timing, la position des pieds, le point de contact. Tu repars avec un smash qui claque. Niveau intermédiaire requis.",
      sessionType:     "progression",
      domain:          "sport",
      category:        "Padel",
      skillFocus:      "Smash au-dessus de la tête",
      dateStart:       future(5, 14),
      durationMin:     60,
      locationAddress: "Padel Arena Paris, 8 avenue du Sport, Paris 16e",
      locationLat:     48.869,
      locationLng:     2.267,
      priceCents:      1800,
      maxSpots:        12,
      spotsTaken:      5,
      status:          "published",
      bookingsToCreate: 5,
    },
    {
      slug:            "seed-padel-debutant-sarah",
      coachKey:        "sarah",
      title:           "Padel Débutant — Premiers Coups",
      tagline:         "Découvre le padel sans pression, en petit groupe.",
      description:     "Tu n'as jamais joué au padel. On apprend le grip, les déplacements, le coup droit et le revers. Session très accessible, bonne humeur garantie.",
      sessionType:     "discovery",
      domain:          "sport",
      category:        "Padel",
      skillFocus:      "Coup droit + revers de base",
      dateStart:       future(1, 10),
      durationMin:     60,
      locationAddress: "Padel Arena Paris, 8 avenue du Sport, Paris 16e",
      locationLat:     48.869,
      locationLng:     2.267,
      priceCents:      1500,
      maxSpots:        12,
      spotsTaken:      12,
      status:          "full",
      bookingsToCreate: 12,
    },
    {
      slug:            "seed-basket-tir-3pts-thomas",
      coachKey:        "thomas",
      title:           "Basket — Tir à 3 Points",
      tagline:         "La mécanique du shoot expliquée, répétée, mémorisée.",
      description:     "On travaille la position des pieds, l'alignement du coude, le suivi de la main. Exercices progressifs, feedback en temps réel. Tu ressors avec des automatismes.",
      sessionType:     "progression",
      domain:          "sport",
      category:        "Basket",
      skillFocus:      "Mécanique de tir à 3 points",
      dateStart:       future(7, 11),
      durationMin:     90,
      locationAddress: "Gymnase Gerland, 350 avenue Jean Jaurès, Lyon 7e",
      locationLat:     45.732,
      locationLng:     4.832,
      priceCents:      2000,
      maxSpots:        12,
      spotsTaken:      7,
      status:          "published",
      bookingsToCreate: 7,
    },
    {
      slug:            "seed-basket-dribble-thomas",
      coachKey:        "thomas",
      title:           "Basket — Dribble sous Pression",
      tagline:         "Ne plus perdre le ballon quand ça compte.",
      description:     "Exercices de dribble entre les plots, avec défenseur passif puis actif. Travail de la main faible, croisés, derrière le dos. Niveau débutant-intermédiaire.",
      sessionType:     "progression",
      domain:          "sport",
      category:        "Basket",
      skillFocus:      "Dribble main faible + croisé",
      dateStart:       future(14, 10),
      durationMin:     60,
      locationAddress: "Gymnase Gerland, 350 avenue Jean Jaurès, Lyon 7e",
      locationLat:     45.732,
      locationLng:     4.832,
      priceCents:      1500,
      maxSpots:        14,
      spotsTaken:      3,
      status:          "published",
      bookingsToCreate: 3,
    },

    // ══ MUSIQUE ════════════════════════════════════════════════════════════════

    {
      slug:            "seed-guitare-fingerpicking-maya",
      coachKey:        "maya",
      title:           "Guitare — Fingerpicking Essentiel",
      tagline:         "Joue sans médiator. Ton son change tout.",
      description:     "Le fingerpicking transforme la guitare acoustique. On apprend le pattern Travis picking, puis on l'applique sur 2 chansons que tu connais déjà. Niveau débutant confirmé.",
      sessionType:     "progression",
      domain:          "music",
      category:        "Guitare",
      skillFocus:      "Travis picking + application chansons",
      dateStart:       future(4, 15),
      durationMin:     60,
      locationAddress: "Studio Résonance, 22 rue Oberkampf, Paris 11e",
      locationLat:     48.864,
      locationLng:     2.369,
      priceCents:      1800,
      maxSpots:        8,
      spotsTaken:      6,
      status:          "published",
      bookingsToCreate: 6,
    },
    {
      slug:            "seed-guitare-blues-maya",
      coachKey:        "maya",
      title:           "Guitare — Impro Blues en 1h",
      tagline:         "La pentatonique, c'est tout ce dont tu as besoin.",
      description:     "On apprend la gamme pentatonique mineure, les bends, le vibrato. À la fin de la session, tu improvises sur un backing track blues. Magie garantie.",
      sessionType:     "progression",
      domain:          "music",
      category:        "Guitare",
      skillFocus:      "Pentatonique + bends + vibrato",
      dateStart:       future(9, 14),
      durationMin:     60,
      locationAddress: "Studio Résonance, 22 rue Oberkampf, Paris 11e",
      locationLat:     48.864,
      locationLng:     2.369,
      priceCents:      1800,
      maxSpots:        8,
      spotsTaken:      8,
      status:          "full",
      bookingsToCreate: 8,
    },
    {
      slug:            "seed-beatmaking-debut-alex",
      coachKey:        "alex",
      title:           "Beatmaking — Crée ton 1er Son",
      tagline:         "De zéro à un beat fini. En 1h. Vraiment.",
      description:     "On démarre FL Studio ensemble, on pose une drum machine, on choisit des samples, on arrange. Tu repars avec un beat terminé que tu as fait toi-même. Aucun prérequis.",
      sessionType:     "discovery",
      domain:          "music",
      category:        "Production musicale",
      skillFocus:      "Arrangement + drums + samples",
      dateStart:       future(6, 18),
      durationMin:     90,
      locationAddress: "Le Lab Musical, 5 impasse des Arts, Bordeaux",
      locationLat:     44.836,
      locationLng:     -0.580,
      priceCents:      2000,
      maxSpots:        6,
      spotsTaken:      4,
      status:          "published",
      bookingsToCreate: 4,
    },

    // ══ CUISINE ════════════════════════════════════════════════════════════════

    {
      slug:            "seed-cuisine-sauces-isabelle",
      coachKey:        "isabelle",
      title:           "Les 5 Sauces Mères — Enfin Expliquées",
      tagline:         "Comprends les bases et tu pourras tout cuisiner.",
      description:     "Béchamel, velouté, espagnole, hollandaise, tomate. En comprenant ces 5 sauces, tu débloques 80% de la cuisine française. Session théorique + pratique avec dégustation.",
      sessionType:     "discovery",
      domain:          "cooking",
      category:        "Cuisine française",
      skillFocus:      "5 sauces mères + émulsion",
      dateStart:       future(3, 14),
      durationMin:     90,
      locationAddress: "Atelier Cuisine Belleville, 18 rue de la Mare, Paris 20e",
      locationLat:     48.875,
      locationLng:     2.381,
      priceCents:      2000,
      maxSpots:        10,
      spotsTaken:      8,
      status:          "published",
      bookingsToCreate: 8,
    },
    {
      slug:            "seed-cuisine-pates-fraiches-isabelle",
      coachKey:        "isabelle",
      title:           "Pâtes Fraîches — La Technique Italienne",
      tagline:         "Fait à la main, cuit en 2 min. Résultat bluffant.",
      description:     "On prépare la pâte à la main (oui, sans machine), on pétrit, on lamine, on découpe. Tagliatelles et raviolis farcis à la ricotta. Tu repars avec tes créations.",
      sessionType:     "discovery",
      domain:          "cooking",
      category:        "Cuisine italienne",
      skillFocus:      "Pétrissage + laminage + découpe",
      dateStart:       future(11, 10),
      durationMin:     120,
      locationAddress: "Atelier Cuisine Belleville, 18 rue de la Mare, Paris 20e",
      locationLat:     48.875,
      locationLng:     2.381,
      priceCents:      2000,
      maxSpots:        10,
      spotsTaken:      10,
      status:          "full",
      bookingsToCreate: 10,
    },
    {
      slug:            "seed-boulangerie-levain-riad",
      coachKey:        "riad",
      title:           "Pain au Levain — Comprendre & Pratiquer",
      tagline:         "Ton levain, ta miche, ta fierté.",
      description:     "On étudie le levain (pourquoi ça marche, comment l'entretenir), on prépare ensemble une pâte, on façonne. Tu repars avec une pâte levée prête à cuire chez toi.",
      sessionType:     "discovery",
      domain:          "cooking",
      category:        "Boulangerie",
      skillFocus:      "Levain + autolyse + façonnage",
      dateStart:       future(8, 9),
      durationMin:     120,
      locationAddress: "Fournil des Quais, 14 quai des Chartrons, Bordeaux",
      locationLat:     44.851,
      locationLng:     -0.572,
      priceCents:      1800,
      maxSpots:        8,
      spotsTaken:      6,
      status:          "published",
      bookingsToCreate: 6,
    },

    // ══ ART ════════════════════════════════════════════════════════════════════

    {
      slug:            "seed-portrait-encre-lucie",
      coachKey:        "lucie",
      title:           "Portrait à l'Encre de Chine",
      tagline:         "Trace un portrait expressif en 1h. Aucun talent préalable.",
      description:     "On apprend à observer les proportions du visage, à travailler en lignes rapides et expressives. Encre de Chine, plume et pinceau fournis. Débutants bienvenus.",
      sessionType:     "discovery",
      domain:          "art",
      category:        "Dessin",
      skillFocus:      "Proportions visage + ligne expressive",
      dateStart:       future(4, 10),
      durationMin:     60,
      locationAddress: "Galerie du Panier, 8 rue du Panier, Marseille 2e",
      locationLat:     43.298,
      locationLng:     5.370,
      priceCents:      1500,
      maxSpots:        10,
      spotsTaken:      7,
      status:          "published",
      bookingsToCreate: 7,
    },
    {
      slug:            "seed-aquarelle-paysage-lucie",
      coachKey:        "lucie",
      title:           "Aquarelle — Le Paysage Lumineux",
      tagline:         "Lumière, flou, transparence. L'aquarelle comme elle se pratique.",
      description:     "Techniques des à-plats, des dégradés humide-sur-humide et des réserves. On peint ensemble un paysage côtier en 3 plans. Matériel fourni.",
      sessionType:     "progression",
      domain:          "art",
      category:        "Peinture",
      skillFocus:      "Mouillé sur mouillé + réserves à la gomme",
      dateStart:       future(12, 14),
      durationMin:     90,
      locationAddress: "Galerie du Panier, 8 rue du Panier, Marseille 2e",
      locationLat:     43.298,
      locationLng:     5.370,
      priceCents:      1800,
      maxSpots:        8,
      spotsTaken:      3,
      status:          "published",
      bookingsToCreate: 3,
    },

    // ══ BIEN-ÊTRE ══════════════════════════════════════════════════════════════

    {
      slug:            "seed-yoga-dos-priya",
      coachKey:        "priya",
      title:           "Yoga — Libère ton Dos en 1h",
      tagline:         "Bye bye tensions. Protocole dos complet.",
      description:     "Séquence ciblée : chaîne postérieure, psoas, ouverture thoracique. Idéal si tu travailles assis toute la journée. Niveau débutant, tapis non requis (fourni).",
      sessionType:     "discovery",
      domain:          "other",
      category:        "Yoga",
      skillFocus:      "Décompression lombaires + étirements ciblés",
      dateStart:       future(2, 8),
      durationMin:     60,
      locationAddress: "Studio Shakti, 33 rue de Rivoli, Paris 4e",
      locationLat:     48.855,
      locationLng:     2.352,
      priceCents:      1500,
      maxSpots:        15,
      spotsTaken:      14,
      status:          "published",
      bookingsToCreate: 14,
    },
    {
      slug:            "seed-meditation-stress-priya",
      coachKey:        "priya",
      title:           "Méditation — Calme le Mental en 1h",
      tagline:         "Pas de bougie, pas de mantra. Juste du concret.",
      description:     "Cohérence cardiaque, scan corporel, visualisation guidée. Trois outils que tu pourras réutiliser seul dès ce soir. Parfait pour les anxieux et les sceptiques.",
      sessionType:     "discovery",
      domain:          "other",
      category:        "Méditation",
      skillFocus:      "Cohérence cardiaque + scan corporel",
      dateStart:       future(6, 7),
      durationMin:     60,
      locationAddress: "Studio Shakti, 33 rue de Rivoli, Paris 4e",
      locationLat:     48.855,
      locationLng:     2.352,
      priceCents:      1300,
      maxSpots:        15,
      spotsTaken:      12,
      status:          "published",
      bookingsToCreate: 12,
    },
    {
      slug:            "seed-yoga-matin-priya",
      coachKey:        "priya",
      title:           "Morning Yoga — Éveille le Corps",
      tagline:         "1h le matin change toute la journée.",
      description:     "Sun salutation, postures debout, pranayama d'activation. Session dynamique mais douce, idéale comme routine matinale. Tous niveaux.",
      sessionType:     "discovery",
      domain:          "other",
      category:        "Yoga",
      skillFocus:      "Salutation soleil + activation énergie",
      dateStart:       future(13, 7),
      durationMin:     60,
      locationAddress: "Studio Shakti, 33 rue de Rivoli, Paris 4e",
      locationLat:     48.855,
      locationLng:     2.352,
      priceCents:      1500,
      maxSpots:        15,
      spotsTaken:      9,
      status:          "published",
      bookingsToCreate: 9,
    },

    // ══ TECH ══════════════════════════════════════════════════════════════════

    {
      slug:            "seed-js-async-nicolas",
      coachKey:        "nicolas",
      title:           "JavaScript — Enfin Comprendre l'Async",
      tagline:         "Promises, async/await : tu ressors en maîtrisant ça.",
      description:     "Callback hell, promesses, async/await, gestion d'erreurs. On code ensemble 3 exercices réels. Tu repars avec une compréhension solide et du code qui marche.",
      sessionType:     "progression",
      domain:          "other",
      category:        "Développement web",
      skillFocus:      "Promises + async/await + try/catch",
      dateStart:       future(5, 18),
      durationMin:     90,
      locationAddress: "Le Wagon Paris, 16 villa Gaudelet, Paris 11e",
      locationLat:     48.864,
      locationLng:     2.376,
      priceCents:      2000,
      maxSpots:        8,
      spotsTaken:      5,
      status:          "published",
      bookingsToCreate: 5,
    },
    {
      slug:            "seed-react-hooks-nicolas",
      coachKey:        "nicolas",
      title:           "React — Hooks Essentiels sans Confusion",
      tagline:         "useState, useEffect, useCallback — enfin clairs.",
      description:     "On démystifie les 3 hooks que tout dev React utilise mal. On construit ensemble un composant réaliste qui les combine. Niveau intermédiaire JS requis.",
      sessionType:     "progression",
      domain:          "other",
      category:        "Développement web",
      skillFocus:      "useState + useEffect + useCallback",
      dateStart:       future(15, 17),
      durationMin:     90,
      locationAddress: "Le Wagon Paris, 16 villa Gaudelet, Paris 11e",
      locationLat:     48.864,
      locationLng:     2.376,
      priceCents:      2000,
      maxSpots:        8,
      spotsTaken:      2,
      status:          "published",
      bookingsToCreate: 2,
    },

    // ══ SESSIONS PASSÉES ═══════════════════════════════════════════════════════

    {
      slug:            "seed-mma-sol-past-karim",
      coachKey:        "karim",
      title:           "Défense au Sol — Kimura & RNC",
      tagline:         "Les soumissions de base que tout le monde doit connaître.",
      description:     "Session passée. Travail du kimura et du rear naked choke sur tapis. 13 présents sur 15 inscrits.",
      sessionType:     "progression",
      domain:          "sport",
      category:        "MMA",
      skillFocus:      "Kimura + Rear Naked Choke",
      dateStart:       past(7, 10),
      durationMin:     60,
      locationAddress: "Salle Combat Club, 12 rue de la Roquette, Paris 11e",
      locationLat:     48.854,
      locationLng:     2.373,
      priceCents:      1500,
      maxSpots:        15,
      spotsTaken:      15,
      status:          "completed",
      bookingsPast:    13,
      noShows:         2,
    },
    {
      slug:            "seed-guitare-accords-past-maya",
      coachKey:        "maya",
      title:           "Guitare — Les 8 Accords Indispensables",
      tagline:         "Avec ces 8 accords tu joues 90% des chansons pop.",
      description:     "Session passée. Am, C, D, E, Em, F, G, G7. Transitions fluides, changements rapides. 8 participants tous satisfaits.",
      sessionType:     "discovery",
      domain:          "music",
      category:        "Guitare",
      skillFocus:      "8 accords ouverts + transitions",
      dateStart:       past(10, 15),
      durationMin:     60,
      locationAddress: "Studio Résonance, 22 rue Oberkampf, Paris 11e",
      locationLat:     48.864,
      locationLng:     2.369,
      priceCents:      1800,
      maxSpots:        8,
      spotsTaken:      8,
      status:          "completed",
      bookingsPast:    8,
      noShows:         0,
    },
    {
      slug:            "seed-yoga-dos-past-priya",
      coachKey:        "priya",
      title:           "Yoga — Libère ton Dos (édition passée)",
      tagline:         "Session passée.",
      description:     "Session passée. 14 participants, 14 présents. Session identique à la prochaine édition.",
      sessionType:     "discovery",
      domain:          "other",
      category:        "Yoga",
      skillFocus:      "Décompression lombaires + étirements",
      dateStart:       past(4, 8),
      durationMin:     60,
      locationAddress: "Studio Shakti, 33 rue de Rivoli, Paris 4e",
      locationLat:     48.855,
      locationLng:     2.352,
      priceCents:      1500,
      maxSpots:        15,
      spotsTaken:      14,
      status:          "completed",
      bookingsPast:    14,
      noShows:         0,
    },
    {
      slug:            "seed-sauces-past-isabelle",
      coachKey:        "isabelle",
      title:           "Sauces Mères — Édition Passée",
      tagline:         "Session passée.",
      description:     "Session passée. 9 participants, 8 présents. Très bien notée.",
      sessionType:     "discovery",
      domain:          "cooking",
      category:        "Cuisine française",
      skillFocus:      "5 sauces mères + émulsion",
      dateStart:       past(14, 14),
      durationMin:     90,
      locationAddress: "Atelier Cuisine Belleville, 18 rue de la Mare, Paris 20e",
      locationLat:     48.875,
      locationLng:     2.381,
      priceCents:      2000,
      maxSpots:        10,
      spotsTaken:      9,
      status:          "completed",
      bookingsPast:    8,
      noShows:         1,
    },
  ];

  // 4. Insérer les sessions
  const createdSessions: {
    id: string;
    slug: string;
    coachProfileId: string;
    priceCents: number;
    status: SessionStatus;
    bookingsToCreate: number;
    bookingsPast: number;
    noShows: number;
  }[] = [];

  for (const s of SESSIONS) {
    const coach = coachByKey[s.coachKey];
    const session = await db.session.upsert({
      where:  { slug: s.slug },
      update: {},
      create: {
        coachId:         coach.coachProfileId,
        title:           s.title,
        tagline:         s.tagline,
        description:     s.description,
        sessionType:     s.sessionType,
        domain:          s.domain,
        category:        s.category,
        skillFocus:      s.skillFocus,
        dateStart:       s.dateStart,
        durationMin:     s.durationMin,
        locationAddress: s.locationAddress,
        locationLat:     s.locationLat,
        locationLng:     s.locationLng,
        priceCents:      s.priceCents,
        maxSpots:        s.maxSpots,
        spotsTaken:      s.spotsTaken,
        status:          s.status,
        slug:            s.slug,
        coverImageUrl:   s.coverImageUrl ?? null,
      },
    });
    createdSessions.push({
      id:               session.id,
      slug:             s.slug,
      coachProfileId:   coach.coachProfileId,
      priceCents:       s.priceCents,
      status:           s.status,
      bookingsToCreate: s.bookingsToCreate ?? 0,
      bookingsPast:     s.bookingsPast ?? 0,
      noShows:          s.noShows ?? 0,
    });
    const icon = s.status === "completed" ? "📅" : s.status === "full" ? "🔴" : "🟢";
    console.log(`  ${icon} Session : ${s.title} [${s.status}]`);
  }
  console.log("");

  // 5. Créer les réservations
  let bookingCount = 0;
  const allAttendedBookings: { id: string; sessionId: string; participantIdx: number; coachProfileId: string; priceCents: number }[] = [];

  for (const session of createdSessions) {
    // Sessions à venir / full → confirmed bookings
    if (session.bookingsToCreate > 0) {
      for (let i = 0; i < session.bookingsToCreate; i++) {
        const pIdx = i % createdParticipants.length;
        const participant = createdParticipants[pIdx];
        await db.booking.create({
          data: {
            sessionId:             session.id,
            userId:                participant.id,
            participantEmail:      participant.email,
            participantName:       participant.name,
            qrToken:               `seed_qr_${session.id.slice(0, 8)}_${i}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            status:                "confirmed",
            paidAt:                past(2),
            amountPaidCents:       session.priceCents,
            stripePaymentIntentId: `pi_seed_${session.id.slice(0, 8)}_${i}_${Date.now()}`,
          },
        });
        bookingCount++;
      }
    }

    // Sessions passées → attended + no_shows
    if (session.bookingsPast > 0) {
      for (let i = 0; i < session.bookingsPast; i++) {
        const pIdx = i % createdParticipants.length;
        const participant = createdParticipants[pIdx];
        const booking = await db.booking.create({
          data: {
            sessionId:             session.id,
            userId:                participant.id,
            participantEmail:      participant.email,
            participantName:       participant.name,
            qrToken:               `seed_qr_${session.id.slice(0, 8)}_att_${i}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            status:                "attended",
            paidAt:                past(session.bookingsPast + 3),
            amountPaidCents:       session.priceCents,
            scannedAt:             session.status === "completed" ? new Date(new Date(session.id).getTime() || past(2).getTime()) : past(2),
            stripePaymentIntentId: `pi_seed_${session.id.slice(0, 8)}_att_${i}_${Date.now()}`,
          },
        });
        allAttendedBookings.push({ id: booking.id, sessionId: session.id, participantIdx: pIdx, coachProfileId: session.coachProfileId, priceCents: session.priceCents });
        bookingCount++;
      }
      for (let i = 0; i < session.noShows; i++) {
        const pIdx = (session.bookingsPast + i) % createdParticipants.length;
        const participant = createdParticipants[pIdx];
        await db.booking.create({
          data: {
            sessionId:             session.id,
            userId:                participant.id,
            participantEmail:      participant.email,
            participantName:       participant.name,
            qrToken:               `seed_qr_${session.id.slice(0, 8)}_ns_${i}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            status:                "no_show",
            paidAt:                past(session.bookingsPast + 3),
            amountPaidCents:       session.priceCents,
            stripePaymentIntentId: `pi_seed_${session.id.slice(0, 8)}_ns_${i}_${Date.now()}`,
          },
        });
        bookingCount++;
      }
    }
  }
  console.log(`  ✅ ${bookingCount} réservations créées`);

  // 6. Payouts pour les sessions passées
  let payoutCount = 0;
  const completedSessions = createdSessions.filter(s => s.status === "completed");

  for (const session of completedSessions) {
    const attended = session.bookingsPast;
    if (attended === 0) continue;
    const gross    = attended * session.priceCents;
    const platform = Math.round(gross * 0.30); // 30% (23% PP + 7% parrainage)
    const net      = gross - platform;

    await db.payout.upsert({
      where:  { sessionId: session.id },
      update: {},
      create: {
        coachId:          session.coachProfileId,
        sessionId:        session.id,
        grossAmountCents: gross,
        platformFeeCents: platform,
        netAmountCents:   net,
        stripeTransferId: `tr_seed_${session.id.slice(0, 8)}`,
        status:           "completed",
        initiatedAt:      past(3),
        completedAt:      past(2),
      },
    });
    payoutCount++;
  }
  console.log(`  ✅ ${payoutCount} payouts créés`);

  // 7. Avis sur les sessions passées
  const REVIEW_TEMPLATES = [
    { rating: 5, comment: "Incroyable. J'ai appris plus en 1h qu'en 3 mois de YouTube." },
    { rating: 5, comment: "Le format petit groupe fait toute la différence. Feedback constant." },
    { rating: 5, comment: "Ambiance parfaite, coach très pédagogue. Je reviens." },
    { rating: 4, comment: "Très bonne session, peut-être un peu court pour tout assimiler." },
    { rating: 5, comment: "Exactement ce dont j'avais besoin. Aucun temps mort." },
    { rating: 4, comment: "Super contenu, salle un peu petite mais rien de grave." },
    { rating: 5, comment: "Le meilleur investissement que j'ai fait pour ma progression." },
    { rating: 5, comment: "J'ai enfin compris pourquoi ça ne marchait pas. Merci !" },
    { rating: 4, comment: "Très bien. Je recommande à tous les débutants." },
    { rating: 5, comment: "Coach passionné, ça se ressent immédiatement. 5 étoiles." },
    { rating: 3, comment: "Bien, mais j'aurais aimé aller plus loin sur certains points." },
    { rating: 5, comment: "La session a dépassé mes attentes. Franchement bluffant." },
  ];

  let reviewCount = 0;
  for (const b of allAttendedBookings) {
    if (Math.random() < 0.75) { // 75% de taux d'avis
      const tpl = REVIEW_TEMPLATES[reviewCount % REVIEW_TEMPLATES.length];
      await db.review.upsert({
        where:  { bookingId: b.id },
        update: {},
        create: {
          sessionId: b.sessionId,
          bookingId: b.id,
          authorId:  createdParticipants[b.participantIdx].id,
          rating:    tpl.rating,
          comment:   tpl.comment,
        },
      });
      reviewCount++;
    }
  }
  console.log(`  ✅ ${reviewCount} avis créés\n`);

  // ─── Résumé final ──────────────────────────────────────────────────────────
  console.log("✅ [SEED-DEV] Injection terminée !\n");
  console.log("📋 Résumé :");
  console.log(`   • ${COACHES.length} coaches (sport, musique, cuisine, art, bien-être, tech)`);
  console.log(`   • ${PARTICIPANTS.length} participants`);
  console.log(`   • ${SESSIONS.length} sessions`);
  console.log(`     – ${SESSIONS.filter(s => s.status === "published").length} publiées`);
  console.log(`     – ${SESSIONS.filter(s => s.status === "full").length} complètes`);
  console.log(`     – ${SESSIONS.filter(s => s.status === "completed").length} passées`);
  console.log(`   • ${bookingCount} réservations`);
  console.log(`   • ${payoutCount} payouts complétés`);
  console.log(`   • ${reviewCount} avis\n`);
  console.log("🔗 Quelques slugs de test :");
  const sample = createdSessions.filter(s => s.status === "published").slice(0, 6);
  for (const s of sample) {
    console.log(`   http://localhost:3000/s/${s.slug}`);
  }
  console.log("\n⚠️  Données identifiables par le préfixe 'seed_' dans les clerkIds.");
}

// ─── Reset ────────────────────────────────────────────────────────────────────

async function reset() {
  console.log("🗑️  [SEED-DEV] Suppression des données seed...\n");

  const seedUsers = await db.user.findMany({
    where:  { clerkId: { startsWith: SEED_CLERK_PREFIX } },
    select: { id: true },
  });
  const seedUserIds = seedUsers.map(u => u.id);

  if (seedUserIds.length === 0) {
    console.log("   Aucune donnée seed trouvée.\n");
    return;
  }

  const seedCoachProfiles = await db.coachProfile.findMany({
    where:  { userId: { in: seedUserIds } },
    select: { id: true },
  });
  const seedCoachIds = seedCoachProfiles.map(c => c.id);

  const seedSessions = await db.session.findMany({
    where:  { coachId: { in: seedCoachIds } },
    select: { id: true },
  });
  const seedSessionIds = seedSessions.map(s => s.id);

  await db.review.deleteMany({ where: { sessionId: { in: seedSessionIds } } });
  await db.notification.deleteMany({ where: { userId: { in: seedUserIds } } });
  await db.payout.deleteMany({ where: { sessionId: { in: seedSessionIds } } });
  await db.booking.deleteMany({ where: { sessionId: { in: seedSessionIds } } });
  await db.waitlistEntry.deleteMany({ where: { sessionId: { in: seedSessionIds } } });
  await db.session.deleteMany({ where: { id: { in: seedSessionIds } } });
  await db.coachProfile.deleteMany({ where: { id: { in: seedCoachIds } } });
  await db.user.deleteMany({ where: { id: { in: seedUserIds } } });

  console.log(`   ✅ ${seedUserIds.length} users seed supprimés (+ toutes leurs données liées)\n`);
}

// ─── Entry point ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

(async () => {
  try {
    if (args.includes("--reset")) {
      await reset();
      await main();
    } else {
      await main();
    }
  } catch (e) {
    console.error("❌ Erreur seed :", e);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
})();
