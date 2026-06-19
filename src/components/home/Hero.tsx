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
      <div className="relative z-10 flex min-h-[90vh] flex-col items-center justify-center px-4 text-center">
        {/* Floating transparent logo */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="animate-bob mb-8 inline-flex items-center justify-center rounded-3xl border border-white/60 bg-white/95 px-8 py-6 shadow-[0_12px_40px_rgba(0,0,0,0.35)] ring-1 ring-black/5 backdrop-blur-sm"
        >
          <img
            src="/logo.png"
            alt="Dragoman SeaKayak"
            className="h-28 w-auto md:h-36 lg:h-40"
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
