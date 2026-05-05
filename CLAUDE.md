# Passion Spark — Contexte projet pour Claude

> Ce fichier est lu automatiquement à chaque session.
> Pour le contexte complet → lire `../MEMORY.md`, `../SECURITY.md`, `../CODE_GUIDE.md`

---

## C'est quoi Passion Spark

Plateforme de sessions collectives ultra-ciblées : un coach propose une session d'1h sur **une seule compétence précise** (ex: "tir à 3 points", "défense au sol MMA") à 10-20 personnes, entre 13€ et 20€. Mobile-first, réservation en < 30 secondes. On commence par le sport, l'architecture est pensée multi-domaines.

**Tagline :** "Spark your next passion." / "Allume ta prochaine passion."
**Domaine :** passionspark.fr

---

## Règles métier à ne jamais changer sans validation

```
Prix session           13€ → 20€  (MIN_PRICE_CENTS / MAX_PRICE_CENTS)
Groupe                 10 → 20 personnes
Commission coach       70%
Commission Passion Spark  23%
Commission parrainage   7%  (reversé à qui amène le client — coach ou Passion Spark)
Si coach = référent    77%  (70 + 7)
application_fee_amount 30%  (23 + 7) — calculé dans src/lib/stripe.ts UNIQUEMENT
```

---

## Stack

```
Next.js 14 App Router + TypeScript + Tailwind
Auth         Clerk
DB           PostgreSQL → Supabase eu-west-1 + Prisma ORM
Realtime     Supabase Realtime (compteur de places)
Paiement     Stripe Connect Express (Destination Charge)
Emails       Resend + react-email
Deploy       Vercel + Cron Jobs
QR           qrcode.react (génération) + jsQR (scan)
```

---

## Design System

> ⚠️ Avant toute intervention UI : lire `DESIGN_SYSTEM.md`

```
Fond principal    : #1a1a1a   (dark, pas tout noir)
Fond carte        : #1e1e1e
Bordure           : #2a2a2a

Flamme jaune      : #FFB700
Flamme orange     : #E8953F   ← couleur marque principale (orange flyer basket)
Flamme rouge      : #D86529   ← orange profond (hover, urgence)

Gradient flamme   : linear-gradient(90deg, #FFB700 0%, #D86529 100%)

Découverte badge  : #10b981  (vert)
Progression badge : #3b82f6  (bleu)
```

Polices : `font-display` (Impact/Arial Black, MAJUSCULES) + `font-sans` (Geist)
Boutons : angulaires (pas arrondis), gradient flamme, glow orange sur hover

### Compétences design disponibles

Pour voir le site visuellement et donner du feedback :
```bash
# 1. Lance le dev server
npm run dev

# 2. Dans un autre terminal, prends des screenshots
npm run screenshot          # toutes les pages en mobile
npm run screenshot -- /     # une page spécifique
npm run screenshot:full     # full-page

# 3. Envoie les images screenshots/*.png à Claude
#    → Claude analyse et propose des améliorations précises
```

Claude peut :
- Analyser les screenshots pixel par pixel
- Comparer avant/après
- Vérifier la cohérence avec le Design System
- Suggérer des animations, micro-interactions, spacing
- Générer le code CSS/Tailwind des corrections

---

## État d'avancement

| Phase | Statut | Détail |
|-------|--------|--------|
| Docs + scaffold | ✅ Fait | — |
| Flyers coachs V3 | ✅ Fait | marketing/flyers/ |
| Phase 0 — Infra | ✅ Fait | Next.js, Prisma, Clerk, Stripe, Supabase, Resend — .env.local complet |
| Phase 1 — Auth | ✅ Fait | sign-in, sign-up, onboarding, webhook Clerk, middleware |
| Phase 2 — Sessions | ⚠️ Partiel | Page publique `/s/[slug]` ✅ — Formulaire création ❌ |
| Phase 3 — Paiement | 🔄 En cours | Reserve API ✅, booking form ✅, **page payment ✅ (2026-04-16)**, confirmation ✅ |
| Phase 4 — QR Scan | ⚠️ Partiel | API scan ✅ — Composants scanner UI ❌ |
| Phase 5 — Lancement | ⏳ | — |

> 📋 Suivi détaillé session par session → `../LAST_SESSION.md`

---

## Règles de sécurité critiques (détail → ../SECURITY.md)

1. **Secrets serveur uniquement** — jamais de `STRIPE_SECRET_KEY`, `CLERK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY` dans un composant `use client`
2. **Montant depuis la DB** — jamais faire confiance au montant venant du client pour un PaymentIntent
3. **Transaction atomique** — la réservation (`reserve/route.ts`) utilise `db.$transaction()` obligatoirement
4. **Signature webhook** — toujours appeler `constructWebhookEvent()` avant de traiter un payload Stripe
5. **Ownership coach** — toujours vérifier `session.coachId === userId` avant toute mutation
6. **Idempotence webhook** — vérifier `booking.status === "confirmed"` avant de retraiter un paiement
7. **QR Token** — généré avec `crypto.randomUUID()`, invalide après premier scan

---

## Fichiers clés à connaître

```
src/lib/stripe.ts              ← calculateAmounts(), createPaymentIntent()
src/lib/db.ts                  ← singleton Prisma (toujours importer db depuis ici)
src/lib/supabase.ts            ← client Realtime + Storage
src/constants/index.ts         ← toutes les constantes métier
src/middleware.ts               ← routes protégées Clerk
prisma/schema.prisma           ← schéma BDD complet (9 modèles, 11 enums)

src/app/api/sessions/[id]/reserve/route.ts  ← réservation atomique
src/app/api/webhooks/stripe/route.ts        ← confirmation paiement + QR
src/app/api/webhooks/clerk/route.ts         ← sync users en base
src/app/s/[slug]/page.tsx                   ← page session publique (SSR)
src/app/(coach)/sessions/[id]/scan/page.tsx ← scanner QR côté coach
```

---

## Conventions

- Fichiers : `kebab-case.tsx`
- Composants : `PascalCase`
- Par défaut Server Component — `"use client"` seulement si état/événements
- Erreurs API : `{ error: "MESSAGE_CODE" }` + code HTTP
- Validation : toujours Zod sur les inputs API
- Après modif schema Prisma : `npx prisma generate` puis `npx prisma migrate dev`

---

## Structure des dossiers (racine du projet)

```
docs/          ← documentation complète
docs/phases/   ← guides par phase (PHASE_0_SETUP.md, ...)
marketing/     ← flyers PDF coachs
passionspark/  ← CE DOSSIER — code Next.js
../MEMORY.md   ← mémoire complète du projet
../SECURITY.md ← règles sécurité avec exemples de code
../CODE_GUIDE.md ← doc de chaque fichier et fonction
```

---

*CLAUDE.md — Lu automatiquement à chaque session VS Code*
