import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLang } from "@/hooks/useLang";
import { SEG } from "@/lib/routes";
import { fetchActiveHeroVideoUrl } from "@/hooks/useAdminContent";

const DEFAULT_HERO_VIDEO = "/videos/heronew.mp4";

export function Hero() {
  const { t, localePath } = useLang();
  const [videoSrc, setVideoSrc] = useState(DEFAULT_HERO_VIDEO);

  useEffect(() => {
    let cancelled = false;
    void fetchActiveHeroVideoUrl().then((url) => {
      if (!cancelled && url) setVideoSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Background video — admin-managed via /admin (Hero Video); falls back to
          the bundled /videos/heronew.mp4 if none is configured or it 404s. */}
      <div className="relative min-h-[52vh] w-full overflow-hidden">
        <video
          key={videoSrc}
          src={videoSrc}
          poster="/seakayakog.jpg"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />

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
              fill="#ffffff"
            />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center bg-white px-4 py-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-xl px-5 py-6 sm:px-8 sm:py-7"
        >
          <div className="mb-4">
            <div className="text-2xl font-black uppercase leading-none tracking-[0.02em] text-teal-deep sm:text-3xl md:text-4xl">
              Dragoman <span className="text-orange-soft">Diving</span> &amp; Outdoors
            </div>
            <div className="mt-2 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-orange-soft/60" aria-hidden="true" />
              <span className="text-[11px] font-bold tracking-[0.4em] text-teal-deep/60 sm:text-xs">
                SEAKAYAK
              </span>
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-orange-soft/60" aria-hidden="true" />
            </div>
          </div>

          <div>
            <h1 className="text-sm font-semibold leading-snug text-teal-deep/70 sm:text-base">
              {t("hero.title").split(" ").slice(0, -2).join(" ")}{" "}
              <span className="text-orange-soft">{t("hero.title").split(" ").slice(-2).join(" ")}</span>
            </h1>

            <p className="mx-auto mt-1 max-w-xl text-[11px] text-teal-deep/60 sm:text-xs">
              {t("hero.subtitle")}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="primary" size="lg" className="w-full max-w-[220px] sm:w-auto">
              <Link to={localePath(SEG.tours)}>{t("hero.ctaTours")}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full max-w-[220px] border-teal-deep/30 text-teal-deep hover:bg-teal-deep/5 sm:w-auto"
            >
              <Link to={localePath(SEG.contact)}>{t("hero.ctaBook")}</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
