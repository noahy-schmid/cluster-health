import { Menu } from "lucide-react";

interface MenuChipProps {
  menuTitle: string | undefined;
}

export default function MenuChip({ menuTitle }: MenuChipProps) {
  if (!menuTitle) {
    return null;
  }

  return (
    <div className="inline-flex items-center justify-start gap-1 p-sm bg-primary-100 text-fg-muted rounded-md text-sm font-normal">
      <Menu className="w-4 h-4" />
      <span>{menuTitle}</span>
    </div>
  );
}
