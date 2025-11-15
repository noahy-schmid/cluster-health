"use client";

interface DateChipProps {
  date: Date;
  isSelected?: boolean;
  onClick?: () => void;
}

export default function DateChip({
  date,
  isSelected = false,
  onClick,
}: DateChipProps) {
  const getDateLabel = (date: Date): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // Check if it's today
    if (targetDate.getTime() === today.getTime()) {
      return "Heute";
    }

    // Check if it's tomorrow
    if (targetDate.getTime() === tomorrow.getTime()) {
      return "Morgen";
    }

    // For other dates, show weekday + date
    const weekdays = [
      "Sonntag",
      "Montag",
      "Dienstag",
      "Mittwoch",
      "Donnerstag",
      "Freitag",
      "Samstag",
    ];

    const weekday = weekdays[targetDate.getDay()];
    const day = targetDate.getDate();
    const month = targetDate.getMonth() + 1;

    return `${weekday}, ${day}.${month}.`;
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-all ${
        isSelected ? "bg-fg text-bg" : "bg-fg/10 text-fg hover:bg-fg/20"
      }`}
    >
      {getDateLabel(date)}
    </button>
  );
}
