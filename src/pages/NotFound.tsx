import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Compass, Home, Phone, HelpCircle } from "lucide-react";
import { Seo } from "@/components/seo/Seo";
import { Button } from "@/components/ui/button";
import { useLang } from "@/hooks/useLang";
import { SEG } from "@/lib/routes";

/** Drifting kayak-paddle silhouette — a light brand motif for the empty state. */
function PaddleMotif() {
  return (
    <motion.svg
      viewBox="0 0 120 120"
      className="h-20 w-20 text-orange-soft/90 drop-shadow-[0_8px_20px_rgba(0,0,0,0.25)] sm:h-24 sm:w-24"
      fill="none"
      stroke="currentColor"
      strokeWidth={4}
      strokeLinecap="round"
      aria-hidden="true"
      initial={{ rotate: -18, y: 0 }}
      animate={{ rotate: [-18, -8, -18], y: [0, -6, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <line x1="20" y1="100" x2="90" y2="20" />
      <ellipse cx="98" cy="12" rx="14" ry="8" transform="rotate(45 98 12)" fill="currentColor" stroke="none" />
      <ellipse cx="16" cy="106" rx="12" ry="7" transform="rotate(45 16 106)" fill="currentColor" stroke="none" opacity={0.7} />
    </motion.svg>
  );
}

/** Thin animated wave line, echoing the wave-divider motif used in Hero.tsx. */
function WaveDivider() {
  return (
    <svg
      viewBox="0 0 1440 40"
      preserveAspectRatio="none"
      className="h-6 w-full text-white/25 sm:h-8"
      aria-hidden="true"
    >
      <path
        d="M0,20 C240,40 480,0 720,20 C960,40 1200,0 1440,20"
        fill="none"
        stroke="currentColor"
        strokeWidth={3}
      />
    </svg>
  );
}

export default function NotFound() {
  const { t, localePath } = useLang();

  const popular = [
    { to: localePath(SEG.tours), label: t("nav.tours"), icon: Compass },
    { to: localePath(SEG.contact), label: t("nav.contact"), icon: Phone },
    { to: localePath(SEG.faq), label: t("nav.faq"), icon: HelpCircle },
  ];

  return (
    <>
      <Seo title={t("notFound.title")} description={t("notFound.subtitle")} noindex />

      <div className="hero-gradient relative overflow-hidden">
        {/* Soft radial glow, purely decorative — echoes the orange accent used sitewide. */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(241,110,11,0.25),transparent_45%)]"
          aria-hidden="true"
        />

        <div className="container relative z-10 flex min-h-[78vh] flex-col items-center justify-center py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PaddleMotif />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-2"
          >
            <div className="select-none text-[5.5rem] font-extrabold leading-none text-white/95 sm:text-[7.5rem]">
              404
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
              {t("notFound.title")}
            </h1>
            <p className="mt-3 max-w-lg text-base leading-7 text-white/80">
              {t("notFound.subtitle")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Button asChild size="lg" variant="primary">
              <Link to={localePath()}>
                <Home className="mr-2 h-4 w-4" />
                {t("notFound.cta")}
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <Link to={localePath(SEG.tours)}>
                <Compass className="mr-2 h-4 w-4" />
                {t("notFound.ctaTours")}
              </Link>
            </Button>
          </motion.div>

          <div className="mt-10 w-full max-w-md">
            <WaveDivider />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-2 w-full max-w-2xl"
          >
            <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white/60">
              {t("notFound.popular")}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {popular.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-4 text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20"
                >
                  <Icon className="h-5 w-5 text-orange-soft" />
                  <span className="text-sm font-semibold">{label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
