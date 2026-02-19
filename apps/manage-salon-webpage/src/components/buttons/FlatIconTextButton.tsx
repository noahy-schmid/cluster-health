import { LucideIcon } from "lucide-react";

type Elevation = 0 | 1;

interface FlatIconTextButtonProps {
  icon: LucideIcon;
  text: string;
  onClick: () => void;
  elevation: Elevation;
  isError?: boolean;
  ariaLabel?: string;
}

/**
 * A reusable icon + text button component with elevation-based hover states
 *
 * @param icon - Lucide icon component to render
 * @param text - Text to display next to the icon
 * @param onClick - Click handler function
 * @param elevation - Hover background intensity (0=subtle, 1=medium)
 * @param isError - Whether to use error styling (red colors). Default: false
 * @param ariaLabel - Optional accessibility label for screen readers (defaults to text)
 */
export default function FlatIconTextButton({
  icon: Icon,
  text,
  onClick,
  elevation,
  isError = false,
  ariaLabel,
}: FlatIconTextButtonProps) {
  const getBgClass = () => {
    if (isError) {
      return elevation === 0
        ? "bg-bg-error-1 lg:bg-transparent lg:hover:bg-bg-error-1"
        : "bg-bg-error-2 lg:bg-transparent lg:hover:bg-bg-error-2";
    }

    return elevation === 0
      ? "bg-bg-1 lg:bg-transparent lg:hover:bg-bg-1"
      : "bg-bg-2 lg:bg-transparent lg:hover:bg-bg-2";
  };

  const getTextColorClass = () => {
    if (isError) {
      return "text-fg-error lg:text-fg-muted lg:hover:text-fg-error";
    }
    return "text-fg-normal lg:text-fg-muted lg:hover:text-fg-normal";
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-sm p-sm rounded-md cursor-pointer ${getBgClass()} ${getTextColorClass()} w-full`}
      aria-label={ariaLabel || text}
    >
      <Icon className="w-icon-base h-icon-base" />
      {text}
    </button>
  );
}
