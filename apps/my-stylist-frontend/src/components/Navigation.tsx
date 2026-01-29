"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200 transition-all duration-300 py-4`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        {/* Logo/Title */}
        <div className="flex items-center">
          <h1
            className={`font-bold font-sans text-primary-dark transition-all duration-300 text-2xl`}
          >
            dein.salon
          </h1>
        </div>

        {/* Desktop Menu Items */}
        <div className="hidden md:flex items-center space-x-8">
          {/* About Link */}
          <Link
            href="#features"
            className="text-gray-700 hover:text-gray-900 transition-colors duration-200 font-medium"
          >
            Ihre Vorteile
          </Link>

          {/* Contact Link */}
          <Link
            href="#pricing"
            className="text-gray-700 hover:text-gray-900 transition-colors duration-200 font-medium"
          >
            Preis
          </Link>

          {/* CTA Button */}
          <Link
            href="#start"
            className="bg-primary-dark hover:bg-primary text-white px-8 py-3 rounded-md font-medium transition-colors duration-200"
          >
            Jetzt Starten
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden flex items-center px-3 py-2 text-gray-800 hover:text-gray-600 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-60 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            {/* Overlay */}
            <div className="absolute inset-0 h-screen bg-white">
              {/* Close button in top right */}
              <button
                className="absolute top-6 right-6 p-2 text-gray-800 hover:text-gray-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className="fi fi-br-cross"></i>
              </button>

              {/* Centered menu items */}
              <div className="flex flex-col items-center justify-center h-screen space-y-8">
                <Link
                  href="#hero"
                  className="text-gray-800 hover:text-blue-600 transition-colors duration-200 font-medium text-2xl"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Startseite
                </Link>
                <Link
                  href="#features"
                  className="text-gray-800 hover:text-blue-600 transition-colors duration-200 font-medium text-2xl"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Ihre Vorteile
                </Link>
                <Link
                  href="#pricing"
                  className="text-gray-800 hover:text-blue-600 transition-colors duration-200 font-medium text-2xl"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Preis
                </Link>
                <Link
                  href="#start"
                  className="bg-primary-dark hover:bg-primary text-white px-8 py-3 rounded-md font-medium transition-colors duration-200 text-xl"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Jetzt anfangen
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
