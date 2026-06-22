import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
  footer?: ReactNode;
  className?: string;
}

export function AdminSidebar<T extends string>({
  items,
  active,
  onSelect,
  userEmail,
  footer,
  className,
}: AdminSidebarProps<T>) {
  return (
    <aside
      className={cn(
        "flex h-full flex-col rounded-[28px] border border-teal/10 bg-white/95 p-4 shadow-[0_20px_60px_rgba(4,43,37,0.08)] backdrop-blur",
        className,
      )}
    >
      <div className="border-b border-teal/8 px-2 pb-4">
        <div className="inline-flex rounded-full border border-orange/20 bg-orange/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-orange">
          Yönetim Paneli
        </div>
        <div className="mt-4 font-serif text-[2rem] leading-none text-teal-deep">Dragoman</div>
        <div className="text-sm text-teal/62">İçerik ve rezervasyon yönetimi</div>
        {userEmail && (
          <div className="mt-4 rounded-2xl border border-teal/10 bg-foam/55 px-4 py-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal/45">
              Oturum
            </div>
            <div className="mt-1 break-all text-sm font-medium text-teal-deep">{userEmail}</div>
          </div>
        )}
      </div>

      <nav className="mt-4 flex-1 space-y-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={cn(
                "group flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition-all",
                isActive
                  ? "bg-teal-deep text-white shadow-[0_16px_32px_rgba(1,68,57,0.18)]"
                  : "text-teal-deep hover:bg-foam/80",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-colors",
                  isActive
                    ? "border-white/15 bg-white/10 text-white"
                    : "border-teal/10 bg-white text-teal",
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{item.label}</span>
                  <ChevronRight
                    className={cn(
                      "h-3.5 w-3.5 transition-transform",
                      isActive ? "translate-x-0 text-white/70" : "text-teal/30 group-hover:translate-x-0.5",
                    )}
                  />
                </span>
                <span
                  className={cn(
                    "mt-1 block text-xs leading-5",
                    isActive ? "text-white/70" : "text-teal/55",
                  )}
                >
                  {item.description}
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      {footer && <div className="mt-4 border-t border-teal/8 pt-4">{footer}</div>}
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
    <section className="overflow-hidden rounded-[32px] border border-teal/10 bg-white px-6 py-6 shadow-[0_24px_80px_rgba(4,43,37,0.08)] sm:px-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          {eyebrow && (
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal/45">
              {eyebrow}
            </div>
          )}
          <div className="mt-3 max-w-3xl">
            <h1 className="font-serif text-[2.4rem] leading-[0.96] text-teal-deep sm:text-[3rem]">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-teal/65 sm:text-[15px]">
              {description}
            </p>
          </div>
          {actions && <div className="mt-5 flex flex-wrap gap-3">{actions}</div>}
        </div>
        {extra && (
          <div className="flex flex-col justify-between rounded-[28px] border border-teal/10 bg-foam/60 p-5">
            {extra}
          </div>
        )}
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
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-teal/8 px-5 py-5 sm:px-6">
          <div className="min-w-0">
            {title && <h2 className="text-lg font-semibold text-teal-deep">{title}</h2>}
            {description && <p className="mt-1 text-sm leading-6 text-teal/58">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn("px-5 py-5 sm:px-6", contentClassName)}>{children}</div>
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
  blue: "bg-sky-600 text-white",
  emerald: "bg-emerald-600 text-white",
  rose: "bg-rose-600 text-white",
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
      className="group block rounded-[24px] border border-teal/10 bg-white p-4 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(4,43,37,0.10)]"
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-teal/10 bg-foam text-teal-deep",
            accentClassName,
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-teal-deep">{title}</div>
          <div className="mt-1 text-xs leading-5 text-teal/55">{description}</div>
          <div className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-orange">
            {actionLabel}
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
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
