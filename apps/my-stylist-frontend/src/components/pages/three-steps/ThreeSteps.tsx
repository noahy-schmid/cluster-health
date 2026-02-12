interface StepProps {
  number: number;
  header: string;
  body: string;
}

interface ThreeStepsProps {
  title: string;
  steps: [StepProps, StepProps, StepProps];
  className?: string;
}

export default function ThreeSteps({
  title,
  steps,
  className = "",
}: ThreeStepsProps) {
  return (
    <div className={`max-w-6xl mx-auto bg-white rounded-2xl p-6 ${className}`}>
      <h2 className="text-3xl md:text-4xl font-bold font-sans text-primary-dark mb-8 text-center">
        {title}
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            <div className="rounded-full from-accent-1 to-accent-2 bg-gradient-to-br text-white font-bold text-2xl p-3 aspect-square w-16 flex items-center justify-center">
              {step.number}
            </div>
            <h4 className="font-sans text-2xl font-bold text-primary-dark mt-4">
              {step.header}
            </h4>
            <p className="text-gray-600 text-lg mt-2">{step.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
