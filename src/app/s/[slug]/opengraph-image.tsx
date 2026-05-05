import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils/format-price";

export const runtime = "nodejs";
export const revalidate = 3600; // 1h

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: { slug: string };
}

export default async function OgImage({ params }: Props) {
  const session = await db.session.findUnique({
    where:   { slug: params.slug },
    include: { coach: { include: { user: true } } },
  });

  if (!session) {
    return new ImageResponse(
      <div style={{ width: 1200, height: 630, background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#FF7A00", fontSize: 48, fontWeight: 900 }}>PASSION SPARK</span>
      </div>,
      { ...size },
    );
  }

  const isDiscovery = session.sessionType === "discovery";
  const badgeColor  = isDiscovery ? "#10b981" : "#3b82f6";
  const badgeLabel  = isDiscovery ? "DÉCOUVERTE" : "PROGRESSION";
  const spotsLeft   = session.maxSpots - session.spotsTaken;
  const urgency     = spotsLeft <= 3 && spotsLeft > 0;

  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        background: "#1a1a1a",
        display: "flex",
        flexDirection: "column",
        padding: "60px 80px",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      {/* Accent orange top */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "#FF7A00" }} />

      {/* Header — logo + badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
        <span style={{ color: "#FF7A00", fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em", textTransform: "uppercase" }}>
          PASSION SPARK
        </span>
        <span style={{
          background: badgeColor + "26",
          color: badgeColor,
          fontSize: 14,
          fontWeight: 700,
          padding: "6px 14px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}>
          {badgeLabel}
        </span>
      </div>

      {/* Titre */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
        <div style={{
          color: "#ffffff",
          fontSize: session.title.length > 40 ? 56 : 72,
          fontWeight: 900,
          lineHeight: 0.92,
          textTransform: "uppercase",
          letterSpacing: "-0.02em",
        }}>
          {session.title}
        </div>
        {session.tagline && (
          <div style={{ color: "#888", fontSize: 24, fontWeight: 400, lineHeight: 1.4 }}>
            {session.tagline}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 40 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ color: "#555", fontSize: 14, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Coach
          </span>
          <span style={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>
            {session.coach.user.name}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {urgency && (
            <span style={{ color: "#FF3D00", fontSize: 16, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {spotsLeft} PLACE{spotsLeft > 1 ? "S" : ""} RESTANTE{spotsLeft > 1 ? "S" : ""}
            </span>
          )}
          {!urgency && spotsLeft > 0 && (
            <span style={{ color: "#555", fontSize: 16, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {spotsLeft}/{session.maxSpots} PLACES
            </span>
          )}
          <span style={{ color: "#FF7A00", fontSize: 52, fontWeight: 900, letterSpacing: "-0.02em" }}>
            {formatPrice(session.priceCents)}
          </span>
        </div>
      </div>

      {/* Accent orange bottom */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: "#FF7A00" }} />
    </div>,
    { ...size },
  );
}
