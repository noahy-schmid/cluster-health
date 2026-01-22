export default function FeatureListSection() {
  const features = [
    {
      title: "Beratung",
      description: "Zuhören, Wünsche erkennen und typgerecht beraten.",
      icon: "💬",
    },
    {
      title: "Haarschnitte",
      description: "Haarstyling und Haarschnitte mit Konzept.",
      icon: "✂️",
    },
    {
      title: "Färben",
      description: "Strähnentechniken, Tönen und Färben.",
      icon: "🎨",
    },
    {
      title: "Frisieren",
      description:
        "Vom Barttrimmen, Augenbrauenzupfen, einfachen Frisieren über Dauerwellen bis zu Hochsteckfrisuren.",
      icon: "💇‍♀️",
    },
  ];

  return (
    <section
      className={
        "border-b px-4 py-8 max-w-7xl mx-auto border-fg/30 items-center gap-10 md:gap-20"
      }
    >
      <div className="text-center">
        <h2 className="text-xl font-semibold text-fg">Unsere Services</h2>
        <p className="text-p text-fg opacity-90">
          Entdecken Sie unser vielfältiges Angebot an professionellen
          Friseurleistungen, die individuell auf Ihre Bedürfnisse abgestimmt
          sind.
        </p>
      </div>
      <div className="flex justify-evenly mt-8 flex-wrap gap-6">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="text-center flex flex-col items-center flex-1"
          >
            <div className="text-6xl bg-bg-layer-2 h-40 w-40 rounded-full flex items-center justify-center mb-4 hover:bg-bg-layer-3 transition-all duration-200 hover:shadow-lg shadow-black/20 cursor-default">
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold text-fg">{feature.title}</h3>
            <p className="text-p text-fg opacity-90">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
