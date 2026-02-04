import { LucideIcon } from "lucide-react";

interface PageHeaderAction {
  icon: LucideIcon;
  text: string;
  onClick: () => void;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: PageHeaderAction[];
}

export default function PageHeader({
  title,
  subtitle,
  actions,
}: PageHeaderProps) {
  return (
    <div className="my-xl">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-md">
        <div>
          <h1 className="text-3xl font-focus font-brand text-fg-brand">
            {title}
          </h1>
          {subtitle && <p className="text-base text-fg-muted">{subtitle}</p>}
        </div>
        {actions && actions.length > 0 && (
          <div className="flex gap-sm">
            {actions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.onClick}
                  className="p-sm flex items-center rounded-md hover:bg-bg-1 text-fg-muted hover:text-fg-normal font-normal text-base gap-sm cursor-pointer"
                >
                  <Icon className="w-8 h-8 " />
                  {action.text}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
