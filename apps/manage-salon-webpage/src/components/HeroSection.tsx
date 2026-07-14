import Link from "next/link";

export function HeroSection() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center px-lg relative z-10">
      <p className="text-sm uppercase tracking-[0.2em] text-fg-muted mb-md">
        Die professionelle Plattform für Friseursalons
      </p>

      <h1 className="font-brand text-4xl md:text-6xl text-fg-brand leading-tight">
        Dein Salon.
        <br />
        <span className="text-primary">Deine Regeln.</span>
      </h1>

      <p className="mt-lg text-base md:text-lg text-fg-muted max-w-xl leading-relaxed">
        Verwalte deinen Salon, gestalte deine Webseite und koordiniere dein Team
        – alles an einem Ort.
      </p>

      <div className="mt-xl">
        <Link
          href="/auth/register"
          className="rounded-md bg-primary px-2xl py-md text-fg-inv font-medium hover:bg-primary-hover transition-colors text-base"
        >
          Kostenlos starten
        </Link>
      </div>
    </div>
  );
}
