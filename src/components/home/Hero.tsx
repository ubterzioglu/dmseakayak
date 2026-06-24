import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLang } from "@/hooks/useLang";
import { SEG } from "@/lib/routes";

export function Hero() {
  const { t, localePath } = useLang();

  return (
    <div className="hero-gradient relative min-h-[52vh] overflow-hidden">
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

      {/* Thin white veil — softens compression artifacts without hiding the video */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-white/15 backdrop-blur-[1px]"
      />

      {/* Content */}
      <div className="relative z-10 flex min-h-[52vh] flex-col items-center justify-center px-4 py-14 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-2xl rounded-[2rem] border border-white/25 bg-teal-deep/35 px-6 py-8 shadow-[0_20px_60px_rgba(1,68,57,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] ring-1 ring-white/10 backdrop-blur-md backdrop-saturate-150 sm:px-10 sm:py-10 [text-shadow:0_2px_10px_rgba(0,0,0,0.45)]"
        >
          <div className="mb-4 flex justify-center">
            <img
              src="/kenarliklilogo.png"
              alt="Dragoman SeaKayak"
              className="h-28 w-auto object-contain drop-shadow-[0_6px_20px_rgba(0,0,0,0.45)] md:h-32"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          </div>

          <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-orange-soft sm:text-xs">
            Dragoman Diving &amp; Outdoors · SeaKayak
          </div>

          <h1 className="text-2xl font-extrabold leading-tight text-white md:text-3xl">
            {t("hero.title").split(" ").slice(0, -2).join(" ")}{" "}
            <span className="text-orange-soft">{t("hero.title").split(" ").slice(-2).join(" ")}</span>
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm text-white/90 md:text-base">
            {t("hero.subtitle")}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="primary">
              <Link to={localePath(SEG.tours)}>{t("hero.ctaTours")}</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to={localePath(SEG.contact)}>{t("hero.ctaBook")}</Link>
            </Button>
          </div>
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
