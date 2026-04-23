"use client";

import { useRef, useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useScroll,
  useTransform,
} from "framer-motion";
import Link from "next/link";
import Image from "next/image";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function useMouseGlow(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      el.style.setProperty("--my", `${e.clientY - rect.top}px`);
    };
    el.addEventListener("mousemove", move);
    return () => el.removeEventListener("mousemove", move);
  }, [ref]);
}

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

// ─── Data ─────────────────────────────────────────────────────────────────────

const DOMAINS = [
  {
    id: "sport",
    label: "Sport",
    headline: "UNE TECHNIQUE.\nUNE HEURE.\nUN DÉCLIC.",
    body: "Frappe, défense, endurance, placement — pas un entraînement générique. Une compétence précise transmise par quelqu'un qui la maîtrise vraiment.",
    stat: "10→20 personnes max",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M4.93 4.93 19.07 19.07" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /><path d="M2 12h20" />
      </svg>
    ),
  },
  {
    id: "music",
    label: "Musique",
    headline: "JOUE.\nN'APPRENDS\nPAS.",
    body: "Improvisation, rythme, accord parfait — découverts en pratiquant, pas en regardant un schéma. Le résultat s'entend dès la première session.",
    stat: "Sessions 60 ou 120 min",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    id: "cooking",
    label: "Cuisine",
    headline: "DU GESTE.\nPAS UNE\nRECETTE.",
    body: "Découpe, sauce, dressage — les techniques que les chefs refusent d'écrire. Apprises de la main à la main, entre passionnés.",
    stat: "Dès 13€ la session",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" /><line x1="6" x2="18" y1="17" y2="17" />
      </svg>
    ),
  },
  {
    id: "art",
    label: "Art",
    headline: "EXPRIME.\nNE REPRODUIS\nPAS.",
    body: "Composition, lumière, geste — l'art n'est pas une règle à suivre. C'est une intention à libérer. Un coach pour t'en donner la clé.",
    stat: "Tous niveaux acceptés",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
      </svg>
    ),
  },
  {
    id: "language",
    label: "Langues",
    headline: "PARLE.\nNE\nTRADUIS PAS.",
    body: "Accent, syntaxe, idiomes — l'heure qui déclenche le réflexe. Avec quelqu'un qui a vécu la langue, pas seulement appris.",
    stat: "Immersion garantie",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 8 6 6" /><path d="m4 14 6-6 2-3" /><path d="M2 5h12" /><path d="M7 2h1" /><path d="m22 22-5-10-5 10" /><path d="M14 18h6" />
      </svg>
    ),
  },
  {
    id: "business",
    label: "Business",
    headline: "AGIS.\nN'ÉCOUTE PAS\nUNE CONF.",
    body: "Pitch, négociation, vision — pas une conférence TED. Une session pratique avec quelqu'un qui a construit, vendu, et échoué avant toi.",
    stat: "ROI dès la 1ère session",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" />
      </svg>
    ),
  },
];

const TESTIMONIALS = [
  { quote: "En 1h avec Karim, j'ai plus progressé qu'en 6 mois de club.", name: "Lucas M.", domain: "Sport" },
  { quote: "Je faisais des pâtes al dente pour la première fois de ma vie.", name: "Inès B.", domain: "Cuisine" },
  { quote: "Mon accent anglais s'est transformé. Une seule session.", name: "Paul R.", domain: "Langues" },
  { quote: "Le pitch qui m'a permis de signer mon premier client le lendemain.", name: "Sofia K.", domain: "Business" },
  { quote: "Je savais pas que la guitare pouvait devenir simple aussi vite.", name: "Théo L.", domain: "Musique" },
  { quote: "Sara m'a transmis quelque chose que j'attendais depuis des années.", name: "Camille D.", domain: "Art" },
  { quote: "La précision de la session m'a bluffé — exactement ce qu'il me fallait.", name: "Maxime V.", domain: "Sport" },
  { quote: "Une heure intense, concentrée. J'ai tout appris sans m'en rendre compte.", name: "Léa P.", domain: "Musique" },
  { quote: "Le niveau de détail sur la découpe. Impressionnant.", name: "Antoine G.", domain: "Cuisine" },
  { quote: "Une session de négo simulée qui valait 10 livres de business.", name: "Rania S.", domain: "Business" },
];

const DOMAIN_COLORS: Record<string, string> = {
  Sport: "#FF7A00",
  Cuisine: "#FFB700",
  Langues: "#22d3ee",
  Business: "#a78bfa",
  Musique: "#34d399",
  Art: "#f472b6",
};

// ─── Main Component ────────────────────────────────────────────────────────────

export default function V2Page() {
  const heroRef = useRef<HTMLElement>(null);
  useMouseGlow(heroRef);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroY = useTransform(scrollY, [0, 400], [0, -80]);

  const [activeDomain, setActiveDomain] = useState(0);
  const [prevDomain, setPrevDomain] = useState(0);

  const handleDomain = (i: number) => {
    setPrevDomain(activeDomain);
    setActiveDomain(i);
  };

  const direction = activeDomain > prevDomain ? 1 : -1;

  return (
    <>
      {/* Global styles */}
      <style>{`
        @keyframes spotlight {
          0%   { opacity: 0; transform: translate(-72%, -62%) scale(0.5); }
          100% { opacity: 1; transform: translate(-50%, -40%) scale(1); }
        }
        @keyframes marquee-fwd {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes marquee-rev {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        @keyframes flame-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.05); }
        }
        .spotlight-svg {
          animation: spotlight 2s ease forwards;
          animation-delay: 0.2s;
        }
        .marquee-fwd { animation: marquee-fwd 30s linear infinite; }
        .marquee-rev { animation: marquee-rev 38s linear infinite; }
        .marquee-wrap:hover .marquee-fwd,
        .marquee-wrap:hover .marquee-rev { animation-play-state: paused; }
        .mouse-glow {
          background: radial-gradient(600px circle at var(--mx, 50%) var(--my, 50%),
            rgba(255, 122, 0, 0.07), transparent 60%);
        }
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
          .spotlight-svg, .marquee-fwd, .marquee-rev { animation: none !important; }
        }
      `}</style>

      <div className="bg-[#0a0a0a] text-white overflow-x-hidden">

        {/* ══════════════════════════════════════════════
            1. HERO
        ══════════════════════════════════════════════ */}
        <section
          ref={heroRef}
          className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden mouse-glow"
          style={{ "--mx": "50%", "--my": "50%" } as React.CSSProperties}
        >
          {/* Spotlight SVG */}
          <svg
            className="spotlight-svg pointer-events-none absolute z-[1] h-[169%] w-[138%] lg:w-[84%] opacity-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 3787 2842"
            fill="none"
          >
            <g filter="url(#sp-filter)">
              <ellipse
                cx="1924.71" cy="273.501" rx="1924.71" ry="273.501"
                transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
                fill="#FF7A00" fillOpacity="0.15"
              />
            </g>
            <defs>
              <filter id="sp-filter" x="0.86" y="0.84" width="3785.16" height="2840.26"
                filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feGaussianBlur stdDeviation="151" result="effect_blur" />
              </filter>
            </defs>
          </svg>

          {/* Grid background */}
          <div
            className="absolute inset-0 z-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />

          {/* Gradient orb */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.06] blur-[120px] bg-[#FF7A00] z-0 pointer-events-none" />

          {/* Content */}
          <motion.div
            style={{ opacity: heroOpacity, y: heroY }}
            className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl"
          >
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mb-8"
            >
              <Image src="/logos/icon-blanc.svg" alt="PassionSpark" width={48} height={48} />
            </motion.div>

            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.5em" }}
              animate={{ opacity: 1, letterSpacing: "0.25em" }}
              transition={{ duration: 1, delay: 0.3 }}
              className="font-display-md text-[11px] text-[#FF7A00] tracking-[0.25em] mb-6"
            >
              PASSIONSPARK
            </motion.p>

            {/* Main title — staggered words */}
            <div className="overflow-hidden mb-2">
              <motion.h1
                className="font-display text-[clamp(52px,12vw,140px)] leading-[0.88] text-white"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.12 } },
                }}
              >
                {["SPARK", "YOUR"].map((word, i) => (
                  <motion.span
                    key={i}
                    className="inline-block mr-[0.2em]"
                    variants={{
                      hidden: { y: "110%", opacity: 0 },
                      visible: { y: "0%", opacity: 1, transition: { duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] } },
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.h1>
            </div>
            <div className="overflow-hidden mb-8">
              <motion.h1
                className="font-display text-[clamp(52px,12vw,140px)] leading-[0.88] flame-text"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } },
                }}
              >
                {["NEXT", "PASSION."].map((word, i) => (
                  <motion.span
                    key={i}
                    className="inline-block mr-[0.2em]"
                    variants={{
                      hidden: { y: "110%", opacity: 0 },
                      visible: { y: "0%", opacity: 1, transition: { duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] } },
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.h1>
            </div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8 }}
              className="text-[#666] text-base sm:text-lg font-sans max-w-md leading-relaxed mb-10"
            >
              Un coach. Une compétence précise. Moins de 20€.
              <br />
              En groupe, en 1h, quelque part près de toi.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.0 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link
                href="/explore"
                className="flame-gradient text-black font-display-md text-[11px] tracking-[0.2em] px-8 py-4 hover:opacity-90 transition-opacity"
              >
                TROUVER MA SESSION
              </Link>
              <Link
                href="/onboarding"
                className="border border-[#2a2a2a] text-[#888] hover:text-white hover:border-[#FF7A00]/40 font-display-md text-[11px] tracking-[0.2em] px-8 py-4 transition-colors"
              >
                DEVENIR COACH →
              </Link>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
          >
            <span className="font-display-md text-[9px] tracking-[0.3em] text-[#333]">SCROLL</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-px h-8 bg-gradient-to-b from-[#FF7A00]/60 to-transparent"
            />
          </motion.div>
        </section>

        {/* ══════════════════════════════════════════════
            2. CONCEPT — Editorial Magazine Layout
        ══════════════════════════════════════════════ */}
        <section className="py-24 sm:py-36 px-6 max-w-6xl mx-auto">

          <FadeUp className="mb-16">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-[#1e1e1e]" />
              <span className="font-display-md text-[10px] tracking-[0.3em] text-[#333]">LE CONCEPT</span>
              <div className="h-px flex-1 bg-[#1e1e1e]" />
            </div>
          </FadeUp>

          {[
            {
              num: "01",
              title: "UNE SEULE\nCOMPÉTENCE",
              body: "Pas un cours généraliste. Pas un entraînement découverte. Une technique précise — tir à 3 points, sauté-beurre, accord de la Ré — choisie et maîtrisée par le coach qui te la transmet.",
              aside: "Fini les sessions où tu rentres chez toi sans savoir ce que tu as appris.",
            },
            {
              num: "02",
              title: "10 À 20\nPERSONNES",
              body: "Assez petit pour que le coach te voit. Assez grand pour créer l'énergie de groupe. Une dynamique impossible à reproduire seul ou en cours magistral.",
              aside: "L'intelligence collective au service de ta progression.",
            },
            {
              num: "03",
              title: "ENTRE 13€\nET 20€",
              body: "Le prix d'un cours particulier divisé par dix. Parce que la passion ne devrait pas être un luxe. Et parce que le coach mérite d'être payé correctement — 70% lui revient.",
              aside: "Accessible. Juste. Pour tout le monde.",
            },
          ].map(({ num, title, body, aside }, i) => (
            <FadeUp key={num} delay={i * 0.1}>
              <div className={`flex flex-col ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-8 lg:gap-16 py-12 border-b border-[#111] items-start`}>

                {/* Number + Title */}
                <div className="lg:w-1/2 space-y-4">
                  <span className="font-display text-[80px] sm:text-[100px] leading-none flame-text opacity-30 block">
                    {num}
                  </span>
                  <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white leading-tight whitespace-pre-line">
                    {title}
                  </h2>
                </div>

                {/* Body + Aside */}
                <div className="lg:w-1/2 flex flex-col justify-center gap-6 pt-4">
                  <p className="text-[#888] text-base sm:text-lg font-sans leading-relaxed">
                    {body}
                  </p>
                  <div className="border-l-2 border-[#FF7A00] pl-4">
                    <p className="text-[#555] text-sm font-sans italic">{aside}</p>
                  </div>
                </div>

              </div>
            </FadeUp>
          ))}
        </section>

        {/* ══════════════════════════════════════════════
            3. DOMAINES — Animated Tabs
        ══════════════════════════════════════════════ */}
        <section className="py-24 sm:py-36 bg-[#080808] relative overflow-hidden">

          {/* Background text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
            <span className="font-display text-[20vw] text-white/[0.015] leading-none">
              {DOMAINS[activeDomain].label.toUpperCase()}
            </span>
          </div>

          <div className="relative z-10 px-6 max-w-6xl mx-auto">

            <FadeUp className="mb-12">
              <p className="font-display-md text-[10px] tracking-[0.3em] text-[#333] mb-4">LES DOMAINES</p>
              <h2 className="font-display text-4xl sm:text-6xl text-white">
                TA PASSION<br />
                <span className="flame-text">EST ICI.</span>
              </h2>
            </FadeUp>

            {/* Tab bar */}
            <FadeUp delay={0.1} className="mb-12">
              <div className="flex flex-wrap gap-2 relative">
                {DOMAINS.map((d, i) => (
                  <button
                    key={d.id}
                    onClick={() => handleDomain(i)}
                    className="relative font-display-md text-[11px] tracking-[0.2em] px-5 py-3 transition-colors duration-200"
                    style={{ color: activeDomain === i ? "#FF7A00" : "#444" }}
                  >
                    {d.label.toUpperCase()}
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
              <div className="h-px bg-[#1a1a1a] -mt-0" />
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
                {/* Left: Headline */}
                <div className="flex items-start gap-6">
                  <div className="text-[#FF7A00] mt-1 shrink-0">
                    {DOMAINS[activeDomain].icon}
                  </div>
                  <h3 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-[0.9] whitespace-pre-line">
                    {DOMAINS[activeDomain].headline}
                  </h3>
                </div>

                {/* Right: Body + Stat + CTA */}
                <div className="space-y-6">
                  <p className="text-[#777] text-base sm:text-lg font-sans leading-relaxed">
                    {DOMAINS[activeDomain].body}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8 bg-[#FF7A00]" />
                    <span className="font-display-md text-[11px] tracking-[0.2em] text-[#FF7A00]">
                      {DOMAINS[activeDomain].stat.toUpperCase()}
                    </span>
                  </div>
                  <Link
                    href="/explore"
                    className="inline-flex items-center gap-2 font-display-md text-[11px] tracking-[0.2em] text-white border border-[#2a2a2a] px-6 py-3 hover:border-[#FF7A00]/50 hover:text-[#FF7A00] transition-colors"
                  >
                    VOIR LES SESSIONS
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
            4. SOCIAL PROOF — Dual Marquee
        ══════════════════════════════════════════════ */}
        <section className="py-24 sm:py-36 overflow-hidden">

          <FadeUp className="px-6 mb-12 text-center">
            <p className="font-display-md text-[10px] tracking-[0.3em] text-[#333] mb-3">ILS ONT SPARKÉ</p>
            <h2 className="font-display text-4xl sm:text-6xl text-white">
              DES MOTS<br />
              <span className="flame-text">VRAIS.</span>
            </h2>
          </FadeUp>

          <div className="space-y-4 marquee-wrap">

            {/* Row 1 — forward */}
            <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
              <div className="marquee-fwd flex gap-4 shrink-0">
                {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                  <TestimonialCard key={i} {...t} />
                ))}
              </div>
            </div>

            {/* Row 2 — reverse */}
            <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
              <div className="marquee-rev flex gap-4 shrink-0">
                {[...TESTIMONIALS.slice(5), ...TESTIMONIALS, ...TESTIMONIALS.slice(0, 5)].map((t, i) => (
                  <TestimonialCard key={i} {...t} />
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════════
            5. CTA FINAL — Full Impact
        ══════════════════════════════════════════════ */}
        <section className="relative overflow-hidden">

          {/* Top border gradient */}
          <div className="h-px w-full flame-gradient opacity-40" />

          <div className="bg-[#060606] py-28 sm:py-40 px-6 relative">

            {/* Background glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full opacity-[0.04] blur-[100px] bg-[#FF7A00]" />
            </div>

            <FadeUp className="relative z-10 max-w-4xl mx-auto text-center">

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <p className="font-display-md text-[10px] tracking-[0.3em] text-[#333] mb-8">PRÊT ?</p>

                <h2 className="font-display text-[clamp(40px,9vw,110px)] leading-[0.88] text-white mb-2">
                  ALLUME TA
                </h2>
                <h2 className="font-display text-[clamp(40px,9vw,110px)] leading-[0.88] flame-text mb-12">
                  PROCHAINE PASSION.
                </h2>

                <p className="text-[#555] font-sans text-base sm:text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                  Rejoins des milliers de passionnés qui apprennent différemment.
                  Ta première session à moins de 20€.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/explore"
                    className="flame-gradient text-black font-display-md text-[12px] tracking-[0.25em] px-10 py-5 hover:opacity-90 transition-opacity text-center"
                  >
                    TROUVER MA SESSION →
                  </Link>
                  <Link
                    href="/sign-up"
                    className="text-[#444] hover:text-white font-display-md text-[11px] tracking-[0.2em] transition-colors"
                  >
                    CRÉER MON COMPTE GRATUIT
                  </Link>
                </div>

              </motion.div>

              {/* Floating sparks */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-[#FF7A00]"
                  style={{
                    left: `${15 + i * 14}%`,
                    top: `${20 + (i % 3) * 25}%`,
                  }}
                  animate={{
                    y: [-10, -30, -10],
                    opacity: [0, 0.6, 0],
                    scale: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2.5 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: "easeInOut",
                  }}
                />
              ))}

            </FadeUp>
          </div>

          <div className="h-px w-full flame-gradient opacity-20" />
        </section>

        {/* ══════════════════════════════════════════════
            FOOTER minimal
        ══════════════════════════════════════════════ */}
        <footer className="py-8 px-6 flex items-center justify-between border-t border-[#111]">
          <div className="flex items-center gap-3">
            <Image src="/logos/icon-blanc.svg" alt="PassionSpark" width={20} height={20} className="opacity-30" />
            <span className="font-display-md text-[10px] tracking-[0.2em] text-[#333]">PASSIONSPARK</span>
          </div>
          <div className="flex gap-6">
            {["CGU", "CONTACT", "COACHES"].map((l) => (
              <Link key={l} href="#" className="font-display-md text-[10px] tracking-[0.15em] text-[#2a2a2a] hover:text-[#555] transition-colors">
                {l}
              </Link>
            ))}
          </div>
        </footer>

      </div>
    </>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function TestimonialCard({ quote, name, domain }: { quote: string; name: string; domain: string }) {
  const color = DOMAIN_COLORS[domain] ?? "#FF7A00";
  return (
    <div className="shrink-0 w-[280px] sm:w-[340px] bg-[#0d0d0d] border border-[#1a1a1a] p-6 flex flex-col gap-4 hover:border-[#2a2a2a] transition-colors">
      {/* Quote mark */}
      <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
        <path d="M0 14V8.4C0 5.6 0.8 3.467 2.4 2C4 0.533 6.133 0 8.8 0H9.6V2.8C8.133 2.8 6.933 3.267 6 4.2 5.067 5.133 4.6 6.4 4.6 8H8.8V14H0ZM11.2 14V8.4C11.2 5.6 12 3.467 13.6 2 15.2.533 17.333 0 20 0H20.8V2.8C19.333 2.8 18.133 3.267 17.2 4.2 16.267 5.133 15.8 6.4 15.8 8H20V14H11.2Z"
          fill={color} fillOpacity="0.4" />
      </svg>
      <p className="text-[#aaa] text-sm font-sans leading-relaxed flex-1">"{quote}"</p>
      <div className="flex items-center justify-between">
        <span className="text-[#555] text-xs font-sans">{name}</span>
        <span
          className="font-display-md text-[9px] tracking-[0.2em] px-2 py-0.5"
          style={{ color, background: `${color}15`, border: `1px solid ${color}30` }}
        >
          {domain.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
