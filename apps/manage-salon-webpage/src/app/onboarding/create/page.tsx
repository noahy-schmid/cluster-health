"use client";

import { useActionState, useState } from "react";
import { Store } from "lucide-react";
import BackButton from "@/components/BackButton";
import SubmitButton from "@/components/SubmitButton";
import { createSalonAction } from "@/api/salon-actions";

export default function CreateSalonPage() {
  const [state, createSalon] = useActionState(createSalonAction, undefined);
  const [formData, setFormData] = useState({
    salonName: "",
    street: "",
    postalCode: "",
    city: "",
    phone: "",
  });

  return (
    <div className="min-h-screen bg-bg-0 text-fg-normal">
      <div className="mx-auto max-w-3xl px-lg py-xl md:py-2xl">
        <BackButton text="Zurück"></BackButton>

        <div className="mt-lg rounded-lg border border-border bg-bg-1 p-xl shadow-sm">
          <div className="flex items-start gap-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-100 text-primary-700">
              <Store className="h-[var(--icon-size-lg)] w-[var(--icon-size-lg)]" />
            </div>
            <div>
              <h1 className="text-lg font-focus text-fg-strong">
                Salon anlegen
              </h1>
              <p className="text-sm text-fg-muted">
                Geben Sie die wichtigsten Informationen ein. Weitere Details
                konnen Sie spater erganzen.
              </p>
            </div>
          </div>

          <form action={createSalon} className="mt-xl grid grid-cols-1 gap-lg">
            <div className="flex flex-col gap-sm">
              <label
                htmlFor="salonName"
                className="text-sm font-medium text-fg-strong"
              >
                Salonname
              </label>
              <input
                id="salonName"
                name="salonName"
                type="text"
                required
                value={formData.salonName}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    salonName: event.target.value,
                  })
                }
                className="px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 bg-bg-0 text-fg-normal"
                placeholder="Salon Atelier"
              />
              <p className="text-sm text-red-500">
                {state?.success === false && state.errors?.salonName
                  ? state.errors.salonName.errors.join(" ")
                  : "\u00A0"}
              </p>
            </div>

            <div className="flex flex-col gap-sm">
              <label
                htmlFor="street"
                className="text-sm font-medium text-fg-strong"
              >
                Strasse und Hausnummer
              </label>
              <input
                id="street"
                name="street"
                type="text"
                required
                value={formData.street}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    street: event.target.value,
                  })
                }
                className="px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 bg-bg-0 text-fg-normal"
                placeholder="Musterstrasse 12"
              />
              <p className="text-sm text-red-500">
                {state?.success === false && state.errors?.street
                  ? state.errors.street.errors.join(" ")
                  : "\u00A0"}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-md md:grid-cols-2">
              <div className="flex flex-col gap-sm">
                <label
                  htmlFor="postalCode"
                  className="text-sm font-medium text-fg-strong"
                >
                  PLZ
                </label>
                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  required
                  value={formData.postalCode}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      postalCode: event.target.value,
                    })
                  }
                  className="px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 bg-bg-0 text-fg-normal"
                  placeholder="80331"
                />
                <p className="text-sm text-red-500">
                  {state?.success === false && state.errors?.postalCode
                    ? state.errors.postalCode.errors.join(" ")
                    : "\u00A0"}
                </p>
              </div>
              <div className="flex flex-col gap-sm">
                <label
                  htmlFor="city"
                  className="text-sm font-medium text-fg-strong"
                >
                  Stadt
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  required
                  value={formData.city}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      city: event.target.value,
                    })
                  }
                  className="px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 bg-bg-0 text-fg-normal"
                  placeholder="Munchen"
                />
                <p className="text-sm text-red-500">
                  {state?.success === false && state.errors?.city
                    ? state.errors.city.errors.join(" ")
                    : "\u00A0"}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-sm">
              <label
                htmlFor="phone"
                className="text-sm font-medium text-fg-strong"
              >
                Telefonnummer
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    phone: event.target.value,
                  })
                }
                className="px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 bg-bg-0 text-fg-normal"
                placeholder="+49 89 123456"
              />
              <p className="text-sm text-red-500">
                {state?.success === false && state.errors?.phone
                  ? state.errors.phone.errors.join(" ")
                  : "\u00A0"}
              </p>
            </div>

            <p className="text-sm text-red-500">
              {state?.success === false && state.errors?.form
                ? state.errors.form.errors.join(" ")
                : "\u00A0"}
            </p>

            <SubmitButton
              label="Salon erstellen"
              pendingLabel="Salon erstellen..."
            />
          </form>
        </div>
      </div>
    </div>
  );
}
