import { useEffect, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronDown, ChevronRight, KeyRound, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GuideSection } from "./guide-content";

/** Shared props for admin panels that embed the section info accordion. */
export interface AdminPanelProps {
  /** Collapsed "what is this section for?" card, rendered as the 2nd card. */
  infoSlot?: ReactNode;
}

export interface AdminNavItem<T extends string = string> {
  key: T;
  label: string;
  description: string;
  icon: LucideIcon;
}

interface AdminSidebarProps<T extends string> {
  items: AdminNavItem<T>[];
  active: T;
  onSelect: (key: T) => void;
  userEmail?: string | null;
  onChangePassword?: () => void;
  onLogout?: () => void;
  footer?: ReactNode;
  className?: string;
}

export function AdminSidebar<T extends string>({
  items,
  active,
  onSelect,
  userEmail,
  onChangePassword,
  onLogout,
  footer,
  className,
}: AdminSidebarProps<T>) {
  return (
    <aside
      className={cn(
        "flex h-full flex-col overflow-y-auto rounded-[24px] border border-teal/10 bg-white/95 p-3 shadow-[0_20px_60px_rgba(4,43,37,0.08)] backdrop-blur",
        className,
      )}
    >
      <div className="border-b border-teal/8 px-1.5 pb-3">
        <img
          src="/maskotadminlogo.png"
          alt="Dragoman Admin"
          className="h-32 w-auto object-contain"
        />
        <div className="mt-3 inline-flex rounded-full border border-orange/20 bg-orange/5 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-orange">
          Yönetim Paneli
        </div>
        <div className="mt-2.5 font-serif text-[1.5rem] leading-none text-teal-deep">Admin</div>
        {userEmail && (
          <div className="mt-3 rounded-xl border border-teal/10 bg-foam/55 px-3 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-teal/45">
              Oturum
            </div>
            <div className="mt-0.5 break-all text-xs font-medium text-teal-deep">{userEmail}</div>
            {(onChangePassword || onLogout) && (
              <div className="mt-2 flex gap-1.5">
                {onChangePassword && (
                  <button
                    type="button"
                    onClick={onChangePassword}
                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-teal/15 bg-white px-2 py-1.5 text-[11px] font-semibold text-teal-deep transition hover:bg-foam"
                  >
                    <KeyRound className="h-3 w-3" />
                    Şifre
                  </button>
                )}
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg bg-teal-deep px-2 py-1.5 text-[11px] font-semibold text-white transition hover:bg-teal"
                  >
                    <LogOut className="h-3 w-3" />
                    Çıkış
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <nav className="mt-3 flex-1 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={cn(
                "group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all",
                isActive
                  ? "bg-teal-deep text-white shadow-[0_16px_32px_rgba(1,68,57,0.18)]"
                  : "text-teal-deep hover:bg-foam/80",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-colors",
                  isActive
                    ? "border-white/15 bg-white/10 text-white"
                    : "border-teal/10 bg-white text-teal",
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1 text-[13px] font-semibold">{item.label}</span>
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 shrink-0 transition-transform",
                  isActive
                    ? "translate-x-0 text-white/70"
                    : "text-teal/30 group-hover:translate-x-0.5",
                )}
              />
            </button>
          );
        })}
      </nav>

      {footer && <div className="mt-3 border-t border-teal/8 pt-3">{footer}</div>}
    </aside>
  );
}

interface AdminPageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  extra?: ReactNode;
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
  extra,
}: AdminPageHeaderProps) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-teal/10 bg-white px-5 py-3.5 shadow-[0_18px_50px_rgba(4,43,37,0.07)] sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <h1 className="font-serif text-[1.5rem] leading-tight text-teal-deep sm:text-[1.75rem]">
              {title}
            </h1>
            {eyebrow && (
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-teal/40">
                {eyebrow}
              </span>
            )}
          </div>
          <p className="mt-0.5 max-w-2xl text-[13px] leading-5 text-teal/60">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {extra}
          {actions}
        </div>
      </div>
    </section>
  );
}

interface AdminSurfaceProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function AdminSurface({
  title,
  description,
  actions,
  children,
  className,
  contentClassName,
}: AdminSurfaceProps) {
  return (
    <section
      className={cn(
        "rounded-[28px] border border-teal/10 bg-white shadow-[0_18px_50px_rgba(4,43,37,0.07)]",
        className,
      )}
    >
      {(title || description || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-teal/8 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold text-teal-deep">{title}</h2>}
            {description && <p className="mt-0.5 text-[13px] leading-5 text-teal/58">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn("px-4 py-4 sm:px-5", contentClassName)}>{children}</div>
    </section>
  );
}

interface AdminCollapsibleProps {
  title: string;
  description?: string;
  /** Open by default on first render. */
  defaultOpen?: boolean;
  /**
   * When this value changes to something truthy, the accordion opens. Used to
   * auto-expand a collapsed form when the user starts editing a record. The
   * accordion stays uncontrolled — the user can collapse it again afterward.
   */
  forceOpenSignal?: unknown;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

/**
 * Accordion-style surface: a clickable header toggles the body open/closed.
 * Used to keep entry forms collapsible above their content lists.
 */
export function AdminCollapsible({
  title,
  description,
  defaultOpen = true,
  forceOpenSignal,
  children,
  className,
  contentClassName,
}: AdminCollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (forceOpenSignal) setOpen(true);
  }, [forceOpenSignal]);
  return (
    <section
      className={cn(
        "overflow-hidden rounded-[28px] border border-teal/10 bg-white shadow-[0_18px_50px_rgba(4,43,37,0.07)]",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-foam/50 sm:px-5"
      >
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-teal-deep">{title}</h2>
          {description && (
            <p className="mt-0.5 text-[13px] leading-5 text-teal/58">{description}</p>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-teal/50 transition-transform",
            open ? "rotate-180" : "",
          )}
        />
      </button>
      {open && (
        <div className={cn("border-t border-teal/8 px-4 py-4 sm:px-5", contentClassName)}>
          {children}
        </div>
      )}
    </section>
  );
}

interface SectionInfoAccordionProps {
  /**
   * Bölümün rehberdeki birebir içeriği (özet + adımlar + ipuçları). Rehber
   * sekmesindeki ilgili bölümle aynı kaynaktan gelir; verilmezse `description`
   * tek satırlık özet olarak kullanılır.
   */
  guide?: GuideSection;
  /** Rehber bölümü yoksa gösterilecek tek satırlık özet (yedek). */
  description?: string;
  className?: string;
}

/**
 * Collapsed-by-default "Bu bölüm ne işe yarar?" accordion, embedded as the
 * second card inside each panel. Its body is a verbatim copy of the matching
 * guide ("Rehber") section — summary, step-by-step usage and tips — so the two
 * never drift. Falls back to a one-line `description` when no guide exists.
 */
export function SectionInfoAccordion({
  guide,
  description,
  className,
}: SectionInfoAccordionProps) {
  const [open, setOpen] = useState(false);
  return (
    <section
      className={cn(
        "overflow-hidden rounded-[24px] border border-teal/10 bg-white shadow-[0_14px_40px_rgba(4,43,37,0.06)]",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors hover:bg-foam/50 sm:px-5"
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal/55">
          Bu bölüm ne işe yarar?
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-teal/50 transition-transform",
            open ? "rotate-180" : "",
          )}
        />
      </button>
      {open && (
        <div className="border-t border-teal/8 px-4 py-4 sm:px-5">
          <p className="text-[13px] leading-6 text-teal/70">
            {guide ? guide.summary : description}
          </p>

          {guide && guide.steps.length > 0 && (
            <>
              <div className="mt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-teal/45">
                Nasıl kullanılır
              </div>
              <ol className="mt-2 space-y-2">
                {guide.steps.map((step, i) => (
                  <li key={i} className="flex gap-2.5 text-[13px] leading-5 text-teal/80">
                    <span className="mt-0.5 shrink-0 font-bold text-teal-light">
                      {i + 1}.
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </>
          )}

          {guide && guide.tips && guide.tips.length > 0 && (
            <div className="mt-4 rounded-xl border border-teal/10 bg-foam/40 p-4">
              <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-teal/45">
                İpuçları
              </div>
              <ul className="space-y-1.5">
                {guide.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-[13px] leading-5 text-teal/80">
                    <span className="mt-0.5 shrink-0 text-orange">★</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

interface AdminStatCardProps {
  label: string;
  value: ReactNode;
  detail?: string;
  tone?: "teal" | "orange" | "blue" | "emerald" | "rose";
}

const STAT_TONE: Record<NonNullable<AdminStatCardProps["tone"]>, string> = {
  teal: "bg-teal-deep text-white",
  orange: "bg-orange text-white",
  blue: "bg-teal text-white",
  emerald: "bg-teal-light text-white",
  rose: "bg-orange-soft text-white",
};

export function AdminStatCard({
  label,
  value,
  detail,
  tone = "teal",
}: AdminStatCardProps) {
  return (
    <div className="rounded-[24px] border border-teal/10 bg-white p-4 shadow-[0_12px_34px_rgba(4,43,37,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal/45">
            {label}
          </div>
          <div className="mt-3 text-3xl font-semibold leading-none text-teal-deep">{value}</div>
        </div>
        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", STAT_TONE[tone])}>
          canlı
        </span>
      </div>
      {detail && <div className="mt-3 text-sm text-teal/58">{detail}</div>}
    </div>
  );
}

interface AdminQuickLinkCardProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  accentClassName?: string;
  actionLabel?: string;
}

export function AdminQuickLinkCard({
  title,
  description,
  href,
  icon: Icon,
  accentClassName,
  actionLabel = "Aç",
}: AdminQuickLinkCardProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-[20px] border border-teal/10 bg-white p-3 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(4,43,37,0.10)]"
    >
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-teal/10 bg-foam text-teal-deep",
            accentClassName,
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold text-teal-deep">{title}</div>
          <div className="mt-0.5 text-[11px] leading-4 text-teal/55">{description}</div>
          <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-orange">
            {actionLabel}
            <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </a>
  );
}

export function AdminEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-teal/15 bg-foam/35 px-6 py-12 text-center">
      <div className="font-serif text-2xl text-teal-deep">{title}</div>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-teal/58">{description}</p>
    </div>
  );
}
