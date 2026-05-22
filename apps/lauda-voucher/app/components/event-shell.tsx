import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

type EventShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  compact?: boolean;
  backHref?: string;
  backLabel?: string;
};

export function EventShell({
  title,
  subtitle,
  children,
  compact = false,
  backHref,
  backLabel = "Zurück",
}: EventShellProps) {
  return (
    <div className="min-h-screen px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section
          className={`relative overflow-hidden rounded-[1.5rem] border-4 border-primary bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,243,235,0.95))] shadow-[0_20px_50px_rgba(31,44,61,0.14)] sm:rounded-[2rem] sm:shadow-[0_28px_80px_rgba(31,44,61,0.16)] ${compact ? "px-4 py-5 sm:px-8 sm:py-6" : "px-4 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10"}`}
        >
          <div className="absolute inset-x-0 top-0 h-2 bg-primary" />
          <div className="absolute inset-y-0 left-0 w-14 bg-[repeating-linear-gradient(135deg,rgba(31,44,61,0.08)_0,rgba(31,44,61,0.08)_4px,transparent_4px,transparent_10px)] sm:block" />
          <div className="absolute inset-y-0 right-0 w-14 bg-[repeating-linear-gradient(135deg,rgba(204,0,0,0.08)_0,rgba(204,0,0,0.08)_4px,transparent_4px,transparent_10px)] sm:block" />

          <div className="relative flex flex-col gap-6">
            <div className="flex flex-row items-center justify-between">
              {backHref ? (
                <Link
                  href={backHref}
                  className="rounded-2xl border-2 border-primary/15 bg-white/80 px-4 py-3 text-center shadow-sm transition-colors hover:border-primary/30 hover:bg-white sm:text-left"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-primary">
                    ← {backLabel}
                  </p>
                  <p className="mt-1 text-sm text-accent/80">Zur Startseite</p>
                </Link>
              ) : (
                <div className="rounded-2xl border-2 border-primary/15 bg-white/80 px-4 py-3 text-center shadow-sm sm:text-left">
                  <p className="text-xs uppercase tracking-[0.3em] text-primary">
                    Event App
                  </p>
                  <p className="mt-1 text-sm text-accent/80">13. Juni 2026</p>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 sm:justify-end sm:gap-3">
                <div className="rounded-2xl border-2 border-primary/10 bg-white/80 p-2 shadow-sm">
                  <Image
                    src="/lauda-logo.png"
                    alt="Event Logo"
                    width={62}
                    height={62}
                    className="h-12 w-12 object-contain sm:h-14 sm:w-14"
                    priority
                  />
                </div>
              </div>
            </div>

            <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center">
              <h1 className="px-1 text-xl leading-[1.05] [text-wrap:balance] text-primary [-webkit-text-stroke:1px_rgba(31,44,61,0.95)] [paint-order:stroke_fill] sm:px-0 sm:text-4xl sm:[-webkit-text-stroke:2px_rgba(31,44,61,0.95)] lg:text-6xl">
                {title}
              </h1>
              <p className="max-w-3xl text-sm leading-relaxed text-accent/85 sm:text-lg">
                {subtitle}
              </p>
            </div>
          </div>
        </section>

        {children}
      </div>
    </div>
  );
}
