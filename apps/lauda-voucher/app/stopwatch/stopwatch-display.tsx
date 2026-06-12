export function StopwatchDisplay({
  value,
  className = "font-mono text-5xl tabular-nums text-accent sm:text-7xl",
}: {
  value: string;
  className?: string;
}) {
  return (
    <p className={`flex justify-center ${className}`} aria-live="off">
      {value.split("").map((char, index) => {
        const isSeparator = char === ":" || char === ".";
        return (
          <span
            key={index}
            className={`inline-flex justify-center ${
              isSeparator ? "w-[0.35em]" : "w-[0.62em]"
            }`}
          >
            {char}
          </span>
        );
      })}
    </p>
  );
}
