import { z } from "zod";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils/slugify";
import {
  MIN_PRICE_CENTS,
  MAX_PRICE_CENTS,
  MIN_SPOTS,
  MAX_SPOTS,
  DURATION_OPTIONS,
} from "@/constants";

// ——— Schéma de validation ——————————————————————————————————————————————————

export const createSessionSchema = z.object({
  // Étape 1 — Type
  sessionType: z.enum(["discovery", "progression"]),

  // Étape 2 — Infos
  title:       z.string().min(5, "Minimum 5 caractères").max(80, "Maximum 80 caractères"),
  description: z.string().min(20, "Minimum 20 caractères").max(1000, "Maximum 1000 caractères"),
  skillFocus:  z.string().min(3, "Minimum 3 caractères").max(100, "Maximum 100 caractères"),
  domain:      z.enum(["sport", "music", "cooking", "language", "business", "art", "other"]),
  category:    z.string().min(2, "Obligatoire").max(50),
  coverImageUrl: z.string().url("URL d'image invalide").optional().or(z.literal("")),

  // Étape 3 — Date & heure
  dateStart:   z.string().min(1, "Date obligatoire"),  // ISO string
  durationMin: z.number().refine(v => (DURATION_OPTIONS as readonly number[]).includes(v), "Durée invalide"),  

  // Étape 4 — Lieu
  locationAddress: z.string().min(5, "Adresse obligatoire").max(200),
  locationLat:     z.number().refine((v) => v >= -90 && v <= 90 && v !== 0, "Latitude invalide"),
  locationLng:     z.number().refine((v) => v >= -180 && v <= 180 && v !== 0, "Longitude invalide"),

  // Étape 5 — Tarif & places
  priceCents: z
    .number()
    .min(MIN_PRICE_CENTS, `Prix minimum ${MIN_PRICE_CENTS / 100}€`)
    .max(MAX_PRICE_CENTS, `Prix maximum ${MAX_PRICE_CENTS / 100}€`),
  maxSpots: z
    .number()
    .int()
    .min(MIN_SPOTS, `Minimum ${MIN_SPOTS} places`)
    .max(MAX_SPOTS, `Maximum ${MAX_SPOTS} places`),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;

// ——— Fonction principale ——————————————————————————————————————————————————

export async function createSession(
  input: CreateSessionInput,
  coachProfileId: string,
) {
  const parsed = createSessionSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message);
  }

  const data = parsed.data;

  // Générer un slug unique
  const baseSlug = slugify(`${data.category}-${data.skillFocus}`);
  const slug = await makeUniqueSlug(baseSlug);

  const session = await db.session.create({
    data: {
      coachId:         coachProfileId,
      title:           data.title,
      description:     data.description,
      sessionType:     data.sessionType,
      domain:          data.domain,
      category:        data.category,
      skillFocus:      data.skillFocus,
      coverImageUrl:   data.coverImageUrl || null,
      dateStart:       new Date(data.dateStart),
      durationMin:     data.durationMin,
      locationAddress: data.locationAddress,
      locationLat:     data.locationLat,
      locationLng:     data.locationLng,
      priceCents:      data.priceCents,
      maxSpots:        data.maxSpots,
      spotsTaken:      0,
      status:          "published",
      slug,
    },
  });

  // Incrémenter le compteur de sessions du coach
  await db.coachProfile.update({
    where: { id: coachProfileId },
    data:  { totalSessions: { increment: 1 } },
  });

  return session;
}

// ——— Helper : slug unique ——————————————————————————————————————————————————

async function makeUniqueSlug(base: string): Promise<string> {
  let candidate = base;
  let attempt = 0;

  while (true) {
    const existing = await db.session.findUnique({ where: { slug: candidate } });
    if (!existing) return candidate;
    attempt++;
    candidate = `${base}-${attempt}`;
  }
}
