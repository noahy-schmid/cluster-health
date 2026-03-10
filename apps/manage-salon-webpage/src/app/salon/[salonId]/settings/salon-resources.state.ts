"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { Resource } from "@repo/salon-domain";
import {
  createSalonResource,
  deleteSalonResource,
  updateSalonResource,
  upsertWellKnownSalonResource,
} from "@/api/salon-actions";
import { useNotifications } from "@/components/notifications/useNotifications";
import { CLIMAZON_SLUG, SEAT_SLUG } from "./resource.constants";

export interface CustomResourceDraft {
  id: string;
  slug: string;
  name: string;
  amount: number;
  isPersisted: boolean;
  savedName: string;
  savedAmount: number;
}

interface UseSalonResourcesStateProps {
  salonId: string;
  initialResources: Resource[];
}

function slugifyResourceName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[äÄ]/g, "ae")
    .replace(/[öÖ]/g, "oe")
    .replace(/[üÜ]/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function useSalonResourcesState({
  salonId,
  initialResources,
}: UseSalonResourcesStateProps) {
  const { showNotification } = useNotifications();
  const [resourceError, setResourceError] = useState<string | undefined>();

  const initialWellKnownAmounts = useMemo(
    () => ({
      [SEAT_SLUG]:
        initialResources.find((resource) => resource.slug === SEAT_SLUG)
          ?.amount ?? 0,
      [CLIMAZON_SLUG]:
        initialResources.find((resource) => resource.slug === CLIMAZON_SLUG)
          ?.amount ?? 0,
    }),
    [initialResources],
  );

  const [seatAmount, setSeatAmount] = useState(
    initialWellKnownAmounts[SEAT_SLUG],
  );
  const [climazonAmount, setClimazonAmount] = useState(
    initialWellKnownAmounts[CLIMAZON_SLUG],
  );
  const initialWellKnownRef = useRef(initialWellKnownAmounts);

  const [customResources, setCustomResources] = useState<CustomResourceDraft[]>(
    initialResources
      .filter(
        (resource) =>
          resource.slug !== SEAT_SLUG && resource.slug !== CLIMAZON_SLUG,
      )
      .map((resource) => ({
        id: resource.slug,
        slug: resource.slug,
        name: resource.name,
        amount: resource.amount,
        isPersisted: true,
        savedName: resource.name,
        savedAmount: resource.amount,
      })),
  );

  const wellKnownResourceWarning = useMemo(() => {
    if (seatAmount <= 0 || climazonAmount <= 0) {
      return "Bitte hinterlegen Sie für Bedienplätze und Climazons einen Wert größer als 0, da Dienstleistungen diese Ressourcen für die Terminplanung benötigen.";
    }

    return undefined;
  }, [climazonAmount, seatAmount]);
  const hasWellKnownResourceIssues = !!wellKnownResourceWarning;

  const getUniqueSlug = useCallback(
    (name: string, currentId: string) => {
      const baseSlug = slugifyResourceName(name);
      if (!baseSlug) {
        return "";
      }

      const existingSlugs = new Set(
        [SEAT_SLUG, CLIMAZON_SLUG].concat(
          customResources
            .filter((resource) => resource.id !== currentId)
            .map(
              (resource) => resource.slug || slugifyResourceName(resource.name),
            )
            .filter((slug) => slug.length > 0),
        ),
      );

      if (!existingSlugs.has(baseSlug)) {
        return baseSlug;
      }

      let suffix = 2;
      let slug = `${baseSlug}-${suffix}`;
      while (existingSlugs.has(slug)) {
        suffix += 1;
        slug = `${baseSlug}-${suffix}`;
      }

      return slug;
    },
    [customResources],
  );

  const persistWellKnownResource = useCallback(
    async (
      slug: typeof SEAT_SLUG | typeof CLIMAZON_SLUG,
      options?: { showSuccess?: boolean },
    ) => {
      const amount = slug === SEAT_SLUG ? seatAmount : climazonAmount;
      const previousAmount = initialWellKnownRef.current[slug];

      if (amount === previousAmount) {
        return true;
      }

      setResourceError(undefined);
      if (amount <= 0) {
        return false;
      }

      const result = await upsertWellKnownSalonResource(salonId, slug, amount);

      if (!result.success) {
        setResourceError(result.error);
        showNotification(result.error, "error", "long");

        if (slug === SEAT_SLUG) {
          setSeatAmount(previousAmount);
        } else {
          setClimazonAmount(previousAmount);
        }

        return false;
      }

      const savedAmount = result.data?.amount ?? 0;
      initialWellKnownRef.current = {
        ...initialWellKnownRef.current,
        [slug]: savedAmount,
      };

      if (slug === SEAT_SLUG) {
        setSeatAmount(savedAmount);
      } else {
        setClimazonAmount(savedAmount);
      }

      if (options?.showSuccess !== false) {
        showNotification("Erfolgreich gespeichert", "info", "short");
      }

      return true;
    },
    [climazonAmount, salonId, seatAmount, showNotification],
  );

  const persistCustomResource = useCallback(
    async (resourceId: string, options?: { showSuccess?: boolean }) => {
      const draft = customResources.find(
        (resource) => resource.id === resourceId,
      );
      if (!draft) {
        return true;
      }

      const trimmedName = draft.name.trim();
      if (!trimmedName) {
        return true;
      }

      if (
        draft.isPersisted &&
        trimmedName === draft.savedName &&
        draft.amount === draft.savedAmount
      ) {
        return true;
      }

      setResourceError(undefined);

      const result = draft.isPersisted
        ? await updateSalonResource(salonId, draft.slug, {
            name: trimmedName,
            amount: draft.amount,
          })
        : await createSalonResource(salonId, {
            slug: getUniqueSlug(trimmedName, draft.id),
            name: trimmedName,
            amount: draft.amount,
          });

      if (!result.success) {
        setResourceError(result.error);
        showNotification(result.error, "error", "long");
        return false;
      }

      setCustomResources((currentResources) =>
        currentResources.map((resource) =>
          resource.id === resourceId
            ? {
                ...resource,
                slug: result.data.slug,
                name: result.data.name,
                amount: result.data.amount,
                isPersisted: true,
                savedName: result.data.name,
                savedAmount: result.data.amount,
              }
            : resource,
        ),
      );

      if (options?.showSuccess !== false) {
        showNotification("Erfolgreich gespeichert", "info", "short");
      }

      return true;
    },
    [customResources, getUniqueSlug, salonId, showNotification],
  );

  const addCustomResource = useCallback(() => {
    setCustomResources((currentResources) => [
      ...currentResources,
      {
        id: crypto.randomUUID(),
        slug: "",
        name: "",
        amount: 1,
        isPersisted: false,
        savedName: "",
        savedAmount: 1,
      },
    ]);
  }, []);

  const removeCustomResource = useCallback(
    async (resourceId: string) => {
      const draft = customResources.find(
        (resource) => resource.id === resourceId,
      );
      if (!draft) {
        return;
      }

      if (!draft.isPersisted) {
        setCustomResources((currentResources) =>
          currentResources.filter((resource) => resource.id !== resourceId),
        );
        return;
      }

      setResourceError(undefined);
      const result = await deleteSalonResource(salonId, draft.slug);

      if (!result.success) {
        setResourceError(result.error);
        showNotification(result.error, "error", "long");
        return;
      }

      setCustomResources((currentResources) =>
        currentResources.filter((resource) => resource.id !== resourceId),
      );
      showNotification("Ressource gelöscht", "info", "short");
    },
    [customResources, salonId, showNotification],
  );

  const persistAllResources = useCallback(async () => {
    if (hasWellKnownResourceIssues) {
      return false;
    }

    const seatSaved = await persistWellKnownResource(SEAT_SLUG, {
      showSuccess: false,
    });
    if (!seatSaved) {
      return false;
    }

    const climazonSaved = await persistWellKnownResource(CLIMAZON_SLUG, {
      showSuccess: false,
    });
    if (!climazonSaved) {
      return false;
    }

    for (const resource of customResources) {
      const saved = await persistCustomResource(resource.id, {
        showSuccess: false,
      });
      if (!saved) {
        return false;
      }
    }

    showNotification("Ressourcen gespeichert", "info", "short");
    return true;
  }, [
    customResources,
    persistCustomResource,
    persistWellKnownResource,
    showNotification,
    hasWellKnownResourceIssues,
  ]);

  return {
    seatAmount,
    setSeatAmount,
    climazonAmount,
    setClimazonAmount,
    customResources,
    setCustomResources,
    resourceError,
    wellKnownResourceWarning,
    hasWellKnownResourceIssues,
    clearResourceError: () => setResourceError(undefined),
    addCustomResource,
    removeCustomResource,
    persistCustomResource,
    persistWellKnownResource,
    persistAllResources,
  };
}
