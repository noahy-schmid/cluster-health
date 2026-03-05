import { XIcon } from "lucide-react";

interface FlatChipProps {
  label: string;
  onDelete?: () => void;
  ariaLabel?: string;
}

/**
 * A reusable chip/tag component with optional delete action.
 *
 * @param label - Text to display in the chip
 * @param onDelete - Optional callback to remove the chip. Shows X icon when provided.
 * @param ariaLabel - Accessibility label for the delete button
 */
export default function FlatChip({
  label,
  onDelete,
  ariaLabel,
}: FlatChipProps) {
  return (
    <span className="flex items-center gap-sm bg-primary-100 text-primary-800 py-sm px-md rounded-md ">
      {label}
      {onDelete && (
        <button
          onClick={onDelete}
          className="cursor-pointer hover:text-fg-error"
          aria-label={ariaLabel ?? `${label} entfernen`}
        >
          <XIcon className="w-icon-base h-icon-base" />
        </button>
      )}
    </span>
  );
}
