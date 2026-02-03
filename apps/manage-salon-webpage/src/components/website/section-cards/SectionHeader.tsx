import MenuChip from "./MenuChip";

interface SectionHeaderProps {
  order: number;
  title: string;
  menuTitle: string | undefined;
}

export default function SectionHeader({
  order,
  title,
  menuTitle,
}: SectionHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-md">
      <div className="flex items-center gap-md">
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
          {order}
        </div>
        <div className="flex flex-row items-center gap-md">
          <h3 className="text-lg font-focus text-fg-strong">{title}</h3>
          <MenuChip menuTitle={menuTitle} />
        </div>
      </div>
    </div>
  );
}
