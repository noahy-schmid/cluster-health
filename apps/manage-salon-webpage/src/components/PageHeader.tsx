interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="my-xl">
      <h1 className="text-3xl font-focus font-brand text-fg-brand">{title}</h1>
      {subtitle && <p className="text-base text-text-muted">{subtitle}</p>}
    </div>
  );
}
