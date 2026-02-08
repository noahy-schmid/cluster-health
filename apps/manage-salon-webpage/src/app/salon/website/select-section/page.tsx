import PageHeader from "@/components/PageHeader";
import BackButton from "@/components/BackButton";
import SectionTypeSelection from "./SectionTypeSelection";

export default function SelectSectionPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <BackButton text="Zurück zur Webseite" />

      <PageHeader
        title="Abschnittstyp Wählen"
        subtitle="Wähle die Art des Abschnitts welche hinzugefügt werden soll"
      ></PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
        <SectionTypeSelection></SectionTypeSelection>
      </div>
    </div>
  );
}
