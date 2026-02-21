"use client";

import { LucideIcon, MoreVertical } from "lucide-react";
import { useState } from "react";
import Dropdown, { DropdownItem } from "./Dropdown";

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const hasMultipleActions = actions && actions.length > 1;

  return (
    <div className="my-xl">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-md">
        <div className="flex items-start justify-between gap-md flex-1">
          <div>
            <h1 className="text-3xl font-focus font-brand text-fg-brand">
              {title}
            </h1>
            {subtitle && <p className="text-base text-fg-muted">{subtitle}</p>}
          </div>

          {/* Show dropdown menu on both mobile and desktop when there are multiple actions */}
          {actions && actions.length > 0 && hasMultipleActions && (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="p-sm flex items-center rounded-md hover:bg-bg-1 text-fg-muted hover:text-fg-normal font-normal text-base cursor-pointer"
                aria-label="Actions menu"
              >
                <MoreVertical className="w-8 h-8" />
              </button>

              <Dropdown
                isOpen={isDropdownOpen}
                onClose={() => setIsDropdownOpen(false)}
                items={actions as DropdownItem[]}
              />
            </div>
          )}
        </div>

        {/* Single action: Show dropdown on mobile, inline button on desktop */}
        {actions && actions.length > 0 && !hasMultipleActions && (
          <>
            {/* Mobile: dropdown */}
            <div className="relative md:hidden">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="p-sm flex items-center rounded-md hover:bg-bg-1 text-fg-muted hover:text-fg-normal font-normal text-base cursor-pointer"
                aria-label="Actions menu"
              >
                <MoreVertical className="w-8 h-8" />
              </button>
              <Dropdown
                isOpen={isDropdownOpen}
                onClose={() => setIsDropdownOpen(false)}
                items={actions as DropdownItem[]}
              />
            </div>
            {/* Desktop: inline button */}
            <div className="hidden md:block">
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
          </>
        )}
      </div>
    </div>
  );
}
