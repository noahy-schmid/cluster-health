"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import StaffCard from "./staff-card";
import { StaffMemberBasic } from "@/lib/types/staff";

interface StaffSliderProps {
  staffMembers: StaffMemberBasic[];
}

export default function StaffSlider({ staffMembers }: StaffSliderProps) {
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
    setCurrentIndex((prev) => Math.min(prev + 1, staffMembers.length - 1));
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
  }, [staffMembers.length]);

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
      >
        <div className="flex gap-4 md:gap-6">
          <div className="block flex-shrink-0 w-[16px] md:w-[calc(50%-200px-12px)]"></div>

          {staffMembers.map((staff, index) => (
            <div
              key={index}
              data-card-index={index}
              className={`flex-shrink-0 snap-center w-[calc(100%-64px)] md:w-[400px] py-4`}
            >
              <StaffCard
                name={staff.name}
                role={staff.role}
                imageSrc={staff.imageSrc}
                specialistId={staff.id}
              />
            </div>
          ))}

          <div className="block flex-shrink-0 w-[16px] md:w-[calc(50%-200px-12px)]"></div>
        </div>
      </div>

      {/* Navigation Buttons */}
      {isDesktop && currentIndex > 0 && (
        <button
          onClick={goToPrevious}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-fg text-bg rounded-full p-3 shadow-lg hover:opacity-90 transition z-10 m-2"
          aria-label="Previous"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {isDesktop && currentIndex < staffMembers.length - 1 && (
        <button
          onClick={goToNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-fg text-bg rounded-full p-3 shadow-lg hover:opacity-90 transition z-10 m-2"
          aria-label="Next"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Pagination Dots - One per card */}
      <div className="flex justify-center gap-2 mt-6 flex-wrap">
        {staffMembers.map((_, index) => (
          <button
            key={index}
            onClick={() => goToCard(index)}
            className={`transition-all ${
              index === currentIndex
                ? "w-8 h-3 bg-fg"
                : "w-3 h-3 bg-fg/30 hover:bg-fg/50"
            } rounded-full`}
            aria-label={`Go to ${staffMembers[index].name}`}
          />
        ))}
      </div>
    </div>
  );
}
