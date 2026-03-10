"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Resource } from "@repo/salon-domain";
import SalonResourcesCard from "@/app/salon/[salonId]/settings/SalonResourcesCard.component";
import {
  CLIMAZON_SLUG,
  SEAT_SLUG,
} from "@/app/salon/[salonId]/settings/resource.constants";
import { useSalonResourcesState } from "@/app/salon/[salonId]/settings/salon-resources.state";

interface ResourceOnboardingClientProps {
  salonId: string;
  initialResources: Resource[];
}

export default function ResourceOnboardingClient({
  salonId,
  initialResources,
}: ResourceOnboardingClientProps) {
  const router = useRouter();
  const [isContinuing, setIsContinuing] = useState(false);

  const {
    seatAmount,
    setSeatAmount,
    climazonAmount,
    setClimazonAmount,
    customResources,
    setCustomResources,
    resourceError,
    wellKnownResourceWarning,
    hasWellKnownResourceIssues,
    clearResourceError,
    addCustomResource,
    removeCustomResource,
    persistCustomResource,
    persistWellKnownResource,
    persistAllResources,
  } = useSalonResourcesState({
    salonId,
    initialResources,
  });

  const handleContinue = async () => {
    setIsContinuing(true);

    try {
      const saved = await persistAllResources();
      if (saved) {
        router.push(`/salon/${salonId}`);
      }
    } finally {
      setIsContinuing(false);
    }
  };

  return (
    <SalonResourcesCard
      seatAmount={seatAmount}
      climazonAmount={climazonAmount}
      customResources={customResources}
      resourceError={resourceError}
      wellKnownResourceWarning={wellKnownResourceWarning}
      onSeatChange={(amount) => {
        clearResourceError();
        setSeatAmount(amount);
      }}
      onSeatBlur={() => {
        void persistWellKnownResource(SEAT_SLUG);
      }}
      onClimazonChange={(amount) => {
        clearResourceError();
        setClimazonAmount(amount);
      }}
      onClimazonBlur={() => {
        void persistWellKnownResource(CLIMAZON_SLUG);
      }}
      onCustomNameChange={(resourceId, name) => {
        clearResourceError();
        setCustomResources((currentResources) =>
          currentResources.map((resource) =>
            resource.id === resourceId ? { ...resource, name } : resource,
          ),
        );
      }}
      onCustomAmountChange={(resourceId, amount) => {
        clearResourceError();
        setCustomResources((currentResources) =>
          currentResources.map((resource) =>
            resource.id === resourceId ? { ...resource, amount } : resource,
          ),
        );
      }}
      onCustomBlur={(resourceId) => {
        void persistCustomResource(resourceId);
      }}
      onAddCustomResource={addCustomResource}
      onRemoveCustomResource={(resourceId) => {
        void removeCustomResource(resourceId);
      }}
      footer={
        <div className="flex flex-col-reverse gap-md pt-sm md:flex-row md:justify-end">
          <button
            type="button"
            onClick={() => router.push(`/salon/${salonId}`)}
            className="cursor-pointer rounded-md border border-border px-lg py-sm text-base text-fg-normal transition-colors hover:bg-bg-0"
            disabled={isContinuing}
          >
            Später konfigurieren
          </button>
          <button
            type="button"
            onClick={() => void handleContinue()}
            className="cursor-pointer rounded-md bg-primary-500 px-lg py-sm text-base font-focus text-fg-inv transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isContinuing || hasWellKnownResourceIssues}
          >
            {isContinuing ? "Speichern..." : "Weiter zum Salon"}
          </button>
        </div>
      }
    />
  );
}
