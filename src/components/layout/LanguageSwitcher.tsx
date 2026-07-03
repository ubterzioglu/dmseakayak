import { useNavigate, useLocation, useParams } from "react-router-dom";
import { LOCALES, isLocale, DEFAULT_LOCALE } from "@/lib/site";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = { tr: "TR", en: "EN", fr: "FR", ru: "RU" };

/** Swaps the :lang segment of the current path, preserving the rest. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useParams();
  const current = isLocale(lang) ? lang : DEFAULT_LOCALE;

  const switchTo = (next: string) => {
    const parts = location.pathname.split("/");
    // Replace whichever segment is the active locale, leaving any base-path
    // prefix (e.g. /mvp) and the rest of the path intact.
    const langIndex = parts.findIndex((p) => isLocale(p));
    if (langIndex >= 0) parts[langIndex] = next;
    navigate(parts.join("/") || `/${next}`);
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchTo(l)}
          aria-current={l === current}
          className={cn(
            "rounded-full px-1.5 py-1 text-xs font-semibold transition-colors sm:px-2.5 sm:text-sm",
            l === current ? "bg-orange text-white" : "text-teal hover:bg-foam",
          )}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
