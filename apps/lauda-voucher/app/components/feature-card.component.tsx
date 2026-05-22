import type { MouseEventHandler } from "react";

type FeatureCardVariant = "primary" | "dark" | "outline";

const variantClasses: Record<
  FeatureCardVariant,
  {
    container: string;
    header: string;
    caption: string;
    text: string;
  }
> = {
  primary: {
    container: "bg-primary text-white shadow-[0_14px_34px_rgba(204,0,0,0.22)]",
    header: "text-white/70",
    caption: "text-white",
    text: "text-white/85",
  },
  dark: {
    container: "bg-accent text-white shadow-[0_14px_34px_rgba(31,44,61,0.2)]",
    header: "text-white/70",
    caption: "text-white",
    text: "text-white/85",
  },
  outline: {
    container:
      "border-2 border-primary bg-white text-accent shadow-[0_14px_34px_rgba(31,44,61,0.12)]",
    header: "text-primary/70",
    caption: "text-primary",
    text: "text-accent/75",
  },
};

type FeatureCardProps = {
  header: string;
  caption: string;
  text: string;
  variant: FeatureCardVariant;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
};

export function FeatureCard({
  header,
  caption,
  text,
  variant,
  onClick,
  className = "",
}: FeatureCardProps) {
  const classes = variantClasses[variant];

  const content = (
    <>
      <p className={`text-xs uppercase tracking-[0.28em] ${classes.header}`}>
        {header}
      </p>
      <h3 className={`mt-2 text-xl ${classes.caption}`}>{caption}</h3>
      <p className={`mt-3 text-sm leading-relaxed ${classes.text}`}>{text}</p>
    </>
  );

  const sharedClassName = `rounded-[1.5rem] px-5 py-6 text-left ${classes.container} ${className}`;

  if (onClick) {
    return (
      <button type="button" className={sharedClassName} onClick={onClick}>
        {content}
      </button>
    );
  }

  return <div className={sharedClassName}>{content}</div>;
}
