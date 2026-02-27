"use client";

import { useEffect, useRef, ReactNode } from "react";
import FlatIconButton from "@/components/buttons/FlatIconButton";
import { XIcon } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" />
      <div
        ref={modalRef}
        className="relative bg-bg-1 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-border"
      >
        <div className="flex items-center justify-between p-md border-b border-border">
          {title && (
            <h2 className="text-lg font-focus text-fg-normal">{title}</h2>
          )}
          <FlatIconButton
            icon={XIcon}
            onClick={onClose}
            elevation={1}
            ariaLabel="Close modal"
          />
        </div>
        <div className="p-md overflow-y-auto max-h-[calc(90vh-60px)]">
          {children}
        </div>
      </div>
    </div>
  );
}
