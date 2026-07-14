import { Mail } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { useLang } from "@/hooks/useLang";
import { SITE } from "@/lib/site";

export function TailorMadeBanner() {
  const { t } = useLang();

  return (
    <Section className="pt-0">
      <div className="relative isolate overflow-hidden rounded-3xl bg-teal-deep text-center text-white shadow-lg">
        {/* Background video — dedicated wave loop, downscaled/trimmed to ~2.3MB for web. */}
        <video
          src="/videos/tailormade-wave.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        {/* Teal glassmorphism overlay: tint + blur keeps the video visible while the
            glass-panel content on top stays readable. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-teal-deep/50 backdrop-blur-[2px] backdrop-saturate-150"
        />

        <div className="px-6 py-12 md:px-16 md:py-16">
          <div className="mx-auto max-w-2xl rounded-2xl border border-white/15 bg-white/10 px-6 py-8 shadow-lg backdrop-blur-md md:px-10 md:py-10">
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
        </div>
      </div>
    </Section>
  );
}
