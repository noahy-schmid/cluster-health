import type { ReactNode } from "react";

interface SettingsCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export default function SettingsCard({
  title,
  description,
  children,
}: SettingsCardProps) {
  return (
    <section className="rounded-lg border border-border bg-bg-1 p-lg">
      <div className="mb-lg">
        <h2 className="text-lg font-focus text-fg-strong">{title}</h2>
        {description && <p className="mt-xs text-sm text-fg-muted">{description}</p>}
      </div>
      <div className="space-y-lg">{children}</div>
    </section>
  );
}
