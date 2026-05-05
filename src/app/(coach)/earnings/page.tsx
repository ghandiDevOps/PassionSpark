import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils/format-price";
import { formatSessionDateTime } from "@/lib/utils/format-date";

export const metadata = { title: "Revenus · Passion Spark" };

export default async function EarningsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await db.user.findUnique({
    where:   { clerkId: userId },
    include: { coachProfile: true },
  });

  if (!user?.coachProfile) redirect("/onboarding");

  const now          = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [payouts, thisMonthBookings, allBookings] = await Promise.all([
    db.payout.findMany({
      where:   { coachId: user.coachProfile.id },
      include: { session: { select: { title: true, dateStart: true, durationMin: true } } },
      orderBy: { createdAt: "desc" },
      take:    20,
    }),
    db.booking.findMany({
      where: {
        session: { coachId: user.coachProfile.id },
        status:  { in: ["confirmed", "attended"] },
        paidAt:  { gte: startOfMonth },
      },
      select: { amountPaidCents: true },
    }),
    db.booking.findMany({
      where: {
        session: { coachId: user.coachProfile.id },
        status:  { in: ["confirmed", "attended"] },
      },
      select: { amountPaidCents: true },
    }),
  ]);

  const thisMonthGross = thisMonthBookings.reduce((s, b) => s + (b.amountPaidCents ?? 0), 0);
  const totalGross     = allBookings.reduce((s, b) => s + (b.amountPaidCents ?? 0), 0);
  const thisMonthNet   = Math.round(thisMonthGross * 0.70);
  const totalNet       = Math.round(totalGross * 0.70);
  const pendingPayout  = payouts.filter(p => p.status === "pending").reduce((s, p) => s + p.netAmountCents, 0);

  return (
    <div className="px-4 sm:px-6 py-8 space-y-10" style={{ color: "var(--color-text)" }}>

      {/* ── Header ── */}
      <div className="space-y-1">
        <p className="font-display-md text-[10px] tracking-[0.3em]" style={{ color: "var(--color-muted)" }}>
          COACH DASHBOARD
        </p>
        <h1 className="font-display leading-none" style={{ fontSize: "clamp(2.5rem, 8vw, 4.5rem)" }}>
          MES <span className="flame-text">REVENUS.</span>
        </h1>
      </div>

      {/* ── Séparateur ── */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1" style={{ backgroundColor: "var(--color-border)" }} />
        <span className="font-display-md text-[9px] tracking-[0.3em]" style={{ color: "var(--color-muted)" }}>
          APERÇU FINANCIER
        </span>
        <div className="h-px flex-1" style={{ backgroundColor: "var(--color-border)" }} />
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="border p-5 space-y-1" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <p className="font-display-md text-[10px] tracking-widest" style={{ color: "var(--color-muted)" }}>CE MOIS (NET)</p>
          <p className="font-display flame-text" style={{ fontSize: "clamp(2rem, 7vw, 3rem)" }}>{formatPrice(thisMonthNet)}</p>
          <p className="font-sans text-xs" style={{ color: "var(--color-muted)" }}>{formatPrice(thisMonthGross)} brut</p>
        </div>
        <div className="border p-5 space-y-1" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <p className="font-display-md text-[10px] tracking-widest" style={{ color: "var(--color-muted)" }}>TOTAL ALL TIME</p>
          <p className="font-display" style={{ fontSize: "clamp(2rem, 7vw, 3rem)", color: "var(--color-text)" }}>{formatPrice(totalNet)}</p>
          <p className="font-sans text-xs" style={{ color: "var(--color-muted)" }}>{formatPrice(totalGross)} brut</p>
        </div>
        {pendingPayout > 0 && (
          <div className="border-l-2 border-[#FF7A00] pl-4 py-3 col-span-2 flex items-center justify-between">
            <div>
              <p className="font-display-md text-[10px] tracking-[0.2em] text-[#FF7A00]">EN ATTENTE DE VERSEMENT</p>
              <p className="font-display text-3xl text-[#FF7A00]">{formatPrice(pendingPayout)}</p>
              <p className="font-sans text-xs mt-0.5 text-[#FF7A00]/60">Versement sous 2–7 jours ouvrés</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Commission info ── */}
      <div className="border p-5 space-y-4" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
        <p className="font-display-md text-[10px] tracking-[0.25em]" style={{ color: "var(--color-muted)" }}>
          TON TAUX DE COMMISSION
        </p>
        <div className="w-full h-8 flex overflow-hidden border" style={{ borderColor: "var(--color-border)" }}>
          <div
            className="flex items-center justify-center font-display-md text-xs text-black"
            style={{ width: "70%", background: "linear-gradient(90deg, #FFB700 0%, #D86529 100%)" }}
          >
            70% TOI
          </div>
          <div
            className="flex items-center justify-center font-display-md text-[10px]"
            style={{ width: "22%", backgroundColor: "rgba(255,122,0,0.2)", color: "var(--color-muted)" }}
          >
            22%
          </div>
          <div
            className="flex items-center justify-center font-display-md text-[10px]"
            style={{ width: "8%", backgroundColor: "var(--color-border)", color: "var(--color-muted)" }}
          >
            7%
          </div>
        </div>
        <div className="flex justify-between font-display-md text-[9px] tracking-widest" style={{ color: "var(--color-muted)" }}>
          <span>Tes revenus</span>
          <span>Plateforme</span>
          <span>Frais</span>
        </div>
        <p className="text-xs font-sans" style={{ color: "var(--color-muted)" }}>
          Si tu ramènes toi-même tes participants →{" "}
          <strong style={{ color: "var(--color-text)" }}>77%</strong> pour toi.
        </p>
      </div>

      {/* ── Séparateur ── */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1" style={{ backgroundColor: "var(--color-border)" }} />
        <span className="font-display-md text-[9px] tracking-[0.3em]" style={{ color: "var(--color-muted)" }}>
          HISTORIQUE DES VERSEMENTS
        </span>
        <div className="h-px flex-1" style={{ backgroundColor: "var(--color-border)" }} />
      </div>

      {/* ── Historique payouts ── */}
      {payouts.length === 0 ? (
        <div className="border p-12 text-center space-y-3" style={{ backgroundColor: "var(--color-bg-card)", borderColor: "var(--color-border)" }}>
          <p className="font-display text-[80px] leading-none" style={{ color: "var(--color-border)" }}>0€</p>
          <p className="text-sm font-sans" style={{ color: "var(--color-muted)" }}>
            Tes versements apparaîtront ici après ta première session.
          </p>
        </div>
      ) : (
        <div className="border divide-y" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-card)" }}>
          {payouts.map(payout => (
            <div key={payout.id} className="flex items-center gap-4 px-4 py-4" style={{ borderColor: "var(--color-border)" }}>
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm truncate" style={{ color: "var(--color-text)" }}>
                  {payout.session.title}
                </p>
                <p className="text-xs font-sans mt-0.5 capitalize" style={{ color: "var(--color-muted)" }}>
                  {formatSessionDateTime(payout.session.dateStart, payout.session.durationMin)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-display text-xl text-[#FF7A00]">{formatPrice(payout.netAmountCents)}</p>
                <span
                  className="font-display-md text-[10px]"
                  style={{
                    color: payout.status === "completed" ? "#10b981"
                         : payout.status === "pending"   ? "#FF7A00"
                         : "var(--color-muted)"
                  }}
                >
                  {payout.status === "completed" ? "VERSÉ ✓"
                   : payout.status === "pending" ? "EN ATTENTE"
                   : payout.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
