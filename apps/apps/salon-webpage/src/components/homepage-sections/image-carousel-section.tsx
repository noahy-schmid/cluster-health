"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

export default function ImageCarouselSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isScrolling = useRef(false);

  // Mock images - same image repeated for now
  const images = [
    { src: "/images/hidden_twist.png", alt: "Salon Image 1" },
    { src: "/images/perfect_groom.png", alt: "Salon Image 2" },
    { src: "/images/ruffle_cut.png", alt: "Salon Image 3" },
    { src: "/images/texture_crush.png", alt: "Salon Image 4" },
    { src: "/images/twisted_curls.png", alt: "Salon Image 5" },
    { src: "/images/untamed_braid.png", alt: "Salon Image 6" },
  ];

  // Create infinite loop by tripling the images
  const infiniteImages = [...images, ...images, ...images];

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
    setCurrentIndex((prev) => prev + 1);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => prev - 1);
  };

  // Update current index based on scroll position
  const updateCurrentIndex = () => {
    if (!sliderRef.current || isScrolling.current) return;

    const container = sliderRef.current;
    const scrollLeft = container.scrollLeft;
    const containerWidth = container.clientWidth;

    // Find which image is most centered
    let closestIndex = 0;
    let closestDistance = Infinity;

    const imageElements = container.querySelectorAll("[data-image-index]");
    imageElements.forEach((img, index) => {
      const imgElement = img as HTMLElement;
      const imgLeft = imgElement.offsetLeft;
      const imgWidth = imgElement.offsetWidth;
      const imgCenter = imgLeft + imgWidth / 2;
      const containerCenter = scrollLeft + containerWidth / 2;
      const distance = Math.abs(imgCenter - containerCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setCurrentIndex(closestIndex);

    // Determine which section we're in based on the index
    const section = Math.floor(closestIndex / images.length);

    // If we're in the first section (0) or third section (2), jump to the same image in the second section (1)
    if (section !== 1) {
      const imageInSection = closestIndex % images.length;
      const targetIndex = images.length + imageInSection; // Index in the second section

      // Jump instantly without animation by temporarily removing scroll-smooth
      const targetElement = imageElements[targetIndex] as HTMLElement;
      if (targetElement) {
        const targetLeft = targetElement.offsetLeft;
        const targetWidth = targetElement.offsetWidth;
        const targetCenter = targetLeft + targetWidth / 2;
        const newScrollPosition = targetCenter - containerWidth / 2;

        // Remove smooth scrolling temporarily
        container.style.scrollBehavior = "auto";
        container.scrollLeft = newScrollPosition;
        setCurrentIndex(targetIndex);

        // Restore smooth scrolling after a brief delay
        setTimeout(() => {
          container.style.scrollBehavior = "smooth";
        }, 50);
      }
    }
  };

  // Initialize scroll position to the middle set
  useEffect(() => {
    setCurrentIndex(images.length);
  }, [images.length, isDesktop]);

  // Handle scroll end to snap to nearest image
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
  }, []);

  // Scroll to center the image when currentIndex changes
  useEffect(() => {
    if (!sliderRef.current) return;

    isScrolling.current = true;
    const container = sliderRef.current;
    const imageElements = container.querySelectorAll("[data-image-index]");
    const targetImage = imageElements[currentIndex] as HTMLElement;

    if (targetImage) {
      const containerWidth = container.clientWidth;
      const imageLeft = targetImage.offsetLeft;
      const imageWidth = targetImage.offsetWidth;
      const imageCenter = imageLeft + imageWidth / 2;
      const scrollPosition = imageCenter - containerWidth / 2;

      container.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }

    // Reset scrolling flag after animation
    setTimeout(() => {
      isScrolling.current = false;
    }, 300);
  }, [currentIndex]);

  return (
    <section className="border-b py-8 border-fg/30 relative">
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <h2 className="text-xl font-semibold text-fg text-center">
          Unsere Galerie
        </h2>
        <p className="text-p text-fg opacity-90 text-center">
          Entdecken Sie unsere schönsten Arbeiten
        </p>
      </div>

      <div className="relative">
        {/* Slider Container */}
        <div
          ref={sliderRef}
          className="overflow-x-auto overflow-y-hidden snap-x snap-mandatory hide-scrollbar"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div className="flex gap-4">
            {infiniteImages.map((image, index) => (
              <div
                key={index}
                data-image-index={index}
                className="flex-shrink-0 snap-center w-[300px] md:w-[400px] h-[400px] md:h-[500px] relative rounded-lg overflow-hidden"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons - Desktop Only */}
        {isDesktop && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-fg text-bg rounded-full p-3 shadow-lg hover:opacity-90 transition z-10"
              aria-label="Previous"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-fg text-bg rounded-full p-3 shadow-lg hover:opacity-90 transition z-10"
              aria-label="Next"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
