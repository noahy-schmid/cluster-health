import { LucideIcon } from "lucide-react";

interface PrimaryIconTextButtonProps {
  icon: LucideIcon;
  text: string;
  onClick: () => void;
  isDisabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

export default function PrimaryIconTextButton({
  icon: Icon,
  text,
  onClick,
  isDisabled = false,
  ariaLabel,
  className = "",
}: PrimaryIconTextButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`flex items-center justify-center gap-sm px-md py-sm rounded-md bg-primary-700 text-bg-2 font-medium text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-800 transition-colors ${className}`}
      aria-label={ariaLabel || text}
    >
      <Icon className="w-icon-base h-icon-base" />
      {text}
    </button>
  );
}
