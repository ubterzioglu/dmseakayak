import { useEffect, useState } from "react";
import { ArrowRightLeft } from "lucide-react";
import { useLang } from "@/hooks/useLang";

/**
 * Lightweight currency converter for tour prices (base = EUR). Live rates are
 * fetched once on mount from open.er-api.com (free, no API key required); the
 * static `RATES` below are the offline fallback used until the fetch resolves or
 * if it fails. Tour prices on the site are in EUR, so this helps guests see a
 * rough local equivalent.
 */
const RATES: Record<string, { label: string; perEur: number }> = {
  EUR: { label: "€ EUR", perEur: 1 },
  TRY: { label: "₺ TRY", perEur: 47 },
  USD: { label: "$ USD", perEur: 1.13 },
  GBP: { label: "£ GBP", perEur: 0.86 },
  RUB: { label: "₽ RUB", perEur: 90 },
};

const CURRENCIES = Object.keys(RATES);

// Free, no-key FX feed (base EUR). Returns `{ result, rates: { TRY, USD, ... } }`.
const FX_URL = "https://open.er-api.com/v6/latest/EUR";

export function CurrencyConverter() {
  const { t } = useLang();
  const [amount, setAmount] = useState(60); // Kekova Classic base price
  const [from, setFrom] = useState("EUR");
  const [to, setTo] = useState("TRY");
  // perEur rates, seeded with the static fallback and overwritten by the live feed.
  const [rates, setRates] = useState<Record<string, number>>(() =>
    Object.fromEntries(CURRENCIES.map((c) => [c, RATES[c].perEur])),
  );

  useEffect(() => {
    const controller = new AbortController();

    async function loadRates() {
      try {
        const res = await fetch(FX_URL, { signal: controller.signal });
        if (!res.ok) throw new Error(`FX feed returned ${res.status}`);
        const data: { result?: string; rates?: Record<string, number> } = await res.json();
        if (data.result !== "success" || !data.rates) {
          throw new Error("FX feed payload malformed");
        }
        // Keep only the currencies we display, falling back to static per-currency.
        const next = Object.fromEntries(
          CURRENCIES.map((c) => [c, data.rates?.[c] ?? RATES[c].perEur]),
        );
        setRates(next);
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        // Non-fatal: the static fallback rates remain in state.
      }
    }

    void loadRates();
    return () => controller.abort();
  }, []);

  // Convert via EUR as the pivot.
  const inEur = amount / rates[from];
  const result = inEur * rates[to];
  const formatted = result.toLocaleString("tr-TR", { maximumFractionDigits: 2 });

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-teal/10 bg-white p-4 shadow-[0_10px_30px_rgba(1,68,57,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <div className="text-xs font-bold uppercase tracking-wide text-orange">
          {t("currency.eyebrow")}
        </div>
        <h3 className="text-sm font-bold text-teal-deep">{t("currency.title")}</h3>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-2.5">
        <div className="min-w-24 flex-1">
          <label className="mb-1 block text-[11px] font-semibold text-teal/70">{t("currency.amount")}</label>
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full rounded-xl border border-teal/15 px-3 py-2 outline-none focus:border-orange focus:ring-2 focus:ring-orange/20"
          />
        </div>

        <div className="w-28">
          <label className="mb-1 block text-[11px] font-semibold text-teal/70">{t("currency.from")}</label>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full rounded-xl border border-teal/15 px-3 py-2 outline-none focus:border-orange"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{RATES[c].label}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={swap}
          aria-label={t("currency.swap")}
          className="mb-0.5 rounded-xl border border-teal/15 p-2 text-teal transition-colors hover:bg-foam"
        >
          <ArrowRightLeft className="h-5 w-5" />
        </button>

        <div className="w-28">
          <label className="mb-1 block text-[11px] font-semibold text-teal/70">{t("currency.to")}</label>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full rounded-xl border border-teal/15 px-3 py-2 outline-none focus:border-orange"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{RATES[c].label}</option>
            ))}
          </select>
        </div>

        <div className="ml-auto flex min-w-32 items-baseline justify-end gap-1.5 rounded-xl bg-foam px-4 py-2">
          <span className="text-xs text-teal/60">
            {amount.toLocaleString("tr-TR")} {from} ≈
          </span>
          <span className="text-base font-extrabold text-teal-deep">
            {formatted} {to}
          </span>
        </div>
      </div>

      <p className="mt-2 text-right text-[11px] text-teal/40">{t("currency.note")}</p>
    </div>
  );
}
