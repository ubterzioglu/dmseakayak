import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { SEG } from "@/lib/routes";
import { SITE } from "@/lib/site";

export function Footer() {
  const { t, localePath } = useLang();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-teal-deep text-white/85">
      <div className="container flex flex-col items-center space-y-8 py-12 text-center">
        <div className="flex flex-col items-center">
          <span className="text-xl font-semibold text-white">{SITE.name}</span>
          <p className="mt-2 whitespace-nowrap text-sm opacity-80">{t("footer.tagline")}</p>
        </div>

        <div className="flex justify-center gap-4">
          <a href={SITE.instagram} aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/25 p-3 transition-colors hover:bg-orange hover:border-orange">
            <Instagram className="h-7 w-7" />
          </a>
          <a href={SITE.facebook} aria-label="Facebook" target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/25 p-3 transition-colors hover:bg-orange hover:border-orange">
            <Facebook className="h-7 w-7" />
          </a>
          <a href={`mailto:${SITE.email}`} aria-label="Email" className="rounded-full border border-white/25 p-3 transition-colors hover:bg-orange hover:border-orange">
            <Mail className="h-7 w-7" />
          </a>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-white">{t("contact.title")}</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start justify-center gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {SITE.address}</li>
            <li className="flex items-center justify-center gap-2"><Phone className="h-4 w-4 shrink-0" /> <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="hover:text-orange-soft">{SITE.phone}</a></li>
            <li className="flex items-center justify-center gap-2"><Mail className="h-4 w-4 shrink-0" /> <a href={`mailto:${SITE.email}`} className="hover:text-orange-soft">{SITE.email}</a></li>
          </ul>
        </div>

        <div className="w-full border-t border-white/10" />

        <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm">
          <Link to={localePath(SEG.tours)} className="hover:text-orange-soft">{t("nav.tours")}</Link>
          <span className="text-white/25">|</span>
          <Link to={localePath(SEG.customTours)} className="hover:text-orange-soft">{t("nav.customTours")}</Link>
          <span className="text-white/25">|</span>
          <Link to={localePath(SEG.trak)} className="hover:text-orange-soft">{t("nav.trak")}</Link>
          <span className="text-white/25">|</span>
          <Link to={localePath(SEG.about)} className="hover:text-orange-soft">{t("nav.about")}</Link>
          <span className="text-white/25">|</span>
          <Link to={localePath(SEG.faq)} className="hover:text-orange-soft">{t("nav.faq")}</Link>
          <span className="text-white/25">|</span>
          <Link to={localePath(SEG.contact)} className="hover:text-orange-soft">{t("nav.contact")}</Link>
        </nav>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs opacity-70">
        © {year} {SITE.name} — {t("footer.rights")}
        {" · "}
        <a href="https://chatio.com.tr/" rel="dofollow" target="_blank" className="hover:text-orange-soft">Canlı Destek Yazılımı</a>
        <span className="mx-2 text-white/25">·</span>
        <a href="https://www.spindorai.com/seo/en-iyi-seo-ajansi" rel="dofollow" target="_blank" className="hover:text-orange-soft">Seo Ajansı</a>
        {" "}Spindora Tarafından Seosu Yapılmıştır.
      </div>
    </footer>
  );
}
