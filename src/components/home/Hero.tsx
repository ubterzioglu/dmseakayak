import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLang } from "@/hooks/useLang";
import { SEG } from "@/lib/routes";

export function Hero() {
  const { t, localePath } = useLang();

  return (
    <div className="hero-gradient relative min-h-[90vh] overflow-hidden">
      {/* Background video — loads silently; if /videos/hero.mp4 404s the poster/gradient shows.
          No overlay on top so the footage stays fully visible. */}
      <video
        src="/videos/hero.mp4"
        poster="/seakayakog.jpg"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Content */}
      <div className="relative z-10 flex min-h-[90vh] flex-col items-center justify-center px-4 pb-28 pt-16 text-center [text-shadow:0_2px_10px_rgba(0,0,0,0.55)] md:pb-24 md:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-orange-soft sm:text-base"
        >
          Dragoman Diving &amp; Outdoors · SeaKayak
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="max-w-3xl text-4xl font-extrabold leading-tight text-white md:text-5xl lg:text-6xl"
        >
          {t("hero.title").split(" ").slice(0, -2).join(" ")}{" "}
          <span className="text-orange-soft">{t("hero.title").split(" ").slice(-2).join(" ")}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.28 }}
          className="mt-5 max-w-xl text-base text-white/85 md:text-lg"
        >
          {t("hero.subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <Button asChild size="lg" variant="primary">
            <Link to={localePath(SEG.tours)}>{t("hero.ctaTours")}</Link>
          </Button>
          <Button asChild size="lg" variant="ghost">
            <Link to={localePath(SEG.contact)}>{t("hero.ctaBook")}</Link>
          </Button>
        </motion.div>
      </div>

      {/* Waves SVG divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
        <svg
          viewBox="0 0 1440 64"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="block h-16 w-full"
          aria-hidden="true"
        >
          <path
            d="M0,32 C240,64 480,0 720,32 C960,64 1200,0 1440,32 L1440,64 L0,64 Z"
            fill="#e8f5f2"
          />
        </svg>
      </div>
    </div>
  );
}
