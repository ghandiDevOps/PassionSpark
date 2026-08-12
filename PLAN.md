# PassionSpark — Plan de restructuration & correction de bugs

> Rédigé le 2026-08-12 · Statut : **EN COURS**

---

## 1. Architecture du projet

```
passionspark/
├── prisma/schema.prisma              # Schéma DB (PostgreSQL via Supabase)
├── src/
│   ├── app/
│   │   ├── (auth)/                   # Sign-in / Sign-up (Clerk)
│   │   ├── (coach)/
│   │   │   ├── dashboard/page.tsx    # BUG-01 ← bouton Stripe Connect cassé
│   │   │   ├── earnings/page.tsx     # Revenus coach
│   │   │   ├── onboarding/page.tsx   # Onboarding 3 étapes (domaine → bio → go!)
│   │   │   ├── profile/page.tsx      # BUG-07 ← redirect /onboarding (pas d'éditeur)
│   │   │   ├── sessions/[id]/scan/   # Page scan QR ✅
│   │   │   └── sessions/new/         # Création session ✅
│   │   ├── (marketing)/explore/      # Explorateur ✅
│   │   ├── (passionné)/my/bookings/  # Mes billets ✅
│   │   ├── api/
│   │   │   ├── coach/stripe-connect/route.ts  # ✅ existe — jamais appelé depuis UI
│   │   │   ├── coach/onboarding/route.ts      # Onboarding coach
│   │   │   ├── sessions/[id]/reserve/route.ts # BUG-02 ← bloqué faute Stripe
│   │   │   ├── sessions/[id]/scan/route.ts    # Scan QR ✅
│   │   │   └── webhooks/stripe/route.ts       # Webhook Stripe ✅
│   │   ├── book/[sessionId]/
│   │   │   ├── page.tsx              # BUG-06+08 ← placeholder SSR + pas de guard
│   │   │   ├── payment/page.tsx      # Page paiement Stripe ✅
│   │   │   └── confirmation/page.tsx # Confirmation + QR ✅
│   │   └── s/[slug]/page.tsx         # Page session publique ✅
│   ├── components/
│   │   ├── booking/booking-qr-card.tsx      # Affichage QR participant ✅
│   │   ├── coach/stripe-connect-button.tsx  # À CRÉER (BUG-01)
│   │   ├── scanner/scan-client.tsx          # Scanner QR coach ✅
│   │   └── session/session-form/
│   │       ├── step-datetime.tsx            # BUG-03 ← timezone
│   │       └── step-pricing.tsx             # BUG-05 ← places min=10
│   ├── constants/index.ts                   # MIN_SPOTS=10 → BUG-05
│   └── lib/utils/format-date.ts            # BUG-03 ← UTC au lieu de Paris
```

---

## 2. Comptes de test

| Rôle | Persona | Email | Auth |
|------|---------|-------|------|
| Coach | Marcus Delorme | ghsghandi+coach@gmail.com | OTP uniquement |
| Participant | Léa Martin | ghsghandi+user1@gmail.com | PassionSpark2026! |
| Participant | Thomas Nguyen | ghsghandi+user2@gmail.com | PassionSpark2026! |
| Participant | Sara Ibañez | ghsghandi+user3@gmail.com | PassionSpark2026! |

**Session de test :**
- ID : `73974545-63cf-42d4-bac1-8a128b8b5722`
- URL : https://passionplay.vercel.app/s/photographie-savoir-utiliser-la-lumiere-du-jour-pour-des-portraits-et-des-scenes
- Booking : https://passionplay.vercel.app/book/73974545-63cf-42d4-bac1-8a128b8b5722

---

## 3. Bugs identifiés & corrections

### 🔴 BUG-01 — Stripe Connect non câblé dans le dashboard

**Symptôme :** Le bouton "ACTIVER →" dans le dashboard coach pointe vers `/onboarding` au lieu de lancer le flux Stripe Connect.

**Fichiers concernés :**
- `src/app/(coach)/dashboard/page.tsx` · ligne 133 : `href="/onboarding"` → à remplacer
- `src/components/coach/stripe-connect-button.tsx` → à CRÉER

**Correction :**
```tsx
// stripe-connect-button.tsx (client component)
'use client';
export function StripeConnectButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  async function activate() {
    setLoading(true);
    const res = await fetch('/api/coach/stripe-connect', { method: 'POST' });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setError(data.error ?? 'Erreur');
    setLoading(false);
  }
  
  return <button onClick={activate}>{loading ? '...' : 'ACTIVER →'}</button>;
}
```

**Impact :** Débloque BUG-02 (toutes les réservations) une fois Stripe configuré.

---

### 🔴 BUG-02 — Réservations impossibles

**Symptôme :** Erreur "Le paiement n'est pas encore activé pour ce coach" sur toute tentative de réservation.

**Fichier concerné :**
- `src/app/api/sessions/[id]/reserve/route.ts` · ligne 52 : `if (!session.coach.stripeAccountId) throw new Error("COACH_STRIPE_NOT_CONFIGURED")`

**Correction :** Résolu automatiquement après BUG-01 (une fois Marcus connecté à Stripe, `stripeAccountId` sera renseigné en DB).

---

### 🟠 BUG-03 — Timezone : heure affichée en UTC (−2h en été)

**Symptôme :** Session créée à 10h00 → affichée à 08h00 partout.

**Cause :** Le serveur Vercel/Node tourne en UTC. `date-fns` sans timezone utilise l'heure locale du serveur → UTC au lieu de Paris.

**Fichier concerné :**
- `src/lib/utils/format-date.ts` · fonctions `formatSessionDateTime`, `formatTime`, `formatDateLong`, `formatDateShort`

**Correction :** Utiliser `Intl.DateTimeFormat` avec `timeZone: 'Europe/Paris'` (natif, pas de dépendance supplémentaire).

```ts
function formatParis(date: Date, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', ...options }).format(date);
}
```

---

### 🟠 BUG-05 — Places minimum = 10 (impossible < 10 participants)

**Symptôme :** Le slider "PLACES MAX" a min=10, impossible de créer une session intime.

**Fichiers concernés :**
- `src/constants/index.ts` · `MIN_SPOTS = 10` → `MIN_SPOTS = 2`
- `src/app/(coach)/onboarding/page.tsx` · texte "10–20 participants" → "2–20"

**Correction :** Triviale.

---

### 🟡 BUG-06 — Placeholder "Léa" hardcodé dans le formulaire de réservation

**Symptôme :** Le champ "Ton prénom" affiche `placeholder="Léa"` (nom de la première testeuse).

**Fichier concerné :**
- `src/app/book/[sessionId]/page.tsx` · ligne ~85 : `placeholder="Léa"`

**Correction :** → `placeholder="Ton prénom"` (ou prénom générique)

---

### 🟡 BUG-07 — /profile coach redirige toujours vers /onboarding

**Symptôme :** Impossible d'éditer son profil coach sans repasser par l'onboarding complet (qui écrase le profil existant).

**Fichier concerné :**
- `src/app/(coach)/profile/page.tsx` → contient uniquement `redirect("/onboarding")`

**Correction :**
1. Créer `src/app/api/coach/profile/route.ts` (PATCH — mise à jour bio)
2. Construire un éditeur de profil server+client avec bio, domaine affiché, lien Stripe Connect

---

### 🟡 BUG-08 — Pas de guard : coach peut publier sans Stripe, participants arrivent sur un mur

**Symptôme :** Le participant remplit le formulaire de réservation, clique Continuer → erreur COACH_STRIPE_NOT_CONFIGURED. L'erreur arrive APRÈS la saisie.

**Fichier concerné :**
- `src/app/book/[sessionId]/page.tsx` → currently client component, no prefetch

**Correction :** Convertir en server component qui pre-fetch le statut Stripe du coach :
- Si `stripeAccountId` null → afficher écran "Session temporairement indisponible" AVANT le formulaire
- Si ok → afficher le formulaire normalement

---

## 4. Flux utilisateur complet (référence E2E)

### Flux Participant

```
[1] Explore → /explore
    ↓ filtre PHOTOGRAPHIE / DÉCOUVERTE
[2] Clique sur la session Marcus
    ↓ /s/{slug} — titre, date, lieu, prix, places
[3] Clique "Réserver une place"
    ↓ /book/{sessionId}
[4] Saisit prénom + email → Continuer
    ↓ POST /api/sessions/{id}/reserve
    ↓ → crée booking pending + PaymentIntent Stripe
[5] Page paiement /book/{sessionId}/payment?client_secret=...
    ↓ saisit carte → payer
    ↓ Stripe webhook → payment_intent.succeeded
    ↓ → booking → "confirmed" + nouveau qrToken généré
[6] Redirect → /book/{sessionId}/confirmation?booking_id=...&redirect_status=succeeded
    ↓ affiche QR code à l'écran
    ↓ email envoyé avec QR (Resend)
[7] Le jour J : montre QR au coach pour scan
```

### Flux Coach

```
[1] S'inscrit → /onboarding (domaine, bio)
[2] Dashboard → alerte "PAIEMENTS NON ACTIVÉS"
    ↓ clique ACTIVER → POST /api/coach/stripe-connect
    ↓ → redirigé vers Stripe Express Onboarding
    ↓ → retourne sur /onboarding?stripe_success=true
    ↓ → webhook account.updated → stripeOnboardingStatus = "active"
[3] Crée une session → /sessions/new (6 étapes)
[4] Partage le lien session
[5] Le jour J : /sessions/{id}/scan
    ↓ onglet SCAN → camera → lit QR → POST /api/sessions/{id}/scan
    ↓ OU onglet LISTE → "MARQUER ✓" manuellement
    ↓ → booking status "attended"
[6] Realtime : compteur participants validés mis à jour en direct (Supabase Realtime)
```

---

## 5. Plan de correction — ordre d'exécution

| # | Bug | Fichier(s) | Effort | Statut |
|---|-----|------------|--------|--------|
| 1 | BUG-05 | constants/index.ts | 5 min | ✅ |
| 2 | BUG-03 | lib/utils/format-date.ts | 15 min | ✅ |
| 3 | BUG-06 | book/[sessionId]/page.tsx | 2 min | ✅ |
| 4 | BUG-01 | dashboard/page.tsx + NEW stripe-connect-button.tsx | 20 min | ✅ |
| 5 | BUG-08 | book/[sessionId]/page.tsx (refactor server) | 20 min | ✅ |
| 6 | BUG-07 | profile/page.tsx + NEW api/coach/profile/route.ts | 30 min | ✅ |
| 7 | Deploy | git push → Vercel | auto | 🔄 |
| 8 | Test E2E | Marcus Stripe + Léa booking + scan QR | 30 min | 🔄 |

---

## 6. Tests E2E à valider après déploiement

### Côté Coach (Marcus)
- [ ] Dashboard affiche le bouton "ACTIVER →" (Stripe Connect)
- [ ] Clic ACTIVER → redirect Stripe → retour app → stripeOnboardingStatus = active
- [ ] Dashboard n'affiche plus la bannière orange après activation
- [ ] Création d'une session avec min 2 places
- [ ] Heure de la session affichée correctement (Paris timezone)
- [ ] Accès à /profile → page éditeur bio (plus de redirect onboarding)
- [ ] /sessions/{id}/scan → caméra → scan QR → "Bienvenue {nom} !"
- [ ] Onglet LISTE → "MARQUER ✓" → participant validé

### Côté Participant (Léa / Thomas / Sara)
- [ ] /explore → session visible avec badge PHOTOGRAPHIE
- [ ] Clic "Réserver" → formulaire sans placeholder "Léa"
- [ ] Saisit nom + email → Continuer → page paiement (plus d'erreur STRIPE)
- [ ] Paiement CB test (4242 4242 4242 4242) → confirmation
- [ ] Page confirmation → QR code affiché
- [ ] Email de confirmation reçu avec QR
- [ ] Heure sur la confirmation = heure Paris (pas UTC)
- [ ] /my/bookings → booking visible

### Réservation last-minute
- [ ] Réservation moins de 24h avant la session → autorisée (pas de blocage client)
- [ ] Réservation après que la session est "full" → erreur "Plus de place"
- [ ] Si le coach n'a pas Stripe → page "Session temporairement indisponible" (plus d'erreur cachée après saisie)

---

## 7. Notes techniques

### Pourquoi le bouton Stripe est un composant client séparé
Le `dashboard/page.tsx` est un **Server Component** (pas de `"use client"`). On ne peut pas appeler `fetch` côté client directement dedans. Le pattern correct est d'extraire le bouton en `StripeConnectButton` (client component) importé dans le server component.

### Pourquoi `Intl.DateTimeFormat` et pas `date-fns-tz`
`date-fns-tz` n'est pas installé. `Intl.DateTimeFormat` est natif dans Node 18+ et parfaitement supporté sur Vercel. Pas de dépendance supplémentaire.

### Pourquoi le stockage UTC est correct
La conversion `new Date("2026-08-15T10:00:00")` sur un **navigateur** Paris (UTC+2) interprète `10:00` comme heure locale → stocke `08:00 UTC` en base. C'est **correct**. Le bug est uniquement côté **affichage** serveur (Vercel UTC → affiche `08:00` au lieu de `10:00`).

### QR token
Le `qrToken` est régénéré à chaque confirmation de paiement (dans le webhook `payment_intent.succeeded`). Le token côté `booking.create` est provisoire. C'est intentionnel (sécurité : le QR n'est valide qu'après paiement confirmé).
