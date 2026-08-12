"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

// ─── Images ────────────────────────────────────────────────────────────────────

const HERO_PHOTO =
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&q=90&auto=format&fit=crop";

const CATEGORIES = [
  {
    id: "musique",
    label: "Musique",
    count: 128,
    emoji: "🎵",
    img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=700&q=80&auto=format&fit=crop",
  },
  {
    id: "art",
    label: "Art & Culture",
    count: 95,
    emoji: "🎨",
    img: "https://images.unsplash.com/photo-1460661419201-fd4becdf8a8b?w=700&q=80&auto=format&fit=crop",
  },
  {
    id: "cuisine",
    label: "Cuisine",
    count: 76,
    emoji: "🍳",
    img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=700&q=80&auto=format&fit=crop",
  },
  {
    id: "aventure",
    label: "Aventure",
    count: 64,
    emoji: "⛰️",
    img: "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=700&q=80&auto=format&fit=crop",
  },
  {
    id: "bienetre",
    label: "Bien-être",
    count: 48,
    emoji: "🧘",
    img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=700&q=80&auto=format&fit=crop",
  },
  {
    id: "sport",
    label: "Sport",
    count: 55,
    emoji: "🏀",
    img: "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=700&q=80&auto=format&fit=crop",
  },
  {
    id: "danse",
    label: "Danse",
    count: 32,
    emoji: "💃",
    img: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=700&q=80&auto=format&fit=crop",
  },
  {
    id: "surf",
    label: "Surf",
    count: 18,
    emoji: "🏄",
    img: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=700&q=80&auto=format&fit=crop",
  },
];

const HOW_IT_WORKS = [
  {
    num: "01",
    title: "Choisissez votre passion",
    body: "Parcourez nos catégories et trouvez la session qui vous inspire. Musique, cuisine, sport, art — tout y est.",
  },
  {
    num: "02",
    title: "Réservez en 30 secondes",
    body: "Paiement sécurisé, confirmation immédiate. Dès 13€ pour une heure avec un expert qui vous ressemble.",
  },
  {
    num: "03",
    title: "Vivez l'expérience",
    body: "Session en petit groupe, en présentiel ou en visio. Apprenez, pratiquez, rencontrez des passionnés.",
  },
];

// ─── Global CSS ────────────────────────────────────────────────────────────────

const STYLES = `
  :root { color-scheme: dark; }
  html, body { background: #0a0a0a; color: #fff; }
  .ps-hide-scroll::-webkit-scrollbar { display: none; }
  .ps-hide-scroll { scrollbar-width: none; -ms-overflow-style: none; }
  .ps-flame-btn {
    background: linear-gradient(135deg, #FFB700, #FF7A00);
    color: #fff;
    font-weight: 700;
    border-radius: 50px;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    transition: opacity 0.18s, transform 0.18s;
    text-decoration: none;
  }
  .ps-flame-btn:hover { opacity: 0.88; transform: translateY(-1px); }
  @keyframes ps-fadeup {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

// ─── Navbar ────────────────────────────────────────────────────────────────────

function Navbar() {
  const NAV = ["Accueil", "Expériences", "Catégories", "À propos", "Blog"];
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between"
      style={{
        height: 68,
        padding: "0 2.5rem",
        background: "rgba(8,8,8,0.55)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
        <Image src="/logos/icon-flamme-blanc.svg" alt="" width={26} height={26} />
        <span style={{ fontFamily: "sans-serif", fontSize: "1.05rem", fontWeight: 700 }}>
          <span style={{ color: "#fff" }}>Passion</span>
          <span style={{ color: "#FF7A00" }}> Spark</span>
        </span>
      </Link>

      {/* Center nav */}
      <nav className="hidden md:flex items-center" style={{ gap: "2.25rem" }}>
        {NAV.map((label, i) => (
          <Link
            key={label}
            href={i === 0 ? "/" : `/explore`}
            style={{
              fontFamily: "sans-serif",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: i === 0 ? "#FF7A00" : "rgba(255,255,255,0.65)",
              textDecoration: "none",
              paddingBottom: i === 0 ? "3px" : "0",
              borderBottom: i === 0 ? "2px solid #FF7A00" : "none",
              transition: "color 0.15s",
            }}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Right */}
      <div className="flex items-center" style={{ gap: "1.25rem" }}>
        <button
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "rgba(255,255,255,0.65)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>
        <Link
          href="/sign-in"
          style={{
            background: "#FF7A00",
            color: "#fff",
            fontFamily: "sans-serif",
            fontSize: "0.875rem",
            fontWeight: 700,
            padding: "9px 22px",
            borderRadius: "50px",
            textDecoration: "none",
            transition: "opacity 0.15s",
          }}
        >
          Se connecter
        </Link>
      </div>
    </header>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        background: "#0a0a0a",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Background photo — right side */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "65%",
          overflow: "hidden",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_PHOTO}
          alt="Guitariste PassionSpark"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 20%",
            display: "block",
          }}
        />
      </div>

      {/* Gradient overlays */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to right, #0a0a0a 32%, rgba(10,10,10,0.82) 52%, rgba(10,10,10,0.15) 75%, transparent 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "220px",
          background: "linear-gradient(to top, #0a0a0a, transparent)",
        }}
      />
      {/* Top vignette */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "120px",
          background: "linear-gradient(to bottom, rgba(10,10,10,0.5), transparent)",
        }}
      />

      {/* Left content */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          padding: "100px 5vw 80px",
          maxWidth: 620,
        }}
      >
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "'Arial Black', 'Arial Bold', Impact, 'Haettenschweiler', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(3.2rem, 7.5vw, 6.5rem)",
            textTransform: "uppercase",
            color: "#fff",
            lineHeight: 0.9,
            letterSpacing: "-0.01em",
            marginBottom: "1.1rem",
          }}
        >
          ALLUME TA<br />PASSION
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "sans-serif",
            fontSize: "1.1rem",
            fontWeight: 400,
            color: "rgba(255,255,255,0.6)",
            marginBottom: "2rem",
            letterSpacing: "0.01em",
          }}
        >
          Découvrez des expériences uniques
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href="/explore"
            className="ps-flame-btn"
            style={{ padding: "15px 30px", fontSize: "1rem" }}
          >
            Explorer maintenant
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginTop: "2.25rem" }}
        >
          {/* Avatar stack */}
          <div style={{ display: "flex", marginRight: "2px" }}>
            {[
              { bg: "#FF7A00", letter: "M" },
              { bg: "#34d399", letter: "S" },
              { bg: "#a78bfa", letter: "L" },
            ].map(({ bg, letter }, i) => (
              <div
                key={i}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: bg,
                  border: "2px solid #0a0a0a",
                  marginLeft: i > 0 ? -10 : 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontFamily: "sans-serif",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  zIndex: 3 - i,
                  position: "relative",
                }}
              >
                {letter}
              </div>
            ))}
          </div>
          <p
            style={{
              fontFamily: "sans-serif",
              fontSize: "0.8rem",
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.55,
            }}
          >
            Rejoignez des milliers de passionnés<br />
            et vivez des moments inoubliables.
          </p>
        </motion.div>

        {/* Slide dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "2rem" }}
        >
          {[1, 0, 0].map((active, i) => (
            <div
              key={i}
              style={{
                width: active ? 26 : 8,
                height: 8,
                borderRadius: 99,
                background: active ? "#FF7A00" : "rgba(255,255,255,0.2)",
                transition: "all 0.3s",
              }}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Categories ────────────────────────────────────────────────────────────────

function CategoriesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "right" ? 290 : -290, behavior: "smooth" });
  };

  return (
    <section style={{ background: "#0a0a0a", paddingBottom: "5rem" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          padding: "4rem 5vw 2rem",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "sans-serif",
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "#FF7A00",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: "0.6rem",
            }}
          >
            Catégories
          </p>
          <h2
            style={{
              fontFamily: "'Arial Black', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
              color: "#fff",
              lineHeight: 1,
            }}
          >
            Explorez vos passions
          </h2>
        </div>

        {/* Arrow buttons */}
        <div className="hidden md:flex" style={{ gap: "0.75rem" }}>
          {(["left", "right"] as const).map((dir) => (
            <button
              key={dir}
              onClick={() => scroll(dir)}
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: "#FF7A00",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.opacity = "0.8")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.opacity = "1")}
            >
              <svg width="16" height="16" fill="none" stroke="#000" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d={dir === "left" ? "M19 12H5M12 19l-7-7 7-7" : "M5 12h14M12 5l7 7-7 7"} />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        className="ps-hide-scroll"
        style={{
          display: "flex",
          gap: "1rem",
          paddingLeft: "5vw",
          paddingRight: "5vw",
          overflowX: "auto",
          paddingBottom: "0.5rem",
        }}
      >
        {CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            whileHover={{ y: -5 }}
            style={{
              position: "relative",
              flexShrink: 0,
              width: 248,
              height: 320,
              borderRadius: 14,
              overflow: "hidden",
              cursor: "pointer",
              background: "#111",
            }}
          >
            {/* Photo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cat.img}
              alt={cat.label}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.5s ease",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1.06)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1)")}
            />

            {/* Gradient */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)",
              }}
            />

            {/* Bottom content */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "1rem 1rem 1.1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              {/* Icon badge */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "#FF7A00",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                  flexShrink: 0,
                  boxShadow: "0 4px 16px rgba(255,122,0,0.4)",
                }}
              >
                {cat.emoji}
              </div>

              <div>
                <p
                  style={{
                    fontFamily: "sans-serif",
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "#fff",
                    lineHeight: 1.2,
                    marginBottom: 2,
                  }}
                >
                  {cat.label}
                </p>
                <p
                  style={{
                    fontFamily: "sans-serif",
                    fontSize: "0.78rem",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  {cat.count} expériences
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── How it works ──────────────────────────────────────────────────────────────

function HowItWorksSection() {
  return (
    <section
      style={{
        background: "#0d0d0d",
        padding: "5rem 5vw",
        borderTop: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p
          style={{
            fontFamily: "sans-serif",
            fontSize: "0.72rem",
            fontWeight: 700,
            color: "#FF7A00",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: "0.6rem",
            textAlign: "center",
          }}
        >
          Comment ça marche
        </p>
        <h2
          style={{
            fontFamily: "'Arial Black', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
            color: "#fff",
            lineHeight: 1,
            textAlign: "center",
            marginBottom: "3.5rem",
          }}
        >
          Simple. Rapide.{" "}
          <span
            style={{
              background: "linear-gradient(135deg,#FFB700,#FF7A00)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Passionnant.
          </span>
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {HOW_IT_WORKS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              style={{
                background: "#111",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 12,
                padding: "2rem",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  fontFamily: "'Arial Black', sans-serif",
                  fontSize: "4rem",
                  fontWeight: 900,
                  background: "linear-gradient(135deg,#FFB700,#FF7A00)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  opacity: 0.35,
                  lineHeight: 1,
                  display: "block",
                  marginBottom: "1rem",
                }}
              >
                {step.num}
              </span>
              <h3
                style={{
                  fontFamily: "sans-serif",
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "#fff",
                  marginBottom: "0.65rem",
                  letterSpacing: "0.02em",
                }}
              >
                {step.title}
              </h3>
              <p
                style={{
                  fontFamily: "sans-serif",
                  fontSize: "0.875rem",
                  color: "rgba(255,255,255,0.45)",
                  lineHeight: 1.65,
                }}
              >
                {step.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Creators ─────────────────────────────────────────────────────────────────

function CreatorsSection() {
  const STATS = [
    { val: "70%", label: "Reversés au créateur", sub: "Sur chaque session facturée" },
    { val: "13€", label: "Prix plancher / participant", sub: "Accessible à tous, juste pour toi" },
    { val: "1h",  label: "Format ultra-court", sub: "Une compétence, une heure, un impact" },
  ];

  return (
    <section
      style={{
        background: "#0a0a0a",
        padding: "5rem 5vw",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Orange glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "50vw",
          height: "50vw",
          maxWidth: 500,
          maxHeight: 500,
          borderRadius: "50%",
          background: "#FF7A00",
          opacity: 0.06,
          filter: "blur(100px)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "3.5rem",
          }}
        >
          <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.08)" }} />
          <p
            style={{
              fontFamily: "sans-serif",
              fontSize: "0.7rem",
              fontWeight: 700,
              color: "#FF7A00",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            Pour les créateurs
          </p>
          <div style={{ height: 1, flex: 1, background: "rgba(255,255,255,0.08)" }} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "3rem",
            alignItems: "center",
          }}
        >
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2
              style={{
                fontFamily: "'Arial Black', sans-serif",
                fontWeight: 900,
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                color: "#fff",
                lineHeight: 0.92,
                textTransform: "uppercase",
                marginBottom: "1.25rem",
              }}
            >
              VIS DE<br />
              <span
                style={{
                  background: "linear-gradient(135deg,#FFB700,#FF7A00,#FF3D00)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                TA PASSION.
              </span>
            </h2>
            <p
              style={{
                fontFamily: "sans-serif",
                fontSize: "0.95rem",
                color: "rgba(255,255,255,0.45)",
                lineHeight: 1.7,
                maxWidth: 380,
                marginBottom: "2rem",
              }}
            >
              Tu maîtrises une compétence que les autres veulent apprendre ?
              Propose une session d'1h à 10–20 personnes. Pas de plateforme à gérer,
              pas d'admin — juste ton expertise.
            </p>
            <Link href="/onboarding" className="ps-flame-btn" style={{ padding: "14px 28px", fontSize: "0.9rem" }}>
              Devenir créateur
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>

          {/* Right — stats */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ display: "flex", flexDirection: "column", gap: 1 }}
          >
            {STATS.map(({ val, label, sub }) => (
              <div
                key={val}
                style={{
                  background: "#111",
                  padding: "1.5rem 1.75rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1.25rem",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Arial Black', sans-serif",
                    fontSize: "2.75rem",
                    fontWeight: 900,
                    background: "linear-gradient(135deg,#FFB700,#FF7A00)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    lineHeight: 1,
                    minWidth: 90,
                    flexShrink: 0,
                  }}
                >
                  {val}
                </span>
                <div>
                  <p
                    style={{
                      fontFamily: "sans-serif",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      color: "#fff",
                      marginBottom: 4,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {label}
                  </p>
                  <p style={{ fontFamily: "sans-serif", fontSize: "0.75rem", color: "rgba(255,255,255,0.35)" }}>
                    {sub}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA final ────────────────────────────────────────────────────────────────

function CTASection() {
  return (
    <section
      style={{
        background: "#0a0a0a",
        borderTop: "1px solid rgba(255,122,0,0.15)",
        padding: "6rem 5vw",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: "70vw",
          height: "70vw",
          maxWidth: 700,
          borderRadius: "50%",
          background: "#FF7A00",
          opacity: 0.05,
          filter: "blur(120px)",
        }}
      />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p
            style={{
              fontFamily: "sans-serif",
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: "1.5rem",
            }}
          >
            Prêt à commencer ?
          </p>
          <h2
            style={{
              fontFamily: "'Arial Black', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(2.5rem, 7vw, 6rem)",
              color: "#fff",
              lineHeight: 0.9,
              textTransform: "uppercase",
              marginBottom: "0.3rem",
            }}
          >
            SPARK
          </h2>
          <h2
            style={{
              fontFamily: "'Arial Black', sans-serif",
              fontWeight: 900,
              fontSize: "clamp(2.5rem, 7vw, 6rem)",
              lineHeight: 0.9,
              textTransform: "uppercase",
              marginBottom: "2.5rem",
              background: "linear-gradient(135deg,#FFB700,#FF7A00,#FF3D00)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            YOUR PASSION.
          </h2>
          <p
            style={{
              fontFamily: "sans-serif",
              fontSize: "1rem",
              color: "rgba(255,255,255,0.4)",
              lineHeight: 1.65,
              marginBottom: "2.5rem",
              maxWidth: 480,
              margin: "0 auto 2.5rem",
            }}
          >
            Des créateurs passionnés vous attendent. Une heure suffit pour changer votre vision.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/explore"
              className="ps-flame-btn"
              style={{ padding: "16px 36px", fontSize: "1rem" }}
            >
              Explorer les sessions
            </Link>
            <Link
              href="/sign-up"
              style={{
                fontFamily: "sans-serif",
                fontSize: "0.875rem",
                color: "rgba(255,255,255,0.4)",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                padding: "16px 0",
                transition: "color 0.15s",
              }}
            >
              Créer un compte gratuit →
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer
      style={{
        background: "#080808",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "1.75rem 5vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Image src="/logos/icon-flamme-blanc.svg" alt="" width={18} height={18} style={{ opacity: 0.5 }} />
        <span
          style={{
            fontFamily: "sans-serif",
            fontSize: "0.78rem",
            color: "rgba(255,255,255,0.25)",
            letterSpacing: "0.1em",
          }}
        >
          © 2025 PASSIONSPARK
        </span>
      </div>
      <div style={{ display: "flex", gap: "2rem" }}>
        {[
          { label: "CGU", href: "/legal/cgu" },
          { label: "Contact", href: "/legal/contact" },
          { label: "Créateurs", href: "/onboarding" },
        ].map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            style={{
              fontFamily: "sans-serif",
              fontSize: "0.78rem",
              color: "rgba(255,255,255,0.25)",
              textDecoration: "none",
              letterSpacing: "0.08em",
              transition: "color 0.15s",
            }}
          >
            {label}
          </Link>
        ))}
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <style>{STYLES}</style>
      <div style={{ background: "#0a0a0a", minHeight: "100vh", overflowX: "hidden" }}>
        <Navbar />
        <HeroSection />
        <CategoriesSection />
        <HowItWorksSection />
        <CreatorsSection />
        <CTASection />
        <Footer />
      </div>
    </>
  );
}
