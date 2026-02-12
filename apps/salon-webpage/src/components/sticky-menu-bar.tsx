/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import MenuChip from "@/components/menu-chip";
import styles from "../styles/menu.module.css";

export interface MenuItem {
  id: string;
  text: string;
}

interface StickyMenuBarProps {
  menuItems: MenuItem[];
  logoUrl: string;
}

export default function StickyMenuBar({
  menuItems,
  logoUrl,
}: StickyMenuBarProps) {
  const [activeSection, setActiveSection] = useState(
    menuItems.length > 0 ? menuItems[0].id : "",
  );
  const [showStickyLogo, setShowStickyLogo] = useState(false);
  const menuChipContainerRef = useRef<HTMLDivElement>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);

  // Handle menu chip click - scroll to section with offset
  const handleMenuClick = (sectionId: string) => {
    const section = document.getElementById(sectionId);
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
          activeIndex * chipWidth - container.clientWidth / 2,
        );

        container.scrollTo({
          left: scrollLeft,
          behavior: "smooth",
        });
      }
    },
    [menuItems],
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
      },
    );

    // Observe all sections by their IDs
    menuItems.forEach((item) => {
      const section = document.getElementById(item.id);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [scrollActiveChipIntoView, menuItems]);

  // Check menu bar position to determine if logo should be visible
  useEffect(() => {
    const handleScroll = () => {
      if (menuBarRef.current) {
        const menuBarRect = menuBarRef.current.getBoundingClientRect();
        if (placeholderRef.current) {
          const placeholderRect =
            placeholderRef.current.getBoundingClientRect();

          setShowStickyLogo(menuBarRect.top <= 0 && placeholderRect.top <= 0);
        } else {
          setShowStickyLogo(menuBarRect.top <= 0);
        }
      }
    };

    // Initial check
    handleScroll();

    // Add scroll listener
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <div
        ref={menuBarRef}
        className={`top-0 z-20 flex items-end ${
          showStickyLogo
            ? "bg-salon-bg-2 shadow-lg shadow-black/20 fixed w-full h-[150px] transition-all"
            : "bg-salon-bg-base h-[100px] transition-colors"
        }`}
      >
        <div
          className={`${styles.stickyLogo} ${showStickyLogo ? styles.visible : ""}`}
        >
          <img src={logoUrl} alt="logo" width={60} height={60} />
        </div>
        <div
          className={`scroll-smooth overflow-x-auto whitespace-nowrap flex gap-2 hide-scrollbar p-4 justify-start ${
            showStickyLogo ? "pt-[92px]" : ""
          } transition-all`}
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

      {/* Spacer to prevent content jump when menu becomes fixed */}
      {showStickyLogo && <div className="h-[100px]" ref={placeholderRef}></div>}
    </>
  );
}
