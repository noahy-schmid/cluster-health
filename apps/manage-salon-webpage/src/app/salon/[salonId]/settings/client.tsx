"use client";

import { useCallback, useRef, useState } from "react";
import {
  CLIMAZON_SLUG,
  type Resource,
  type Salon,
  SEAT_SLUG,
} from "@repo/salon-domain";
import PageHeader from "@/components/PageHeader";
import FormInput from "@/components/website/forms/FormInput";
import { useAutoSave } from "@/hooks/useAutoSave";
import { updateSalonSettings } from "@/api/salon-actions";
import SettingsCard from "./SettingsCard.component";
import SalonResourcesCard from "./SalonResourcesCard.component";
import { useSalonResourcesState } from "./salon-resources.state";

interface SalonSettingsPageClientProps {
  salonId: string;
  initialSalon: Salon;
  initialResources: Resource[];
}

type SalonFormState = {
  name: string;
  street: string;
  postalCode: string;
  city: string;
  phone: string;
};

function createSalonFormState(salon: Salon): SalonFormState {
  return {
    name: salon.name,
    street: salon.street,
    postalCode: salon.postalCode,
    city: salon.city,
    phone: salon.phone,
  };
}

export default function SalonSettingsPageClient({
  salonId,
  initialSalon,
  initialResources,
}: SalonSettingsPageClientProps) {
  const [salonState, setSalonState] = useState(() =>
    createSalonFormState(initialSalon),
  );
  const [salonError, setSalonError] = useState<string | undefined>();

  const salonStateRef = useRef(salonState);
  salonStateRef.current = salonState;

  const initialSalonRef = useRef(createSalonFormState(initialSalon));

  const isSalonDirty =
    salonState.name !== initialSalonRef.current.name ||
    salonState.street !== initialSalonRef.current.street ||
    salonState.postalCode !== initialSalonRef.current.postalCode ||
    salonState.city !== initialSalonRef.current.city ||
    salonState.phone !== initialSalonRef.current.phone;

  const saveSalon = useCallback(async () => {
    const currentState = salonStateRef.current;

    if (
      currentState.name === initialSalonRef.current.name &&
      currentState.street === initialSalonRef.current.street &&
      currentState.postalCode === initialSalonRef.current.postalCode &&
      currentState.city === initialSalonRef.current.city &&
      currentState.phone === initialSalonRef.current.phone
    ) {
      return;
    }

    const result = await updateSalonSettings(salonId, currentState);
    if (!result.success) {
      setSalonError(result.error);
      throw new Error(result.error);
    }

    const nextState = createSalonFormState(result.data);
    initialSalonRef.current = nextState;
    setSalonState(nextState);
    setSalonError(undefined);
  }, [salonId]);

  const triggerSalonSave = useAutoSave(saveSalon);

  const handleSalonBlur = () => {
    if (isSalonDirty) {
      triggerSalonSave();
    }
  };

  const {
    seatAmount,
    setSeatAmount,
    climazonAmount,
    setClimazonAmount,
    customResources,
    setCustomResources,
    resourceError,
    clearResourceError,
    addCustomResource,
    removeCustomResource,
    persistCustomResource,
    persistWellKnownResource,
  } = useSalonResourcesState({
    salonId,
    initialResources,
  });

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Salon Einstellungen"
        subtitle="Pflegen Sie Ihre Stammdaten und verwalten Sie die Ressourcen Ihres Salons."
      />

      <div className="space-y-lg">
        <SettingsCard
          title="Allgemein"
          description="Diese Angaben werden für die Verwaltung Ihres Salons verwendet."
        >
          <div className="grid gap-md md:grid-cols-2">
            <FormInput
              label="Salonname"
              value={salonState.name}
              onChange={(value) =>
                setSalonState((currentState) => ({
                  ...currentState,
                  name: value,
                }))
              }
              onBlur={handleSalonBlur}
              required
            />
            <FormInput
              label="Telefonnummer"
              value={salonState.phone}
              onChange={(value) =>
                setSalonState((currentState) => ({
                  ...currentState,
                  phone: value,
                }))
              }
              onBlur={handleSalonBlur}
              required
            />
          </div>

          {salonError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-md">
              <p className="text-sm text-red-700">{salonError}</p>
            </div>
          )}
        </SettingsCard>

        <SettingsCard
          title="Adresse"
          description="Halten Sie die Kontakt- und Standortdaten Ihres Salons aktuell."
        >
          <div className="grid gap-md md:grid-cols-2">
            <FormInput
              label="Straße und Hausnummer"
              value={salonState.street}
              onChange={(value) =>
                setSalonState((currentState) => ({
                  ...currentState,
                  street: value,
                }))
              }
              onBlur={handleSalonBlur}
              required
            />
            <FormInput
              label="PLZ"
              value={salonState.postalCode}
              onChange={(value) =>
                setSalonState((currentState) => ({
                  ...currentState,
                  postalCode: value,
                }))
              }
              onBlur={handleSalonBlur}
              required
            />
            <div className="md:col-span-2">
              <FormInput
                label="Stadt"
                value={salonState.city}
                onChange={(value) =>
                  setSalonState((currentState) => ({
                    ...currentState,
                    city: value,
                  }))
                }
                onBlur={handleSalonBlur}
                required
              />
            </div>
          </div>
        </SettingsCard>

        <SalonResourcesCard
          seatAmount={seatAmount}
          climazonAmount={climazonAmount}
          customResources={customResources}
          resourceError={resourceError}
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
        />
      </div>
    </div>
  );
}
