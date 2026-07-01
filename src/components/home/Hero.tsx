import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLang } from "@/hooks/useLang";
import { SEG } from "@/lib/routes";

export function Hero() {
  const { t, localePath } = useLang();

  return (
    <div className="relative overflow-hidden">
      {/* Background video — loads silently; if /videos/heronew.mp4 404s the poster/gradient shows. */}
      <div className="relative min-h-[52vh] w-full overflow-hidden">
        <video
          src="/videos/heronew.mp4"
          poster="/seakayakog.jpg"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center border-t border-teal-deep/10 bg-white px-4 py-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-xl px-5 py-6 sm:px-8 sm:py-7"
        >
          <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-orange-soft sm:text-xs">
            Dragoman Diving &amp; Outdoors · SeaKayak
          </div>

          <h1 className="text-xl font-extrabold leading-tight text-teal-deep md:text-2xl">
            {t("hero.title").split(" ").slice(0, -2).join(" ")}{" "}
            <span className="text-orange-soft">{t("hero.title").split(" ").slice(-2).join(" ")}</span>
          </h1>

          <p className="mx-auto mt-2 max-w-xl text-xs text-teal-deep/80 md:text-sm">
            {t("hero.subtitle")}
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="primary">
              <Link to={localePath(SEG.tours)}>{t("hero.ctaTours")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={localePath(SEG.contact)}>{t("hero.ctaBook")}</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
