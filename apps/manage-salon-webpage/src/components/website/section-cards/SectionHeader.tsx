import MenuChip from "./MenuChip";

interface SectionHeaderProps {
  order?: number;
  title: string;
  menuTitle?: string;
}

export default function SectionHeader({
  order,
  title,
  menuTitle,
}: SectionHeaderProps) {
  return (
    <div className="mb-md">
      <div className="flex items-center gap-md">
        <div
          className={`w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium ${order !== undefined ? "" : "invisible"} flex-shrink-0`}
        >
          {order}
        </div>
        <div className="flex flex-row items-center justify-between flex-wrap flex-1">
          <h3 className="text-lg font-focus text-fg-strong">{title}</h3>
          <MenuChip menuTitle={menuTitle} />
        </div>
      </div>
    </div>
  );
}
