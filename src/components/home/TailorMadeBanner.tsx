import { Mail } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { useLang } from "@/hooks/useLang";
import { SITE } from "@/lib/site";

export function TailorMadeBanner() {
  const { t } = useLang();

  return (
    <Section className="pt-0">
      <div className="rounded-3xl bg-teal-deep px-6 py-12 text-center text-white shadow-lg md:px-16 md:py-16">
        <div className="text-sm font-bold uppercase tracking-[0.15em] text-orange">
          {t("tailorMade.eyebrow")}
        </div>
        <h2 className="mt-1.5 text-3xl font-extrabold md:text-4xl">{t("tailorMade.title")}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-white/80">{t("tailorMade.body")}</p>
        <div className="mt-8 flex justify-center">
          <Button asChild size="lg" variant="primary">
            <a href={`mailto:${SITE.email}`}>
              <Mail className="h-5 w-5" />
              {t("tailorMade.cta")}
            </a>
          </Button>
        </div>
      </div>
    </Section>
  );
}
