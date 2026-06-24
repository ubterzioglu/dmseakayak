import { Link } from "react-router-dom";
import { Compass, Home, Images, Phone, HelpCircle } from "lucide-react";
import { Seo } from "@/components/seo/Seo";
import { Button } from "@/components/ui/button";
import { useLang } from "@/hooks/useLang";
import { SEG } from "@/lib/routes";

export default function NotFound() {
  const { t, localePath } = useLang();

  const popular = [
    { to: localePath(SEG.tours), label: t("nav.tours"), icon: Compass },
    { to: localePath(SEG.gallery), label: t("nav.gallery"), icon: Images },
    { to: localePath(SEG.contact), label: t("nav.contact"), icon: Phone },
    { to: localePath(SEG.faq), label: t("nav.faq"), icon: HelpCircle },
  ];

  return (
    <>
      <Seo title={t("notFound.title")} description={t("notFound.subtitle")} noindex />

      <div className="hero-gradient relative overflow-hidden">
        <div className="container relative z-10 flex min-h-[78vh] flex-col items-center justify-center py-20 text-center">
          <div className="relative">
            <div className="select-none text-[7rem] font-extrabold leading-none text-white/95 drop-shadow-[0_8px_30px_rgba(0,0,0,0.25)] sm:text-[10rem]">
              404
            </div>
          </div>

          <h1 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">
            {t("notFound.title")}
          </h1>
          <p className="mt-3 max-w-lg text-base leading-7 text-white/80">
            {t("notFound.subtitle")}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
          </div>

          <div className="mt-10 w-full max-w-2xl">
            <div className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white/60">
              {t("notFound.popular")}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {popular.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-4 text-white backdrop-blur transition hover:bg-white/20"
                >
                  <Icon className="h-5 w-5 text-orange-soft" />
                  <span className="text-sm font-semibold">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
