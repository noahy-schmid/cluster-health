"use client";

import Image from "next/image";
import styles from "../styles/menu.module.css";
import { CircleChevronDown } from "lucide-react";
import MenuChip from "@/components/menu-chip";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import ImageTextSection from "@/components/image-text-section";
import StaffSlider from "@/components/staff-slider";
import BookingModal from "@/components/booking-modal";

export default function Home() {
  const [activeSection, setActiveSection] = useState("uber-uns");
  const [showStickyLogo, setShowStickyLogo] = useState(false);
  const menuChipContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const heroRef = useRef<HTMLElement>(null);
  const [selectedStaff, setSelectedStaff] = useState<number | null>(null);

  // Mock staff data
  const staffMembers = [
    {
      name: "Jana Schmidt",
      role: "Salon-Inhaberin & Meisterin",
      imageSrc: "/images/house.png", // Replace with actual staff images
      description:
        "Mit über 20 Jahren Erfahrung leitet Jana den Salon mit Leidenschaft und Expertise. Spezialisiert auf moderne Schnitt- und Färbetechniken.",
    },
    {
      name: "Sarah Müller",
      role: "Color Specialist",
      imageSrc: "/images/house.png",
      description:
        "Sarah ist unsere Expertin für außergewöhnliche Colorationen und Balayage. Sie kreiert individuelle Farberlebnisse für jeden Haartyp.",
    },
    {
      name: "Tim Wagner",
      role: "Stylist",
      imageSrc: "/images/house.png",
      description:
        "Tim bringt frischen Wind in klassische Schnitte. Seine modernen Interpretationen von zeitlosen Styles begeistern unsere Kunden.",
    },
    {
      name: "Lisa Becker",
      role: "Hair Artist",
      imageSrc: "/images/house.png",
      description:
        "Lisa hat ein Händchen für kreative Hochsteckfrisuren und besondere Anlässe. Sie zaubert wahre Kunstwerke.",
    },
  ];

  const menuItems = useMemo(
    () => [
      { id: "uber-uns", text: "Über Uns" },
      { id: "service", text: "Service" },
      { id: "trends", text: "Trends" },
      { id: "haarprodukte", text: "Haarprodukte" },
      { id: "preise", text: "Preise" },
      { id: "team", text: "Unser Team" },
      { id: "booking", text: "Buchen" },
    ],
    []
  );

  // Handle menu chip click - scroll to section with offset
  const handleMenuClick = (sectionId: string) => {
    const section = sectionRefs.current[sectionId];
    if (section) {
      // Calculate offset for sticky header + menu chips
      const stickyHeaderHeight = showStickyLogo ? 76 : 0; // Height when logo is visible
      const menuChipsHeight = 68; // Approximate height of menu chip container
      const totalOffset = stickyHeaderHeight + menuChipsHeight + 20; // Extra 20px padding

      // Get the section's position
      const sectionTop =
        section.getBoundingClientRect().top + window.pageYOffset;
      const targetPosition = sectionTop - totalOffset;

      // Smooth scroll to the calculated position
      window.scrollTo({
        top: Math.max(0, targetPosition), // Don't scroll above the top
        behavior: "smooth",
      });
    }
  };

  // Scroll active chip into view
  const scrollActiveChipIntoView = useCallback(
    (activeId: string) => {
      if (menuChipContainerRef.current) {
        const activeIndex = menuItems.findIndex((item) => item.id === activeId);
        const container = menuChipContainerRef.current;
        const chipWidth = 120; // Approximate chip width
        const scrollLeft = Math.max(
          0,
          activeIndex * chipWidth - container.clientWidth / 2
        );

        container.scrollTo({
          left: scrollLeft,
          behavior: "smooth",
        });
      }
    },
    [menuItems]
  );

  // Intersection Observer to detect which section is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const sortedEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => {
            return a.boundingClientRect.top - b.boundingClientRect.top;
          });

        if (sortedEntries.length > 0) {
          const mostVisibleEntry = sortedEntries[0];
          const id = mostVisibleEntry.target.id;
          setActiveSection(id);
          scrollActiveChipIntoView(id);
        }
      },
      {
        threshold: [0],
        rootMargin: "-50% 0px -50% 0px",
      }
    );

    // Observe all sections
    Object.values(sectionRefs.current).forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [scrollActiveChipIntoView]);

  // Observe hero section for sticky logo visibility
  useEffect(() => {
    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setShowStickyLogo(!entry.isIntersecting);
        });
      },
      {
        threshold: 0,
      }
    );

    if (heroRef.current) {
      heroObserver.observe(heroRef.current);
    }

    return () => heroObserver.disconnect();
  }, []);

  return (
    <div>
      <menu className={styles.hero} ref={heroRef}>
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

      <div
        className={`sticky top-0 z-20 h-[142px] flex items-end transition-all ${showStickyLogo ? "bg-bg shadow-lg shadow-black/20" : "bg-bg-dark"} transition-colors`}
      >
        <div
          className={`${styles.stickyLogo} ${showStickyLogo ? styles.visible : ""}`}
        >
          <Image src={"/images/logo.png"} alt="logo" width={60} height={60} />
        </div>
        <div
          className={`scroll-smooth overflow-x-auto whitespace-nowrap flex gap-2 hide-scrollbar p-4 justify-start ${showStickyLogo ? "pt-[92px]" : ""} transition-all`}
          ref={menuChipContainerRef}
        >
          {menuItems.map((item) => (
            <MenuChip
              key={item.id}
              active={activeSection === item.id}
              text={item.text}
              onClick={() => handleMenuClick(item.id)}
            />
          ))}
        </div>
      </div>

      {/* Mock Content Sections */}

      <div
        id="uber-uns"
        ref={(el) => {
          sectionRefs.current["uber-uns"] = el;
        }}
      >
        <ImageTextSection
          header="Über Uns"
          text="Wir von Jana & Friseure verstehen uns weder als Designer noch als Künstler, sondern als klassisch ausgebildete HandwerkerInnen mit Lust an Kreativität und Innovation. Auf Individuelle Beratung legen wir dabei sehr großen Wert. Bei Neukunden nehmen wir uns deshalb für das Kennenlernen möglichst viel Zeit. Ebenso wichtig ist für uns, mit den Stammkunden im Gespräch zu bleiben, denn Menschen verändern sich. Die Kunst liegt darin, aus der Vielzahl der Möglichkeiten genau das Richtige für den Moment und für den jeweiligen Typ auszuwählen und zu realisieren, ohne sich zu sehr durch modische Spielereien ablenken zu lassen. Kurz gesagt – unsere Kunden sollen sich beim Besuch und mit unseren Frisuren rundum wohlfühlen!"
          imageSrc="/images/house.png"
          imageAlt="Über Uns"
        />
      </div>

      <div
        id="service"
        ref={(el) => {
          sectionRefs.current["service"] = el;
        }}
      >
        <ImageTextSection
          header="Unsere Services"
          text="Von klassischen Haarschnitten bis hin zu modernen Colorationen - wir
          bieten das komplette Spektrum professioneller Friseurleistungen. Ob
          Waschen, Schneiden, Föhnen, Färben oder spezielle Behandlungen für Ihr
          Haar - bei uns sind Sie in den besten Händen."
          imageSrc="/images/house.png"
          imageAlt="Unsere Services"
        />
      </div>

      <div
        id="trends"
        ref={(el) => {
          sectionRefs.current["trends"] = el;
        }}
      >
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

      <div
        id="haarprodukte"
        ref={(el) => {
          sectionRefs.current["haarprodukte"] = el;
        }}
      >
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

      <div
        id="preise"
        ref={(el) => {
          sectionRefs.current["preise"] = el;
        }}
      >
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
      <div
        id="team"
        ref={(el) => {
          sectionRefs.current["team"] = el;
        }}
        className="py-16 bg-bg-light/30"
      >
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
          <StaffSlider
            staffMembers={staffMembers}
            onStaffClick={setSelectedStaff}
          />
        </div>
      </div>

      {/* Booking Modal */}
      {selectedStaff !== null && (
        <BookingModal
          isOpen={selectedStaff !== null}
          onClose={() => setSelectedStaff(null)}
          staffMember={staffMembers[selectedStaff]}
        />
      )}

      <div
        id="booking"
        ref={(el) => {
          sectionRefs.current["booking"] = el;
        }}
        className="max-w-5xl bg-bg mx-auto rounded-xl my-10 shadow-lg shadow-black/20 inset-shadow-md inset-shadow-fg/20 p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-10"
      >
        <div>
          <h2 className="text-xl font-semibold text-fg">Jetzt Kontaktieren</h2>
          <input
            type="text"
            name="Name"
            id="name"
            placeholder="Name *"
            className="bg-bg-light rounded-lg text-lg p-2 focus:outline-fg text-fg block w-full my-2 inset-shadow-sm inset-shadow-bg-dark/20"
          />
          <input
            type="email"
            name="E-Mail"
            id="email"
            placeholder="E-Mail *"
            className="bg-bg-light rounded-lg text-lg p-2 focus:outline-fg text-fg w-full my-2 inset-shadow-sm inset-shadow-bg-dark/20"
          />
          <input
            type="tel"
            name="Telefon"
            id="phone"
            placeholder="Telefon"
            className="bg-bg-light rounded-lg text-lg p-2 focus:outline-fg text-fg w-full my-2 inset-shadow-sm inset-shadow-bg-dark/20"
          />
        </div>
        <div className="py-2">
          <textarea
            name="Message"
            id="message"
            placeholder="Nachricht"
            className="bg-bg-light rounded-lg text-lg p-2 focus:outline-fg text-fg block w-full resize-none inset-shadow-sm inset-shadow-bg-dark/20 h-full"
          ></textarea>
        </div>
        <button
          type="button"
          className="bg-fg text-bg rounded-lg px-6 py-3 font-semibold shadow-lg shadow-bg-dark/20 hover:opacity-90 transition md:col-span-2 right-0 inset-shadow-sm inset-shadow-white cursor-pointer"
          onClick={() => {
            alert("Nachricht gesendet");
          }}
        >
          Nachricht senden
        </button>
      </div>
    </div>
  );
}
