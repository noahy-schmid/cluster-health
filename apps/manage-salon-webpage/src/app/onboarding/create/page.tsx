import { Store } from "lucide-react";
import BackButton from "@/components/BackButton";
import SubmitButton from "@/components/SubmitButton";

export default function CreateSalonPage() {
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

          <form className="mt-xl grid grid-cols-1 gap-lg">
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
                className="px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 bg-bg-0 text-fg-normal"
                placeholder="Salon Atelier"
              />
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
                className="px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 bg-bg-0 text-fg-normal"
                placeholder="Musterstrasse 12"
              />
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
                  className="px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 bg-bg-0 text-fg-normal"
                  placeholder="80331"
                />
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
                  className="px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 bg-bg-0 text-fg-normal"
                  placeholder="Munchen"
                />
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
                className="px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 bg-bg-0 text-fg-normal"
                placeholder="+49 89 123456"
              />
            </div>

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
