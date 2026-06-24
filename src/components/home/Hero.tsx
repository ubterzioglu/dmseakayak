import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLang } from "@/hooks/useLang";
import { SEG } from "@/lib/routes";

export function Hero() {
  const { t, localePath } = useLang();

  return (
    <div className="hero-gradient relative min-h-[90vh] overflow-hidden">
      {/* Background video — loads silently; if /videos/hero.mp4 404s the gradient shows */}
      <video
        src="/videos/hero.mp4"
        poster="/seakayakog.jpg"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-30"
      />

      {/* Gradient overlay sits on top of the video */}
      <div className="hero-gradient absolute inset-0" />

      {/* Content */}
      <div className="relative z-10 flex min-h-[90vh] flex-col items-center justify-start px-4 pb-28 pt-16 text-center md:pb-24 md:pt-20">
        {/* Floating transparent logo */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="animate-bob group relative mb-8 inline-flex items-center justify-center overflow-hidden rounded-[2rem] border border-white/50 bg-white/65 px-10 py-8 shadow-[0_20px_60px_rgba(1,68,57,0.35),inset_0_1px_0_rgba(255,255,255,0.7)] ring-1 ring-white/30 backdrop-blur-xl"
        >
          {/* Glass sheen highlight */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent"
          />
          <img
            src="/transparanlogo.png"
            alt="Dragoman SeaKayak"
            className="relative h-56 w-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)] md:h-72 lg:h-[22rem]"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
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
