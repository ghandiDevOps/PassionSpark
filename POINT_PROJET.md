# Passion Spark — Point projet complet
*Généré le 2026-05-01*

---

## 🎯 Vision & concept

**Passion Spark** est une marketplace de micro-sessions collectives ultra-ciblées.
Un coach propose une session d'1h sur **une seule compétence précise** (ex: "tir à 3 points", "défense au sol MMA", "sauté en dansé") à 10–20 personnes, entre 13€ et 20€. Réservation en moins de 30 secondes, mobile-first.

**Proposition de valeur** :
- Pour les coachs : monétiser un créneau libre sans abonnement ni plateforme lourde, garder 70–77% du revenu
- Pour les participants : accéder à un expert sur une compétence précise, à prix accessible, en groupe (social, motivant)
- Pour Passion Spark : 23% de commission sur chaque session, scalable multi-domaines

**Tagline** : "Spark your next passion." / "Allume ta prochaine passion."

**Domaine** : passionspark.fr  
**GitHub** : ghandiDevOps/passionspark *(à renommer sur GitHub.com)*  
**Vercel** : projet passionspark *(renommé dans .vercel/project.json)*

---

## 💰 Modèle économique

| Acteur | Part |
|--------|------|
| Coach | 70% |
| Passion Spark | 23% |
| Référent parrainage | 7% |
| Si coach = référent | 77% (70+7) |

Prix : 13€ → 20€ / personne · Groupe : 10 → 20 personnes  
**Revenu potentiel par session** : 130€ → 400€ (dont 30€ → 92€ pour Passion Spark)

Paiement : Stripe Connect Express, Destination Charge.  
Le coach reçoit sa part automatiquement après la session via `Payout`.

---

## 🏗️ Architecture technique

```
Next.js 14 App Router + TypeScript + Tailwind
Auth         Clerk (webhooks → sync DB)
DB           PostgreSQL sur Supabase eu-west-1 (Prisma ORM)
Realtime     Supabase Realtime (compteur places en direct)
Paiement     Stripe Connect Express
Emails       Resend + react-email
Deploy       Vercel (+ Cron Jobs pour rappels)
QR           qrcode.react (génération) + jsQR (scan caméra)
Monitoring   Sentry
Analytics    Vercel Analytics
```

**9 modèles DB** : User, CoachProfile, Session, Booking, Review, Venue, WaitlistEntry, Payout, Notification, AuditLog  
**11 enums** : UserRole, SessionType, SessionDomain, SessionStatus, BookingStatus, StripeOnboardingStatus, PayoutStatus, NotificationType, NotificationChannel, WaitlistStatus, CancellationBy

---

## 📄 Toutes les pages de l'application

### Pages publiques / marketing
| Route | Fichier | Statut |
|-------|---------|--------|
| `/` | (marketing)/page.tsx | ✅ |
| `/explore` | (marketing)/explore/page.tsx | ✅ |
| `/s/[slug]` | s/[slug]/page.tsx | ✅ SSR |

### Tunnel de réservation (participant)
| Route | Fichier | Statut |
|-------|---------|--------|
| `/book/[sessionId]` | book/[sessionId]/page.tsx | ✅ |
| `/book/[sessionId]/payment` | book/[sessionId]/payment/page.tsx | ✅ Stripe Elements |
| `/book/[sessionId]/confirmation` | book/[sessionId]/confirmation/page.tsx | ✅ QR + iCal |

### Espace coach
| Route | Fichier | Statut |
|-------|---------|--------|
| `/dashboard` | (coach)/dashboard/page.tsx | ✅ |
| `/earnings` | (coach)/earnings/page.tsx | ✅ |
| `/analytics` | (coach)/analytics/page.tsx | ✅ |
| `/sessions` | (coach)/sessions/page.tsx | ✅ |
| `/sessions/new` | (coach)/sessions/new/page.tsx | ⚠️ Page existe, formulaire incomplet |
| `/sessions/[id]` | (coach)/sessions/[id]/page.tsx | ✅ |
| `/sessions/[id]/scan` | (coach)/sessions/[id]/scan/page.tsx | ⚠️ API ✅, UI scanner ❌ |
| `/onboarding` | (coach)/onboarding/page.tsx | ✅ |

### Espace participant
| Route | Fichier | Statut |
|-------|---------|--------|
| `/my` | (passionné)/my/page.tsx | ✅ |
| `/my/bookings` | (passionné)/my/bookings/page.tsx | ✅ |

### Administration
| Route | Fichier | Statut |
|-------|---------|--------|
| `/admin` | admin/page.tsx | ✅ |
| `/admin/users` | admin/users/page.tsx | ✅ |
| `/admin/users/[id]` | admin/users/[id]/page.tsx | ✅ |
| `/admin/sessions` | admin/sessions/page.tsx | ✅ |
| `/admin/sessions/[id]` | admin/sessions/[id]/page.tsx | ✅ |
| `/admin/bookings` | admin/bookings/page.tsx | ✅ |
| `/admin/bookings/[id]` | admin/bookings/[id]/page.tsx | ✅ |

### API Routes
| Route | Rôle |
|-------|------|
| `POST /api/sessions` | Créer une session |
| `POST /api/sessions/[id]/reserve` | Réservation atomique (transaction DB) |
| `POST /api/sessions/[id]/scan` | Scanner QR code |
| `GET /api/bookings/[id]/status` | Polling statut paiement |
| `POST /api/coach/onboarding` | Créer profil coach |
| `GET/POST /api/coach/stripe-connect` | Onboarding Stripe Connect |
| `GET /api/auth/redirect` | Redirection post-auth |
| `POST /api/webhooks/stripe` | Confirmation paiement + QR |
| `POST /api/webhooks/clerk` | Sync utilisateurs DB |
| `GET /api/cron/reminders` | Cron rappels email (Vercel) |
| `POST /api/admin/bookings/[id]/refund` | Remboursement admin |
| `PATCH /api/admin/sessions/[id]` | Modération session |
| `PATCH /api/admin/users/[id]` | Ban/unban utilisateur |
| `POST /api/reviews` | Soumettre un avis |

---

## ✅ Ce qui est fait (prod-ready)

- Infrastructure complète (DB, Auth, Stripe, Emails, Deploy)
- Authentification Clerk (sign-in, sign-up, webhook sync DB)
- Page session publique `/s/[slug]` avec SSR + OG image
- Tunnel de réservation complet : form → Stripe Payment → confirmation + QR
- Dashboard coach (sessions, gains, analytics)
- Espace admin (gestion users, sessions, bookings, refunds)
- Espace participant (mes billets)
- Cron rappels email (J-1, H-2)
- API scan QR (côté serveur)
- Schéma DB complet (9 modèles, waitlist, notifications, payouts, audit)
- Système de reviews

---

## ❌ Ce qui manque (bloquant pour le lancement)

### 1. Formulaire création de session (`/sessions/new`)
La page existe mais le formulaire de création n'est pas terminé.  
**Priorité absolue** — sans ça, aucun coach ne peut créer une session.

Ce qu'il faut :
- Formulaire complet avec tous les champs (titre, date, lieu, prix, type, domaine, skill, max_spots)
- Validation Zod côté client + serveur
- Upload image de couverture (Supabase Storage)
- Prévisualisation avant publication
- Appel `POST /api/sessions`

### 2. UI Scanner QR (`/sessions/[id]/scan`)
L'API de scan existe (`POST /api/sessions/[id]/scan`) mais la page UI est vide.  
Le coach doit pouvoir ouvrir son téléphone et scanner les QR des participants à l'entrée.

Ce qu'il faut :
- Composant `<QRScanner>` utilisant `jsQR` + `getUserMedia()`
- Feedback visuel (vert = validé, rouge = déjà utilisé / invalide)
- Liste des présents en temps réel (Supabase Realtime)

### 3. Page coach public (`/coaches/[slug]`)
Le dossier `(marketing)` n'a pas encore de page de profil public coach.  
Nécessaire pour que les participants puissent "suivre" un coach.

---

## ⚠️ Ce qui est partiel / à améliorer

### Page d'accueil `/`
La landing page existe mais probablement basique. À enrichir avec :
- Sessions à venir (temps réel)
- Témoignages / social proof
- Appel à l'action fort pour les coachs

### Page explore `/explore`
Filtre par domaine, date, lieu. À vérifier si tous les filtres fonctionnent.

### Waitlist
La table `waitlist_entries` est en DB, mais l'UI et la logique "notifier quand place dispo" ne sont pas implémentées.

### Emails transactionnels
Les templates react-email existent probablement (Resend configuré), mais à vérifier :
- Confirmation réservation (avec QR)
- Rappel J-1 et H-2
- Email au coach : nouvelle réservation
- Email au coach : session complète

### Profil coach (onboarding)
- L'onboarding Stripe Connect est présent mais le flow exact (redirect → retour) est à tester en prod
- Upload photo de profil

---

## 🔄 Renommage passionspark → passionspark

### Fait ✅
| Fichier | Changement |
|---------|------------|
| `package.json` | `"name": "passionspark"` |
| `CLAUDE.md` | Mention du dossier |
| `confirmation/page.tsx` | `download="passionspark-session.ics"` |
| `RevenueCharts.tsx` | Noms de fichiers export CSV/PDF |
| `.vercel/project.json` | `"projectName":"passionspark"` |
| `.git/config` | URL remote → github.com/ghandiDevOps/passionspark.git |

### À faire manuellement ⚠️

**1. Renommer le repo GitHub**
- Aller sur https://github.com/ghandiDevOps/passionspark
- Settings → Général → Repository name → `passionspark` → Rename
- *Le git remote local est déjà mis à jour*

**2. Renommer le projet Vercel**
- Aller sur https://vercel.com/dashboard
- Projet passionspark → Settings → General → Project Name → `passionspark`
- *Le fichier .vercel/project.json est déjà mis à jour*

**3. Renommer le dossier physique** (quand VS Code est fermé)
- `C:\Users\ghand\OneDrive\Documents\Claude\Projects\PassionSpark\passionspark`
- → renommer en `passionspark`

**4. Supabase / Base de données**
- Le nom du projet Supabase n'a pas d'impact sur le code (connexion via URL dans `.env.local`)
- Les tables sont correctement nommées (`sessions`, `bookings`, etc.)
- Pas de renommage nécessaire côté DB

**5. Clerk**
- L'application Clerk est liée par des clés API dans `.env.local`
- Pas de renommage nécessaire

**6. Resend**
- Vérifie que le domaine d'envoi email est `@passionspark.fr` (ou configurer)

---

## 🚀 Plan de lancement recommandé

### Semaine 1 — Terminer le MVP
1. **Formulaire création session** complet (priorité #1)
2. **UI Scanner QR** pour les coachs
3. Tests end-to-end du tunnel complet (créer session → réserver → payer → scanner)

### Semaine 2 — Polish & contenu
1. Landing page enrichie avec vraies sessions
2. Page profil coach public
3. Vérifier tous les emails transactionnels
4. Test de l'onboarding Stripe Connect en mode live

### Semaine 3 — Lancement beta
1. Recruter 3–5 coachs pilotes (basket, MMA, danse)
2. Créer leurs premières sessions
3. Inviter 50–100 participants pour les premières sessions
4. Monitorer Sentry + Vercel logs

---

## 📊 État de la base de données (au 2026-05-01)

Données réelles constatées :
- **2 utilisateurs** (tous les deux coachs)
- **1 session** publiée : "tir & finition" (basketball)
- **2 réservations** en statut `pending` (du 30 avril 2026)
- Les bookings pending sont des tests — le webhook Stripe n'a pas confirmé

---

## 🔐 Rappel des règles de sécurité critiques

1. Montants Stripe calculés **uniquement depuis la DB** (jamais depuis le client)
2. Réservation via `db.$transaction()` atomique (évite double-booking)
3. Webhook Stripe vérifié avec `constructWebhookEvent()` + signature
4. Ownership coach vérifié avant toute mutation de session
5. QR Token invalidé après le premier scan
6. Secrets jamais dans les composants `"use client"`
