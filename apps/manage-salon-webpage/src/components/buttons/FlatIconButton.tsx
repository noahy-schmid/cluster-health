import { LucideIcon } from "lucide-react";

type Elevation = 0 | 1;
type IconButtonSize = "sm" | "md" | "lg";

interface IconButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  elevation: Elevation;
  isError?: boolean;
  ariaLabel: string;
  size?: IconButtonSize;
}

/**
 * A reusable icon button component with elevation-based hover states
 *
 * @param icon - Lucide icon component to render
 * @param onClick - Click handler function
 * @param elevation - Hover background intensity (0=none, 1=subtle, 2=medium). Default: 1
 * @param isError - Whether to use error styling (red colors). Default: false
 * @param ariaLabel - Accessibility label for screen readers
 * @param size - Size of the button (sm, md, lg). Default: md
 */
export default function FlatIconButton({
  icon: Icon,
  onClick,
  elevation,
  isError = false,
  ariaLabel,
  size = "md",
}: IconButtonProps) {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          padding: "p-0",
          icon: "w-icon-sm h-icon-sm",
        };
      case "lg":
        return {
          padding: "p-sm",
          icon: "w-icon-lg h-icon-lg",
        };
      case "md":
      default:
        return {
          padding: "p-sm",
          icon: "w-icon-base h-icon-base",
        };
    }
  };

  const sizeClasses = getSizeClasses();
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

  const getIconColorClass = () => {
    if (isError) {
      return "text-fg-error lg:text-fg-muted lg:group-hover:text-fg-error";
    }
    return "text-fg-normal lg:text-fg-muted lg:group-hover:text-fg-normal";
  };

  return (
    <button
      onClick={onClick}
      className={`${sizeClasses.padding} rounded group ${getBgClass()} cursor-pointer`}
      aria-label={ariaLabel}
    >
      <Icon className={`${sizeClasses.icon} ${getIconColorClass()}`} />
    </button>
  );
}
