import Image from "next/image";
import styles from "../styles/menu.module.css";
import { CircleChevronDown } from "lucide-react";
import ImageTextSection from "@/components/homepage-sections/image-text-section";
import StaffSlider from "@/components/homepage-sections/staff-slider";
import StickyMenuBar from "@/components/sticky-menu-bar";
import ContactForm from "@/app/contact-form";
import { getStaffMembers } from "@/lib/services/staff-service";
import FeatureListSection from "@/components/homepage-sections/feature-list-section";

export default async function Home() {
  // Load staff data on the server
  const staffMembers = await getStaffMembers();

  const menuItems = [
    { id: "uber-uns", text: "Über Uns" },
    { id: "service", text: "Service" },
    { id: "trends", text: "Trends" },
    { id: "haarprodukte", text: "Haarprodukte" },
    { id: "preise", text: "Preise" },
    { id: "team", text: "Unser Team" },
    { id: "booking", text: "Buchen" },
  ];

  return (
    <>
      <menu className={styles.hero}>
        <Image
          className={styles.heroImage}
          src={"/images/hair.png"}
          alt="hair"
          width={2000}
          height={2000}
        ></Image>
        <div className={styles.heroOverlay}></div>
        <Image
          src={"/images/logo.png"}
          alt="logo"
          width={100}
          height={100}
          className={styles.logo}
        ></Image>

        {/* Hero slogan - only visible on tablet/desktop */}
        <div className={styles.heroSlogan}>
          <h1>Wir lieben Haare</h1>
          <p>Herzlich Willkommen in unserem Salon</p>
        </div>

        {/* Animated arrow - only visible on tablet/desktop */}
        <div className={styles.scrollArrow}>
          <CircleChevronDown size={32} />
        </div>
      </menu>

      <StickyMenuBar menuItems={menuItems} />

      {/* Mock Content Sections */}

      <div id="uber-uns">
        <ImageTextSection
          header="Über Uns"
          text="Wir von Jana & Friseure verstehen uns weder als Designer noch als Künstler, sondern als klassisch ausgebildete HandwerkerInnen mit Lust an Kreativität und Innovation. Auf Individuelle Beratung legen wir dabei sehr großen Wert. Bei Neukunden nehmen wir uns deshalb für das Kennenlernen möglichst viel Zeit. Ebenso wichtig ist für uns, mit den Stammkunden im Gespräch zu bleiben, denn Menschen verändern sich. Die Kunst liegt darin, aus der Vielzahl der Möglichkeiten genau das Richtige für den Moment und für den jeweiligen Typ auszuwählen und zu realisieren, ohne sich zu sehr durch modische Spielereien ablenken zu lassen. Kurz gesagt – unsere Kunden sollen sich beim Besuch und mit unseren Frisuren rundum wohlfühlen!"
          imageSrc="/images/house.png"
          imageAlt="Über Uns"
        />
      </div>

      <div id="service">
        <FeatureListSection />
      </div>

      <div id="trends">
        <ImageTextSection
          header="Aktuelle Trends"
          text={`Bleiben Sie immer up-to-date mit den neuesten Haar-Trends! Unser Team
          besucht regelmäßig Weiterbildungen und Trend-Seminare, um Ihnen die
          aktuellsten Schnitt- und Farbtechniken anbieten zu können. Von
          Balayage bis zu den neuesten Kurzhaarschnitten - wir setzen Trends um.`}
          imageSrc="/images/house.png"
          imageAlt="Aktuelle Trends"
        />
      </div>

      <div id="haarprodukte">
        <ImageTextSection
          header="Hochwertige Haarprodukte"
          text={`Wir verwenden ausschließlich Produkte von renommierten Marken, die für
          Qualität und Nachhaltigkeit stehen. In unserem Salon finden Sie eine
          sorgfältig ausgewählte Produktpalette für die optimale Pflege Ihres
          Haares zu Hause. Gerne beraten wir Sie bei der Auswahl der richtigen
          Produkte.`}
          imageSrc="/images/house.png"
          imageAlt="Hochwertige Haarprodukte"
        />
      </div>

      <div id="preise">
        <ImageTextSection
          header="Faire Preise"
          text={`Qualität muss nicht teuer sein! Wir bieten Ihnen transparente und
          faire Preise für alle unsere Dienstleistungen. Ob Student, Senior oder
          Familie - bei uns gibt es attraktive Rabatte und Angebote. Vereinbaren
          Sie einen Termin und lassen Sie sich unverbindlich beraten.`}
          imageSrc="/images/house.png"
          imageAlt="Faire Preise"
        />
      </div>

      {/* Staff Slider Section */}
      <div id="team" className="py-16 bg-bg-light/30">
        <div className="w-full">
          <div className="text-center mb-10 px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-fg mb-4">
              Unser Team
            </h2>
            <p className="text-fg/70 text-lg max-w-2xl mx-auto">
              Lernen Sie unser erfahrenes Team kennen und buchen Sie direkt
              einen Termin mit Ihrem Lieblingsstylisten.
            </p>
          </div>

          {/* Staff Slider */}
          <StaffSlider staffMembers={staffMembers} />
        </div>
      </div>

      <div id="booking">
        <ContactForm />
      </div>
    </>
  );
}
