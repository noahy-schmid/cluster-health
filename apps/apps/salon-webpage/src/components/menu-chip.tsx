interface MenuChipProps {
  active: boolean;
  text: string;
  onClick?: () => void;
}

export default function MenuChip({ active, text, onClick }: MenuChipProps) {
  return (
    <button
      className={`
				inline-block px-4 py-2 rounded-full 
				text-sm font-normal transition-all duration-300 ease-in-out cursor-pointer
				no-underline
				${
          active
            ? "bg-bg-light text-fg font-bold inset-shadow-sm inset-shadow-fg/20"
            : "bg-bg text-fg hover:bg-bg-light hover:text-fg hover:inset-shadow-sm hover:inset-shadow-bg-dark/20"
        }
			`}
      onClick={onClick}
    >
      {text}
    </button>
  );
}
