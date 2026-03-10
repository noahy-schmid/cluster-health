"use client";

import { useState, useRef, useEffect } from "react";
import StylistCard from "./stylist-card";
import ChevronButton from "../chevron-button";

interface StylistMember {
  id: string;
  name: string;
  role: string;
  imageSrc?: string;
}

interface StylistsSliderProps {
  stylists: StylistMember[];
}

export default function StylistsSlider({ stylists }: StylistsSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  // Detect screen size
  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkIsDesktop();
    window.addEventListener("resize", checkIsDesktop);

    return () => window.removeEventListener("resize", checkIsDesktop);
  }, []);

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, stylists.length - 1));
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const goToCard = (index: number) => {
    setCurrentIndex(index);
  };

  // Update current index based on scroll position
  const updateCurrentIndex = () => {
    if (!sliderRef.current || isScrolling.current) return;

    const container = sliderRef.current;
    const scrollLeft = container.scrollLeft;
    const containerWidth = container.clientWidth;

    // Find which card is most centered
    let closestIndex = 0;
    let closestDistance = Infinity;

    const cards = container.querySelectorAll("[data-card-index]");
    cards.forEach((card, index) => {
      const cardElement = card as HTMLElement;
      const cardLeft = cardElement.offsetLeft;
      const cardWidth = cardElement.offsetWidth;
      const cardCenter = cardLeft + cardWidth / 2;
      const containerCenter = scrollLeft + containerWidth / 2;
      const distance = Math.abs(cardCenter - containerCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setCurrentIndex(closestIndex);
  };

  // Handle scroll end to snap to nearest card
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        updateCurrentIndex();
      }, 150);
    };

    slider.addEventListener("scroll", handleScroll);

    return () => {
      slider.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [stylists.length]);

  // Scroll to center the card when currentIndex changes
  useEffect(() => {
    if (!sliderRef.current) return;

    isScrolling.current = true;
    const container = sliderRef.current;
    const cards = container.querySelectorAll("[data-card-index]");
    const targetCard = cards[currentIndex] as HTMLElement;

    if (targetCard) {
      const containerWidth = container.clientWidth;
      const cardLeft = targetCard.offsetLeft;
      const cardWidth = targetCard.offsetWidth;
      const cardCenter = cardLeft + cardWidth / 2;
      const scrollPosition = cardCenter - containerWidth / 2;

      // Calculate max scroll (total scrollable area)
      const maxScroll = container.scrollWidth - containerWidth;

      container.scrollTo({
        left: Math.max(0, Math.min(scrollPosition, maxScroll)),
        behavior: "smooth",
      });
    }

    // Reset scrolling flag after animation
    setTimeout(() => {
      isScrolling.current = false;
    }, 300);
  }, [currentIndex]);

  return (
    <div className="relative w-full">
      {/* Slider Container */}
      <div
        ref={sliderRef}
        className="overflow-x-auto overflow-y-hidden snap-x snap-mandatory hide-scrollbar scroll-smooth"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
        role="region"
        aria-label="Stylist Carousel"
      >
        <div className="flex gap-4 md:gap-6">
          <div className="block flex-shrink-0 w-[16px] md:w-[calc(50%-200px-12px)]"></div>

          {stylists.map((stylist, index) => (
            <div
              key={stylist.id}
              data-card-index={index}
              className={`flex-shrink-0 snap-center w-[calc(100%-64px)] md:w-[400px] py-4`}
            >
              <StylistCard
                name={stylist.name}
                role={stylist.role}
                imageSrc={stylist.imageSrc}
              />
            </div>
          ))}

          <div className="block flex-shrink-0 w-[16px] md:w-[calc(50%-200px-12px)]"></div>
        </div>
      </div>

      {/* Navigation Buttons */}
      {isDesktop && currentIndex > 0 && (
        <ChevronButton
          onClick={goToPrevious}
          ariaLabel="Previous"
          direction="left"
        />
      )}

      {isDesktop && currentIndex < stylists.length - 1 && (
        <ChevronButton onClick={goToNext} ariaLabel="Next" direction="right" />
      )}

      {/* Pagination Dots - One per card */}
      <div className="flex justify-center gap-2 mt-6 flex-wrap">
        {stylists.map((stylist, index) => (
          <button
            key={stylist.id}
            onClick={() => goToCard(index)}
            className={`transition-all ${
              index === currentIndex
                ? "w-8 h-3 bg-salon-fg-base"
                : "w-3 h-3 bg-salon-fg-base/30 hover:bg-salon-fg-base/50"
            } rounded-full`}
            aria-label={`Go to ${stylist.name}`}
          />
        ))}
      </div>
    </div>
  );
}
