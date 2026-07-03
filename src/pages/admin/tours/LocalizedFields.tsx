import type { Localized } from "@/content/tours";
import { LOCALES } from "@/lib/site";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface LocalizedFieldProps {
  label: string;
  value: Localized<string>;
  onChange: (next: Localized<string>) => void;
  multiline?: boolean;
  rows?: number;
  /** Format hint shown under the label (e.g. "Her satır bir madde"). */
  hint?: string;
}

/** One field edited in all four languages; empty languages fall back to
 * Turkish when the form is saved (see tour-form-state.ts). */
export function LocalizedField({
  label,
  value,
  onChange,
  multiline = false,
  rows = 3,
  hint,
}: LocalizedFieldProps) {
  return (
    <div>
      <div className="text-sm font-semibold text-teal-deep">{label}</div>
      {hint && <p className="mt-0.5 text-xs leading-5 text-teal/55">{hint}</p>}
      <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
        {LOCALES.map((locale) => (
          <div key={locale}>
            <div className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-teal/40">
              {locale}
            </div>
            {multiline ? (
              <Textarea
                rows={rows}
                value={value[locale]}
                onChange={(e) => onChange({ ...value, [locale]: e.target.value })}
              />
            ) : (
              <Input
                value={value[locale]}
                onChange={(e) => onChange({ ...value, [locale]: e.target.value })}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
