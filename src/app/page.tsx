"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import AnimatedShaderHero, { useShaderBackground } from "@/components/ui/animated-shader-hero";
import { ActionSearchBar } from "@/components/ui/action-search-bar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslation } from "@/i18n/useTranslation";
import { DOMAIN_IDS, type DomainId } from "@/i18n/translations";
import { SplineSection } from "@/components/ui/spline-section";

// ─── Global styles ────────────────────────────────────────────────────────────

const GLOBAL_STYLES = `
  @keyframes marquee-fwd {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes marquee-rev {
    from { transform: translateX(-50%); }
    to   { transform: translateX(0); }
  }
  .marquee-fwd { animation: marquee-fwd 30s linear infinite; }
  .marquee-rev { animation: marquee-rev 38s linear infinite; }
  .marquee-wrap:hover .marquee-fwd,
  .marquee-wrap:hover .marquee-rev { animation-play-state: paused; }
  .flame-gradient {
    background: linear-gradient(135deg, #FFB700, #FF7A00, #FF3D00);
  }
  .flame-text {
    background: linear-gradient(135deg, #FFB700, #FF7A00, #FF3D00);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  @media (prefers-reduced-motion: reduce) {
    .marquee-fwd, .marquee-rev { animation: none !important; }
  }
`;

// ─── Static data ──────────────────────────────────────────────────────────────

const DOMAIN_ICON_FILES: Record<DomainId, { color: string; blanc: string }> = {
  sport:    { color: "/logos/icon-orange.svg",  blanc: "/logos/icon-orange-bi.svg"  },
  music:    { color: "/logos/icon-bleu.svg",    blanc: "/logos/icon-bleu-bi.svg"    },
  cuisine:  { color: "/logos/icon-jaune.svg",   blanc: "/logos/icon-jaune-bi.svg"   },
  art:      { color: "/logos/icon-rouge.svg",   blanc: "/logos/icon-rouge-bi.svg"   },
  wellness: { color: "/logos/icon-or.svg",      blanc: "/logos/icon-or-bi.svg"      },
  tech:     { color: "/logos/icon-gris.svg",    blanc: "/logos/icon-gris-bi.svg"    },
};

const DOMAIN_COLORS: Record<DomainId, string> = {
  sport:    "#FF7A00",
  music:    "#34d399",
  cuisine:  "#FFB700",
  art:      "#f472b6",
  wellness: "#22d3ee",
  tech:     "#a78bfa",
};

const SELECTOR_ACTIONS = [
  { id: "music"    as DomainId, emoji: "🎸", descFr: "Créativité · Expression",  descEn: "Creativity · Expression" },
  { id: "art"      as DomainId, emoji: "🎨", descFr: "Vision · Liberté",         descEn: "Vision · Freedom" },
  { id: "cuisine"  as DomainId, emoji: "🍳", descFr: "Goût · Technique",         descEn: "Taste · Technique" },
  { id: "wellness" as DomainId, emoji: "🧘", descFr: "Calme · Énergie",          descEn: "Calm · Energy" },
  { id: "sport"    as DomainId, emoji: "🥊", descFr: "Intensité · Performance",  descEn: "Intensity · Performance" },
  { id: "tech"     as DomainId, emoji: "💻", descFr: "Logique · Impact",         descEn: "Logic · Impact" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function DomainFlame({ id }: { id: DomainId }) {
  const { color, blanc } = DOMAIN_ICON_FILES[id];
  return (
    <span className="relative inline-block w-14 h-14">
      <Image src={color} alt="" fill className="object-contain dark:hidden" />
      <Image src={blanc} alt="" fill className="object-contain hidden dark:block" />
    </span>
  );
}

// ─── AnimatedLogo ─────────────────────────────────────────────────────────────

function AnimatedLogo({ src, size = 36, className = "mb-8" }: { src: string; size?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      style={{ willChange: "transform" }}
      // Entrée spring
      initial={{ opacity: 0, scale: 0.4, rotate: -10 }}
      animate={{
        opacity: 1,
        scale:  [0.4, 1.15, 0.95, 1.05, 1],
        rotate: [-10, 6, -4, 2, 0],
      }}
      transition={{ duration: 0.9, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {/* Flicker continu après l'entrée */}
      <motion.div
        animate={{
          y:      [0, -5, -1, -7, -2, 0],
          rotate: [0, -2, 3, -3, 1, 0],
          scale:  [1, 1.05, 1.01, 1.08, 1.02, 1],
        }}
        transition={{
          duration: 3,
          repeat: 0,
          ease: "easeInOut",
          delay: 10,
        }}
      >
        <Image src={src} alt="PassionSpark" width={size} height={size} />
      </motion.div>
    </motion.div>
  );
}

// ─── PassionSelector — Étape 1 ────────────────────────────────────────────────

function PassionSelector({ onSelect }: { onSelect: (id: DomainId) => void }) {
  const canvasRef = useShaderBackground();
  const { t, tr, locale } = useTranslation();

  const actions = SELECTOR_ACTIONS.map((a) => ({
    id: a.id,
    label: tr.domains.items[a.id].label,
    icon: a.emoji,
    description: locale === "fr" ? a.descFr : a.descEn,
  }));

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-black">
      {/* WebGL shader canvas — fixed, toujours en fond */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full touch-none"
        style={{ background: "black", zIndex: 0 }}
      />
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50" style={{ zIndex: 1 }} />

      {/* Discrete top nav */}
      <div
        className="fixed top-0 left-0 right-0 flex items-center justify-end gap-6 px-6 h-14"
        style={{ zIndex: 3 }}
      >
        <Link
          href="/explore"
          className="font-display-md text-[11px] tracking-[0.15em] text-white/60 hover:text-white transition-colors"
        >
          {locale === "fr" ? "EXPLORER" : "EXPLORE"}
        </Link>
        <Link
          href="/sign-in"
          className="font-display-md text-[11px] tracking-[0.15em] text-white/60 hover:text-white transition-colors"
        >
          {locale === "fr" ? "CONNEXION" : "SIGN IN"}
        </Link>
      </div>

      {/* Content */}
      <motion.div
        className="relative flex flex-col items-center text-center px-6 w-full"
        style={{ zIndex: 2 }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Logo animé */}
        <AnimatedLogo src="/logos/icon-blanc.svg" size={40} />

        {/* Title */}
        <h1
          className="text-white text-center mb-4 font-display leading-tight"
          style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
        >
          {t("selector.title")}
        </h1>

        {/* Subtitle */}
        <p className="text-white/60 text-sm text-center mb-8">
          {t("selector.subtitle")}
        </p>

        {/* Search + domain tiles */}
        <div className="w-full max-w-sm sm:max-w-2xl">
          <ActionSearchBar
            placeholder={t("selector.placeholder")}
            actions={actions}
            onSelect={(action) => onSelect(action.id as DomainId)}
          />
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 w-full max-w-sm sm:max-w-md">
          <Link
            href="/explore"
            className="w-full sm:flex-1 text-center font-display-md text-[11px] tracking-[0.2em] px-6 py-3.5 text-black transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #FFB700, #FF7A00, #FF3D00)" }}
          >
            {locale === "fr" ? "EXPLORER LES SESSIONS" : "EXPLORE SESSIONS"}
          </Link>
          <Link
            href="/onboarding"
            className="w-full sm:flex-1 text-center font-display-md text-[11px] tracking-[0.2em] px-6 py-3.5 border border-white/25 text-white hover:border-white/50 hover:bg-white/5 transition-colors"
          >
            {locale === "fr" ? "DEVENIR CRÉATEUR" : "BECOME A CREATOR"}
          </Link>
        </div>

        {/* Language + Theme */}
        <div className="flex items-center gap-3 mt-8 opacity-60 hover:opacity-100 transition-opacity">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </motion.div>
    </div>
  );
}

// ─── SiteV2 — Étape 2 ────────────────────────────────────────────────────

function SiteV2({
  domain,
  onReset,
}: {
  domain: DomainId;
  onReset: () => void;
}) {
  const { t, tr } = useTranslation();

  const initialIdx = DOMAIN_IDS.indexOf(domain);
  const [activeDomain, setActiveDomain] = useState(initialIdx >= 0 ? initialIdx : 0);
  const [prevDomain, setPrevDomain] = useState(initialIdx >= 0 ? initialIdx : 0);

  const handleDomain = (i: number) => {
    setPrevDomain(activeDomain);
    setActiveDomain(i);
  };

  const direction = activeDomain > prevDomain ? 1 : -1;
  const activeDomainId = DOMAIN_IDS[activeDomain];
  const domainItems = tr.domains.items;
  const currentEmoji = SELECTOR_ACTIONS.find((a) => a.id === domain)?.emoji ?? "✦";

  return (
    <div className="text-[#0a0a0a] dark:text-white overflow-x-hidden" style={{ position: "relative", zIndex: 1 }}>

      {/* ══════════════════════════════════════════════
          HEADER — sticky
      ══════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 h-14 bg-black/60 backdrop-blur-md border-b border-white/10" style={{ zIndex: 50 }}>

        {/* Left: Logo + Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <AnimatedLogo src="/logos/icon-flamme-blanc.svg" size={20} className="" />
          <span className="font-display-md text-[10px] tracking-[0.2em] text-white">
            PASSIONSPARK
          </span>
        </Link>

        {/* Center: Nav links (desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/explore" className="font-display-md text-[10px] tracking-[0.15em] text-white/60 hover:text-white transition-colors">
            {t("nav.explore")}
          </Link>
          <Link href="/onboarding" className="font-display-md text-[10px] tracking-[0.15em] text-white/60 hover:text-white transition-colors">
            {t("nav.become_coach")}
          </Link>
        </nav>

        {/* Right: Domain badge + Language + Theme + Sign in */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 border border-[#FF7A00]/50 text-[#FF7A00] px-3 py-1 text-xs font-display-md tracking-[0.1em] hover:bg-[#FF7A00]/10 transition-colors"
            title="Changer de domaine"
          >
            <span>{currentEmoji}</span>
            <span className="hidden sm:inline">CHANGER</span>
          </button>
          <LanguageSwitcher />
          <ThemeToggle />
          <Link
            href="/sign-in"
            className="hidden md:block font-display-md text-[10px] tracking-[0.15em] border border-white/20 text-white px-4 py-2 hover:border-[#FF7A00]/50 hover:text-[#FF7A00] transition-colors ml-1"
          >
            {t("nav.sign_in")}
          </Link>
        </div>
      </header>

      {/* ══════════════════════════════════════════════
          HERO — Shader + Titre domaine + CTA
      ══════════════════════════════════════════════ */}
      <AnimatedShaderHero
        trustBadge={{ text: t("hero.badge") }}
        headline={{
          line1: domainItems[domain].headline.split("\n")[0],
          line2: domainItems[domain].headline.split("\n").slice(1).join(" "),
        }}
        subtitle={t("hero.tagline_1") + " " + t("hero.tagline_2")}
        buttons={{
          primary: { text: t("hero.cta_primary"), onClick: () => window.location.href = "/explore" },
          secondary: { text: t("hero.cta_secondary"), onClick: () => window.location.href = "/onboarding" },
        }}
      />

      {/* ══════════════════════════════════════════════
          SPLINE — 3D interactif
      ══════════════════════════════════════════════ */}
      <SplineSection />

      {/* ══════════════════════════════════════════════
          1. CONCEPT — Editorial Magazine Layout
      ══════════════════════════════════════════════ */}
      <section className="py-24 sm:py-36 px-6 max-w-6xl mx-auto bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-sm">

        <FadeUp className="mb-16">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-[#E5E5E5] dark:bg-[#2a2a2a]" />
            <span className="font-display-md text-[10px] tracking-[0.3em] text-[#888888] dark:text-[#555555]">
              {t("concept.label")}
            </span>
            <div className="h-px flex-1 bg-[#E5E5E5] dark:bg-[#2a2a2a]" />
          </div>
        </FadeUp>

        {tr.concept.items.map(({ num, title, body, aside }, i) => (
          <FadeUp key={num} delay={i * 0.1}>
            <div className={`flex flex-col ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-8 lg:gap-16 py-12 border-b border-[#E5E5E5] dark:border-[#1a1a1a] items-start`}>
              <div className="lg:w-1/2 space-y-4">
                <span className="font-display text-[80px] sm:text-[100px] leading-none flame-text opacity-30 block">
                  {num}
                </span>
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#0a0a0a] dark:text-white leading-tight whitespace-pre-line">
                  {title}
                </h2>
              </div>
              <div className="lg:w-1/2 flex flex-col justify-center gap-6 pt-4">
                <p className="text-[#444444] dark:text-[#aaaaaa] text-base sm:text-lg font-sans leading-relaxed">
                  {body}
                </p>
                <div className="border-l-2 border-[#FF7A00] pl-4">
                  <p className="text-[#888888] dark:text-[#666666] text-sm font-sans italic">{aside}</p>
                </div>
              </div>
            </div>
          </FadeUp>
        ))}
      </section>

      {/* ══════════════════════════════════════════════
          2. DOMAINES — Animated Tabs
      ══════════════════════════════════════════════ */}
      <section className="py-24 sm:py-36 bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-sm relative overflow-hidden">

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="font-display text-[20vw] text-[#0a0a0a]/[0.04] dark:text-white/[0.03] leading-none">
            {domainItems[activeDomainId].label.toUpperCase()}
          </span>
        </div>

        <div className="relative z-10 px-6 max-w-6xl mx-auto">

          <FadeUp className="mb-12">
            <p className="font-display-md text-[10px] tracking-[0.3em] text-[#888888] dark:text-[#555555] mb-4">
              {t("domains.label")}
            </p>
            <h2 className="font-display text-4xl sm:text-6xl text-[#0a0a0a] dark:text-white">
              {t("domains.title")}<br />
              <span className="flame-text">{t("domains.title_hl")}</span>
            </h2>
          </FadeUp>

          {/* Tab bar */}
          <FadeUp delay={0.1} className="mb-12">
            <div className="flex flex-wrap gap-2 relative">
              {DOMAIN_IDS.map((id, i) => (
                <button
                  key={id}
                  onClick={() => handleDomain(i)}
                  className="relative font-display-md text-[11px] tracking-[0.2em] px-5 py-3 transition-colors duration-200 text-[#444444] dark:text-[#666666]"
                  style={{ color: activeDomain === i ? "#FF7A00" : undefined }}
                >
                  {domainItems[id].label.toUpperCase()}
                  {activeDomain === i && (
                    <motion.div
                      layoutId="domain-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF7A00]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
            <div className="h-px bg-[#E5E5E5] dark:bg-[#2a2a2a]" />
          </FadeUp>

          {/* Domain content */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeDomain}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="grid lg:grid-cols-2 gap-10 items-center min-h-[280px]"
            >
              {/* Left: Icon + Headline */}
              <div className="flex items-start gap-6">
                <div className="mt-1 shrink-0">
                  <DomainFlame id={activeDomainId} />
                </div>
                <h3 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#0a0a0a] dark:text-white leading-[0.9] whitespace-pre-line">
                  {domainItems[activeDomainId].headline}
                </h3>
              </div>

              {/* Right: Body + Stat + CTA */}
              <div className="space-y-6">
                <p className="text-[#444444] dark:text-[#aaaaaa] text-base sm:text-lg font-sans leading-relaxed">
                  {domainItems[activeDomainId].body}
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-px w-8 bg-[#FF7A00]" />
                  <span className="font-display-md text-[11px] tracking-[0.2em] text-[#FF7A00]">
                    {domainItems[activeDomainId].stat}
                  </span>
                </div>
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 font-display-md text-[11px] tracking-[0.2em] text-[#0a0a0a] dark:text-white border border-[#E5E5E5] dark:border-[#2a2a2a] px-6 py-3 hover:border-[#FF7A00]/50 hover:text-[#FF7A00] transition-colors"
                >
                  {t("domains.cta")}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          2b. COMMENT ÇA MARCHE — 3 étapes
      ══════════════════════════════════════════════ */}
      <section className="py-24 sm:py-36 px-6 max-w-6xl mx-auto bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-sm">

        <FadeUp className="mb-16 text-center">
          <p className="font-display-md text-[10px] tracking-[0.3em] text-[#888888] dark:text-[#555555] mb-4">
            {t("how_it_works.label")}
          </p>
          <h2 className="font-display text-4xl sm:text-6xl text-[#0a0a0a] dark:text-white">
            {t("how_it_works.title")}<br />
            <span className="flame-text">{t("how_it_works.title_hl")}</span>
          </h2>
        </FadeUp>

        <div className="grid sm:grid-cols-3 gap-8 sm:gap-6">
          {tr.how_it_works.steps.map((step, i) => (
            <FadeUp key={step.num} delay={i * 0.1}>
              <div className="h-full border border-[#E5E5E5] dark:border-[#1a1a1a] p-8 hover:border-[#FF7A00]/40 transition-colors">
                <span className="font-display text-5xl flame-text block mb-4">{step.num}</span>
                <h3 className="font-display-md text-sm tracking-[0.15em] text-[#0a0a0a] dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-[#444444] dark:text-[#aaaaaa] text-sm font-sans leading-relaxed">
                  {step.body}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          3. SOCIAL PROOF — Dual Marquee
      ══════════════════════════════════════════════ */}
      <section className="py-24 sm:py-36 overflow-hidden bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-sm">

        <FadeUp className="px-6 mb-12 text-center">
          <p className="font-display-md text-[10px] tracking-[0.3em] text-[#888888] dark:text-[#555555] mb-3">
            {t("social.label")}
          </p>
          <h2 className="font-display text-4xl sm:text-6xl text-[#0a0a0a] dark:text-white">
            {t("social.title")}<br />
            <span className="flame-text">{t("social.title_hl")}</span>
          </h2>
        </FadeUp>

        <div className="space-y-4 marquee-wrap">
          <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="marquee-fwd flex gap-4 shrink-0">
              {[...tr.social.testimonials, ...tr.social.testimonials].map((item, i) => (
                <TestimonialCard
                  key={i}
                  quote={item.quote}
                  name={item.name}
                  domainId={item.domainId as DomainId}
                  domainLabel={domainItems[item.domainId as DomainId].label}
                />
              ))}
            </div>
          </div>
          <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="marquee-rev flex gap-4 shrink-0">
              {[...tr.social.testimonials.slice(5), ...tr.social.testimonials, ...tr.social.testimonials.slice(0, 5)].map((item, i) => (
                <TestimonialCard
                  key={i}
                  quote={item.quote}
                  name={item.name}
                  domainId={item.domainId as DomainId}
                  domainLabel={domainItems[item.domainId as DomainId].label}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          4. CRÉATEURS
      ══════════════════════════════════════════════ */}
      <section className="py-24 sm:py-36 bg-[#0a0a0a]/97 backdrop-blur-sm relative overflow-hidden">

        {/* Glow ambiance */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[60vw] h-[60vw] max-w-[600px] rounded-full opacity-10 blur-[120px] bg-[#FF7A00]" />
        </div>

        <div className="relative z-10 px-6 max-w-6xl mx-auto">

          <FadeUp className="mb-16">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="font-display-md text-[10px] tracking-[0.3em] text-[#FF7A00]">POUR LES CRÉATEURS</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
          </FadeUp>

          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left — headline */}
            <FadeUp>
              <h2 className="font-display text-4xl sm:text-6xl text-white leading-[0.88] mb-6">
                VIS DE<br />
                <span className="flame-text">TA PASSION.</span>
              </h2>
              <p className="text-white/50 font-sans text-base sm:text-lg leading-relaxed max-w-md">
                Tu maîtrises une compétence que les autres veulent apprendre ? Propose une session d'1h à 10-20 personnes. Pas de plateforme à gérer, pas d'admin — juste ton expertise.
              </p>
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 mt-8 font-display-md text-[11px] tracking-[0.2em] text-black px-8 py-4 flame-gradient hover:opacity-90 transition-opacity"
              >
                DEVENIR CRÉATEUR
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </FadeUp>

            {/* Right — 3 stats */}
            <FadeUp delay={0.15}>
              <div className="grid grid-cols-1 gap-px bg-white/10">
                {[
                  { pct: "70%", label: "reversés au créateur", sub: "Sur chaque session facturée" },
                  { pct: "7%",  label: "de commission parrainage", sub: "Si tu amènes toi-même tes participants" },
                  { pct: "13€", label: "prix plancher par participant", sub: "Accessible · Juste · Pour tout le monde" },
                ].map(({ pct, label, sub }) => (
                  <div key={pct} className="bg-[#0f0f0f] px-8 py-7 flex items-center gap-6 hover:bg-[#141414] transition-colors group">
                    <span
                      className="font-display text-5xl shrink-0 flame-text"
                    >
                      {pct}
                    </span>
                    <div>
                      <div className="text-white font-display-md text-[12px] tracking-[0.15em] mb-1 group-hover:text-[#FF7A00] transition-colors">
                        {label.toUpperCase()}
                      </div>
                      <div className="text-white/40 font-sans text-xs">{sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          5. CTA FINAL
      ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="h-px w-full flame-gradient opacity-40" />
        <div className="bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-sm py-28 sm:py-40 px-6 relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full opacity-[0.08] dark:opacity-[0.05] blur-[100px] bg-[#FF7A00]" />
          </div>
          <FadeUp className="relative z-10 max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="font-display-md text-[10px] tracking-[0.3em] text-[#888888] dark:text-[#555555] mb-8">
                {t("cta_section.label")}
              </p>
              <h2 className="font-display text-[clamp(40px,9vw,110px)] leading-[0.88] text-[#0a0a0a] dark:text-white mb-2">
                {t("cta_section.title")}
              </h2>
              <h2 className="font-display text-[clamp(40px,9vw,110px)] leading-[0.88] flame-text mb-12">
                {t("cta_section.title_hl")}
              </h2>
              <p className="text-[#888888] dark:text-[#555555] font-sans text-base sm:text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                {t("cta_section.body")}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/explore"
                  className="flame-gradient text-black font-display-md text-[12px] tracking-[0.25em] px-10 py-5 hover:opacity-90 transition-opacity text-center"
                >
                  {t("cta_section.cta_primary")}
                </Link>
                <Link
                  href="/sign-up"
                  className="text-[#888888] dark:text-[#555555] hover:text-[#0a0a0a] dark:hover:text-white font-display-md text-[11px] tracking-[0.2em] transition-colors"
                >
                  {t("cta_section.cta_secondary")}
                </Link>
              </div>
            </motion.div>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-[#FF7A00]"
                style={{ left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 25}%` }}
                animate={{ y: [-10, -30, -10], opacity: [0, 0.6, 0], scale: [0.5, 1, 0.5] }}
                transition={{ duration: 2.5 + i * 0.5, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
              />
            ))}
          </FadeUp>
        </div>
        <div className="h-px w-full flame-gradient opacity-20" />
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════ */}
      <footer className="py-8 px-6 flex items-center justify-between border-t border-white/10 bg-black/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Image src="/logos/icon-flamme.svg" alt="PassionSpark" width={20} height={20} className="opacity-50 dark:hidden" />
          <Image src="/logos/icon-flamme-blanc.svg" alt="PassionSpark" width={20} height={20} className="opacity-60 hidden dark:block" />
          <span className="font-display-md text-[10px] tracking-[0.2em] text-[#888888] dark:text-[#444444]">
            {t("footer.brand")}
          </span>
        </div>
        <div className="flex gap-6">
          <Link href="/legal/cgu" className="font-display-md text-[10px] tracking-[0.15em] text-[#aaa] dark:text-[#333] hover:text-[#444] dark:hover:text-[#888] transition-colors">
            {t("footer.cgu")}
          </Link>
          <Link href="/legal/contact" className="font-display-md text-[10px] tracking-[0.15em] text-[#aaa] dark:text-[#333] hover:text-[#444] dark:hover:text-[#888] transition-colors">
            {t("footer.contact")}
          </Link>
          <Link href="/onboarding" className="font-display-md text-[10px] tracking-[0.15em] text-[#aaa] dark:text-[#333] hover:text-[#444] dark:hover:text-[#888] transition-colors">
            {t("footer.coaches")}
          </Link>
        </div>
      </footer>

    </div>
  );
}

// ─── TestimonialCard ──────────────────────────────────────────────────────────

function TestimonialCard({
  quote,
  name,
  domainId,
  domainLabel,
}: {
  quote: string;
  name: string;
  domainId: DomainId;
  domainLabel: string;
}) {
  const color = DOMAIN_COLORS[domainId] ?? "#FF7A00";
  return (
    <div className="shrink-0 w-[280px] sm:w-[340px] bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#1a1a1a] shadow-sm dark:shadow-none p-6 flex flex-col gap-4 hover:border-[#FF7A00]/30 dark:hover:border-[#FF7A00]/20 transition-colors">
      <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
        <path
          d="M0 14V8.4C0 5.6 0.8 3.467 2.4 2C4 0.533 6.133 0 8.8 0H9.6V2.8C8.133 2.8 6.933 3.267 6 4.2 5.067 5.133 4.6 6.4 4.6 8H8.8V14H0ZM11.2 14V8.4C11.2 5.6 12 3.467 13.6 2 15.2.533 17.333 0 20 0H20.8V2.8C19.333 2.8 18.133 3.267 17.2 4.2 16.267 5.133 15.8 6.4 15.8 8H20V14H11.2Z"
          fill={color}
          fillOpacity="0.4"
        />
      </svg>
      <p className="text-[#444444] dark:text-[#888888] text-sm font-sans leading-relaxed flex-1">"{quote}"</p>
      <div className="flex items-center justify-between">
        <span className="text-[#888888] dark:text-[#555555] text-xs font-sans">{name}</span>
        <span
          className="font-display-md text-[9px] tracking-[0.2em] px-2 py-0.5"
          style={{ color, background: `${color}15`, border: `1px solid ${color}30` }}
        >
          {domainLabel.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

// ─── Main — gestion des phases ────────────────────────────────────────────────

export default function V2Page() {
  const [phase, setPhase] = useState<"select" | "site">("select");
  const [domain, setDomain] = useState<DomainId | null>(null);

  // Lecture localStorage côté client uniquement
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ps_domain");
      if (saved && (DOMAIN_IDS as readonly string[]).includes(saved)) {
        setDomain(saved as DomainId);
        setPhase("site");
      }
    } catch {
      // localStorage indisponible
    }
  }, []);

  const selectDomain = (id: DomainId) => {
    try { localStorage.setItem("ps_domain", id); } catch {}
    setDomain(id);
    setPhase("site");
  };

  const resetDomain = () => {
    try { localStorage.removeItem("ps_domain"); } catch {}
    setDomain(null);
    setPhase("select");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <AnimatePresence mode="wait">
        {phase === "select" && (
          <motion.div
            key="select"
            exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.5 } }}
          >
            <PassionSelector onSelect={selectDomain} />
          </motion.div>
        )}
        {phase === "site" && domain && (
          <motion.div
            key="site"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.6 } }}
          >
            <SiteV2 domain={domain} onReset={resetDomain} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
