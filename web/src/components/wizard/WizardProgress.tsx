interface WizardProgressProps {
  stepNumber: number;
  totalSteps: number;
  stepLabel: string;
}

export function WizardProgress({ stepNumber, totalSteps, stepLabel }: WizardProgressProps) {
  const progressPct = Math.round((stepNumber / totalSteps) * 100);

  return (
    <div className="mb-8">
      <div className="mb-2 flex justify-between text-sm">
        <span className="font-medium text-ink">
          Passo {stepNumber} de {totalSteps}
        </span>
        <span className="text-ink-soft">{stepLabel}</span>
      </div>
      <div className="h-1.5 w-full bg-neutral-bar">
        <div
          className="h-full bg-accent-700 transition-all duration-200 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
}
