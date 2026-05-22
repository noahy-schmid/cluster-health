"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";
import { EventShell } from "../components/event-shell";
import { FeatureCard } from "../components/feature-card.component";

export default function HomePage() {
  const { password } = useAuth();
  const router = useRouter();

  if (!password) {
    router.replace("/");
    return null;
  }

  return (
    <EventShell
      title="Stammheimer Seifenkistenrennen"
      subtitle="Verwalten Sie Gutscheine, Teamstammdaten und Schritt für Schritt weitere Abläufe des Event-Tages in einer Oberfläche."
    >
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[1.75rem] border-2 border-primary/10 bg-white/92 p-6 shadow-md sm:p-8">
          <div className="mt-6 space-y-3">
            <h2 className="text-2xl text-accent sm:text-3xl">
              Was möchten Sie verwalten?
            </h2>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <FeatureCard
              header="Kassen- und Ausgabebereich"
              caption="Scanner"
              text="Gutscheine prüfen und vor Ort direkt entwerten."
              variant="primary"
              className="transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
              onClick={() => router.push("/verify")}
            />
            <FeatureCard
              header="Vorbereitung und Teamverwaltung"
              caption="Gutscheine"
              text="PDF-Gutscheine für das Event erzeugen und ausgeben."
              variant="outline"
              className="transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
              onClick={() => router.push("/generate")}
            />

            <FeatureCard
              header="Vorbereitung und Teamverwaltung"
              caption="Teams"
              text="Teams anlegen, Startnummern verwalten und Schilder als PDF herunterladen."
              variant="outline"
              className="transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
              onClick={() => router.push("/teams")}
            />
          </div>
        </div>
      </div>
    </EventShell>
  );
}
