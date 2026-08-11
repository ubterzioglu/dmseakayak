import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { reservationSchema, type ReservationInput } from "./schema";
import { submitReservation } from "@/hooks/useReservations";
import { useLang } from "@/hooks/useLang";
import { useToursData } from "@/hooks/useTours";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ReservationForm() {
  const { t, locale, pick } = useLang();
  const { dayTours } = useToursData();
  const [params] = useSearchParams();
  const presetTour = params.get("tour") ?? "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ReservationInput>({
    resolver: zodResolver(reservationSchema),
    defaultValues: { tourSlug: presetTour },
  });

  const onSubmit = async (data: ReservationInput) => {
    if (data.honeypot) return; // bot
    const result = await submitReservation(data, locale);

    if (!result.ok) {
      // The insert is the only path now that the WhatsApp hand-off is gone, so
      // a failure must read as a failure — and the form keeps its values so the
      // visitor can retry without retyping everything.
      toast.error(t("reservation.errorTitle"), { description: t("reservation.error") });
      return;
    }

    toast.success(t("reservation.successTitle"), { description: t("reservation.success") });
    reset({ tourSlug: presetTour });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Honeypot — visually hidden, must stay empty */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
        {...register("honeypot")}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="tourSlug">{t("reservation.tour")}</Label>
          <select
            id="tourSlug"
            {...register("tourSlug")}
            className="w-full rounded-xl border border-teal/15 bg-white px-4 py-2.5 text-base outline-none focus:border-orange focus:ring-2 focus:ring-orange/20"
          >
            <option value="">{t("reservation.selectTour")}</option>
            {dayTours.map((tour) => (
              <option key={tour.slug} value={tour.slug}>
                {pick(tour.title)}
              </option>
            ))}
            <option value="tailor-made">{t("reservation.tailorMadeTour")}</option>
          </select>
        </div>
        <div>
          <Label htmlFor="date">{t("reservation.date")}</Label>
          <Input id="date" type="date" {...register("date")} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="partySize">{t("reservation.partySize")}</Label>
          <Input id="partySize" type="number" min={1} max={12} {...register("partySize")} />
        </div>
        <div>
          <Label htmlFor="phone">{t("reservation.phone")} *</Label>
          <Input id="phone" type="tel" {...register("phone")} aria-invalid={!!errors.phone} />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{t("reservation.phone")} *</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">{t("reservation.name")} *</Label>
          <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
          {errors.name && <p className="mt-1 text-sm text-red-600">{t("reservation.name")} *</p>}
        </div>
        <div>
          <Label htmlFor="email">{t("reservation.email")}</Label>
          <Input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} />
        </div>
      </div>

      <div>
        <Label htmlFor="message">{t("reservation.message")}</Label>
        <Textarea id="message" {...register("message")} />
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? t("reservation.submitting") : t("reservation.submit")}
      </Button>
    </form>
  );
}
