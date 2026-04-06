"use client";

import { ChevronDown, User } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import type { StylistDto } from "./stylists/stylist.dto";

interface StylistSelectorProps {
  stylists: StylistDto[];
  selectedStylistId: string | null;
  onSelect: (stylistId: string | null) => void;
}

export function StylistSelector({
  stylists,
  selectedStylistId,
  onSelect,
}: StylistSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedStylist = stylists.find((s) => s.id === selectedStylistId);
  const label = selectedStylist?.name ?? "Alle Stylisten";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (stylists.length === 0) {
    return null;
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        aria-label="Stylist auswählen"
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-sm px-md py-sm rounded-md border border-border bg-bg-1 text-fg-normal text-sm font-medium hover:bg-bg-2 transition-colors min-w-[180px]"
      >
        <User className="w-4 h-4 text-fg-muted shrink-0" />
        <span className="flex-1 text-left truncate">{label}</span>
        <ChevronDown
          className={`w-4 h-4 text-fg-muted shrink-0 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-full min-w-[200px] bg-bg-1 rounded-lg border border-border shadow-md z-20">
          <button
            type="button"
            onClick={() => {
              onSelect(null);
              setIsOpen(false);
            }}
            className={`w-full px-md py-sm text-left text-sm hover:bg-bg-2 transition-colors first:rounded-t-lg ${
              selectedStylistId === null
                ? "text-fg-strong font-medium"
                : "text-fg-normal"
            }`}
          >
            Alle Stylisten
          </button>
          {stylists.map((stylist) => (
            <button
              key={stylist.id}
              type="button"
              onClick={() => {
                onSelect(stylist.id);
                setIsOpen(false);
              }}
              className={`w-full px-md py-sm text-left text-sm hover:bg-bg-2 transition-colors last:rounded-b-lg ${
                selectedStylistId === stylist.id
                  ? "text-fg-strong font-medium"
                  : "text-fg-normal"
              }`}
            >
              {stylist.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
