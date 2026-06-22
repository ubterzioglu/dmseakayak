import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useLang } from "@/hooks/useLang";
import { SEG } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
  const { t, localePath } = useLang();
  const [open, setOpen] = useState(false);

  const links = [
    { to: localePath(SEG.tours), label: t("nav.tours") },
    { to: localePath(SEG.customTours), label: t("nav.customTours") },
    { to: localePath(SEG.trak), label: t("nav.trak") },
    { to: localePath(SEG.about), label: t("nav.about") },
    { to: localePath(SEG.gallery), label: t("nav.gallery") },
    { to: localePath(SEG.reviews), label: t("nav.reviews") },
    { to: localePath(SEG.contact), label: t("nav.contact") },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-teal/10 bg-white/90 backdrop-blur">
      <div className="container flex items-center justify-between py-3">
        <Link to={localePath()} aria-label="Dragoman SeaKayak">
          <img src="/transparanlogo.png" alt="Dragoman SeaKayak" className="h-11 w-auto" />
        </Link>

        <nav className="hidden items-center gap-4 lg:flex">
          {links.map((l, i) => (
            <div key={l.to} className="flex items-center gap-4">
              {i > 0 && <span aria-hidden className="h-4 w-px bg-teal/20" />}
              <NavLink
                to={l.to}
                className={({ isActive }) =>
                  cn("text-sm font-medium text-teal transition-colors hover:text-orange", isActive && "text-orange")
                }
              >
                {l.label}
              </NavLink>
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher className="hidden sm:flex" />
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to={localePath(SEG.contact)}>{t("nav.book")}</Link>
          </Button>
          <button
            type="button"
            className="lg:hidden"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-6 w-6 text-teal" /> : <Menu className="h-6 w-6 text-teal" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-teal/10 bg-white lg:hidden">
          <nav className="container flex flex-col gap-1 py-3">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2 text-base font-medium text-teal hover:bg-foam"
              >
                {l.label}
              </NavLink>
            ))}
            <div className="mt-2 flex items-center justify-between px-2">
              <LanguageSwitcher />
              <Button asChild size="sm">
                <Link to={localePath(SEG.contact)} onClick={() => setOpen(false)}>
                  {t("nav.book")}
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
