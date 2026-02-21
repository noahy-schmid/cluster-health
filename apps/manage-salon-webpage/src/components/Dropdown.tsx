"use client";

import { LucideIcon } from "lucide-react";
import { useRef, useEffect } from "react";

export interface DropdownItem {
  icon: LucideIcon;
  text: string;
  onClick: () => void;
}

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  items: DropdownItem[];
}

export default function Dropdown({ isOpen, onClose, items }: DropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-xs bg-bg-1 rounded-lg shadow-lg border border-border min-w-[250px] max-w-[300px] z-50"
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.text}
            onClick={() => {
              item.onClick();
              onClose();
            }}
            className="w-full p-md flex items-center gap-sm hover:bg-bg-2 text-fg-muted hover:text-fg-normal font-normal text-base cursor-pointer first:rounded-t-lg last:rounded-b-lg"
          >
            <Icon className="w-6 h-6" />
            {item.text}
          </button>
        );
      })}
    </div>
  );
}
