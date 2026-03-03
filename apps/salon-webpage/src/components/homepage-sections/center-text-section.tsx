import { CenterTextSettings } from "@repo/website-domain";

interface CenterTextSectionProps {
  settings: CenterTextSettings;
}

export default function CenterTextSection({
  settings,
}: CenterTextSectionProps) {
  return (
    <section className="px-4 py-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="text-4xl font-semibold text-salon-fg-strong mb-4">
          {settings.title}
        </h2>
        <p className="text-p font-normal text-salon-fg-base whitespace-pre-wrap">
          {settings.content}
        </p>
      </div>
    </section>
  );
}
