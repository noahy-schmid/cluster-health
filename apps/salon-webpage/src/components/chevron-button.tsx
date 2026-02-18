import { ChevronLeft, ChevronRight } from "lucide-react";

interface ChevronButtonProps {
  onClick: () => void;
  ariaLabel: string;
  direction: "left" | "right";
}

export default function ChevronButton({
  onClick,
  ariaLabel,
  direction,
}: ChevronButtonProps) {
  const positionClasses =
    direction === "left" ? "left-0 md:left-4" : "right-0 md:right-4";

  return (
    <button
      onClick={onClick}
      className={`absolute ${positionClasses} top-1/2 -translate-y-1/2 bg-salon-fg-base text-salon-bg-base rounded-full p-3 shadow-lg hover:opacity-90 transition z-10 m-2 cursor-pointer`}
      aria-label={ariaLabel}
    >
      {direction === "left" ? (
        <ChevronLeft size={24} />
      ) : (
        <ChevronRight size={24} />
      )}
    </button>
  );
}
