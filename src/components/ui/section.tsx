import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  id?: string;
  className?: string;
  children: ReactNode;
}

export function Section({ id, className, children }: SectionProps) {
  return (
    <section id={id} className={cn("py-16 md:py-20", className)}>
      <div className="container">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  subtitleClassName,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  subtitleClassName?: string;
}) {
  return (
    <div className="mb-10 max-w-2xl">
      {eyebrow && (
        <div className="text-sm font-bold uppercase tracking-[0.15em] text-orange">{eyebrow}</div>
      )}
      <h2 className="mt-1.5 text-3xl font-extrabold text-teal-deep md:text-4xl">{title}</h2>
      {subtitle && <p className={cn("mt-2 text-teal", subtitleClassName)}>{subtitle}</p>}
    </div>
  );
}
