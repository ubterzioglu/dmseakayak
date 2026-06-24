import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { SEG } from "@/lib/routes";
import { SITE } from "@/lib/site";

export function Footer() {
  const { t, localePath } = useLang();
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate overflow-hidden bg-teal-deep text-white/85">
      {/* Background video — silent loop; falls back to the teal background if it 404s */}
      <video
        src="/videos/footer.mp4"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      {/* Green glassmorphism overlay: brand-teal tint + subtle blur so the video
          stays visible while text remains readable. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-teal-deep/45 backdrop-blur-[2px] backdrop-saturate-150"
      />
      {/* Extra darkening top & bottom (where the text sits) for contrast. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-teal-deep/60 via-teal-deep/25 to-teal-deep/65"
      />

      <div className="container flex flex-col items-center space-y-4 py-10 text-center [text-shadow:0_1px_3px_rgba(0,0,0,0.55)]">
        <div className="inline-flex items-center justify-center rounded-[2rem] border border-white/25 bg-teal-deep/35 px-8 py-6 shadow-[0_20px_60px_rgba(1,68,57,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] ring-1 ring-white/10 backdrop-blur-md backdrop-saturate-150">
          <img
            src="/transparanlogo.png"
            alt="Dragoman SeaKayak"
            className="h-24 w-auto object-contain md:h-28"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        </div>

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
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
            <span className="font-semibold text-white">{t("contact.title")} :</span>
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" /> {SITE.address}</span>
            <span className="text-white/25">·</span>
            <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 hover:text-orange-soft"><Phone className="h-4 w-4 shrink-0" /> {SITE.phone}</a>
            <span className="text-white/25">·</span>
            <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 hover:text-orange-soft"><Mail className="h-4 w-4 shrink-0" /> {SITE.email}</a>
          </div>
        </div>

        <div className="w-full border-t border-white/10 pt-1" />

        <nav className="-mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm">
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
