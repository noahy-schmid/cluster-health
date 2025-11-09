"use client";

import Image from "next/image";
import styles from "../styles/menu.module.css";
import { CircleChevronDown } from "lucide-react";
import MenuChip from "@/components/menu-chip";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";

export default function Home() {
	const [activeSection, setActiveSection] = useState("uber-uns");
	const [showStickyLogo, setShowStickyLogo] = useState(false);
	const menuChipContainerRef = useRef<HTMLDivElement>(null);
	const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
	const heroRef = useRef<HTMLElement>(null);

	const menuItems = useMemo(
		() => [
			{ id: "uber-uns", text: "Über Uns" },
			{ id: "service", text: "Service" },
			{ id: "trends", text: "Trends" },
			{ id: "haarprodukte", text: "Haarprodukte" },
			{ id: "preise", text: "Preise" },
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
			const sectionTop = section.getBoundingClientRect().top + window.pageYOffset;
			const targetPosition = sectionTop - totalOffset;
			
			// Smooth scroll to the calculated position
			window.scrollTo({
				top: Math.max(0, targetPosition), // Don't scroll above the top
				behavior: "smooth"
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
					width={500}
					height={300}
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
				className={`sticky top-0 z-20 h-[142px] flex items-end  ${showStickyLogo ? "bg-bg shadow-lg" : "bg-bg-dark"} transition-colors`}
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
			<section
				id="uber-uns"
				className={styles.contentSection}
				ref={(el) => {
					sectionRefs.current["uber-uns"] = el;
				}}
			>
				<h2>Über Uns</h2>
				<p>
					Willkommen in unserem exklusiven Friseursalon! Mit über 15 Jahren
					Erfahrung in der Haar- und Stylingbranche bieten wir Ihnen
					professionelle Beratung und erstklassige Dienstleistungen. Unser Team
					aus qualifizierten Stylisten sorgt dafür, dass Sie sich bei uns rundum
					wohlfühlen.
				</p>
			</section>

			<section
				id="service"
				className={styles.contentSection}
				ref={(el) => {
					sectionRefs.current["service"] = el;
				}}
			>
				<h2>Unsere Services</h2>
				<p>
					Von klassischen Haarschnitten bis hin zu modernen Colorationen - wir
					bieten das komplette Spektrum professioneller Friseurleistungen. Ob
					Waschen, Schneiden, Föhnen, Färben oder spezielle Behandlungen für Ihr
					Haar - bei uns sind Sie in den besten Händen.
				</p>
			</section>

			<section
				id="trends"
				className={styles.contentSection}
				ref={(el) => {
					sectionRefs.current["trends"] = el;
				}}
			>
				<h2>Aktuelle Trends</h2>
				<p>
					Bleiben Sie immer up-to-date mit den neuesten Haar-Trends! Unser Team
					besucht regelmäßig Weiterbildungen und Trend-Seminare, um Ihnen die
					aktuellsten Schnitt- und Farbtechniken anbieten zu können. Von
					Balayage bis zu den neuesten Kurzhaarschnitten - wir setzen Trends um.
				</p>
			</section>

			<section
				id="haarprodukte"
				className={styles.contentSection}
				ref={(el) => {
					sectionRefs.current["haarprodukte"] = el;
				}}
			>
				<h2>Hochwertige Haarprodukte</h2>
				<p>
					Wir verwenden ausschließlich Produkte von renommierten Marken, die für
					Qualität und Nachhaltigkeit stehen. In unserem Salon finden Sie eine
					sorgfältig ausgewählte Produktpalette für die optimale Pflege Ihres
					Haares zu Hause. Gerne beraten wir Sie bei der Auswahl der richtigen
					Produkte.
				</p>
			</section>

			<section
				id="preise"
				className={styles.contentSection}
				ref={(el) => {
					sectionRefs.current["preise"] = el;
				}}
			>
				<h2>Faire Preise</h2>
				<p>
					Qualität muss nicht teuer sein! Wir bieten Ihnen transparente und
					faire Preise für alle unsere Dienstleistungen. Ob Student, Senior oder
					Familie - bei uns gibt es attraktive Rabatte und Angebote. Vereinbaren
					Sie einen Termin und lassen Sie sich unverbindlich beraten.
				</p>
			</section>
		</div>
	);
}
