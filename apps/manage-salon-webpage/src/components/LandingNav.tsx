import Link from "next/link";

interface LandingNavProps {
  isLoggedIn: boolean;
  salonId?: string;
}

export function LandingNav({ isLoggedIn, salonId }: LandingNavProps) {
  const dashboardHref = salonId ? `/salon/${salonId}` : "/onboarding";

  return (
    <nav className="flex items-center justify-between px-lg py-md relative z-10">
      <div className="font-brand font-bold text-xl text-fg-brand select-none">
        dein<span className="text-primary-600 text-4xl leading-none">.</span>
        salon
      </div>

      <div className="flex items-center gap-md">
        {isLoggedIn ? (
          <Link
            href={dashboardHref}
            className="rounded-md bg-primary px-lg py-sm text-fg-inv font-medium hover:bg-primary-hover transition-colors text-sm"
          >
            Zum Dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/auth/login"
              className="text-fg-normal font-medium hover:text-fg-strong transition-colors text-sm"
            >
              Anmelden
            </Link>
            <Link
              href="/auth/register"
              className="rounded-md bg-primary px-lg py-sm text-fg-inv font-medium hover:bg-primary-hover transition-colors text-sm"
            >
              Registrieren
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
