import { Seo } from "@/components/seo/Seo";
import { Section, SectionHeading } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { ReservationForm } from "@/components/reservation/ReservationForm";
import { useLang } from "@/hooks/useLang";
import { buildWhatsappLink } from "@/lib/whatsapp";
import { SITE } from "@/lib/site";
import { Phone, Mail, MapPin, Instagram, Facebook } from "lucide-react";

export default function Contact() {
  const { t } = useLang();

  const waLink = buildWhatsappLink();

  return (
    <>
      <Seo title={t("contact.title")} description={t("contact.subtitle")} />

      <Section>
        <SectionHeading title={t("contact.title")} subtitle={t("contact.subtitle")} />

        <div className="grid gap-12 lg:grid-cols-2">
          {/* LEFT — contact details */}
          <div className="space-y-6">
            {/* Phone */}
            <a
              href={`tel:${SITE.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-4 rounded-2xl border border-teal/10 bg-white p-5 shadow-[0_4px_16px_rgba(1,68,57,0.07)] transition-all hover:border-teal/30"
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-teal/10">
                <Phone className="h-5 w-5 text-teal" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-orange">
                  {t("contact.phone")}
                </div>
                <div className="mt-0.5 font-semibold text-teal-deep">{SITE.phone}</div>
              </div>
            </a>

            {/* Email */}
            <a
              href={`mailto:${SITE.email}`}
              className="flex items-center gap-4 rounded-2xl border border-teal/10 bg-white p-5 shadow-[0_4px_16px_rgba(1,68,57,0.07)] transition-all hover:border-teal/30"
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-teal/10">
                <Mail className="h-5 w-5 text-teal" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-orange">
                  {t("contact.email")}
                </div>
                <div className="mt-0.5 font-semibold text-teal-deep">{SITE.email}</div>
              </div>
            </a>

            {/* Address */}
            <div className="flex items-start gap-4 rounded-2xl border border-teal/10 bg-white p-5 shadow-[0_4px_16px_rgba(1,68,57,0.07)]">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-teal/10">
                <MapPin className="h-5 w-5 text-teal" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-orange">
                  {t("contact.address")}
                </div>
                <div className="mt-0.5 font-semibold text-teal-deep">{SITE.address}</div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <Button asChild variant="teal" size="lg" className="w-full">
              <a href={waLink} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </Button>

            {/* Social */}
            <div>
              <div className="mb-3 text-sm font-semibold text-teal/60">{t("contact.follow")}</div>
              <div className="flex gap-3">
                <Button asChild variant="outline" size="icon">
                  <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <Instagram className="h-5 w-5" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="icon">
                  <a href={SITE.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <Facebook className="h-5 w-5" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Map embed */}
            <div className="overflow-hidden rounded-2xl border border-teal/10 shadow-[0_4px_16px_rgba(1,68,57,0.07)]">
              <iframe
                title="Dragoman SeaKayak — Kaş haritası"
                src="https://www.google.com/maps?q=Dragoman+Diving+and+Outdoor,Kaş,Antalya,Turkey&output=embed"
                width="100%"
                height="220"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* RIGHT — reservation form */}
          <div className="rounded-2xl border border-teal/10 bg-white p-7 shadow-[0_10px_30px_rgba(1,68,57,0.08)]">
            <h2 className="mb-5 text-xl font-bold text-teal-deep">{t("reservation.title")}</h2>
            <ReservationForm />
          </div>
        </div>
      </Section>
    </>
  );
}
