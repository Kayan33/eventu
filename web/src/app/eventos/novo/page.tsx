"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEventWizard } from "@/lib/hooks/useEventWizard";
import { Button } from "@/components/ui/Button";
import { WizardShell } from "@/components/wizard/WizardShell";
import { WizardProgress } from "@/components/wizard/WizardProgress";
import { StepEventInfo } from "./_components/StepEventInfo";
import { StepTickets } from "./_components/StepTickets";
import { StepPix } from "./_components/StepPix";
import { StepSuccess } from "./_components/StepSuccess";

export default function NewEventWizardPage() {
  const router = useRouter();
  const { actor, loading } = useAuth();
  const wizard = useEventWizard();

  const isAdmin = actor?.type === "user" && actor.role === "admin";

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace("/");
    }
  }, [loading, isAdmin, router]);

  if (loading || !isAdmin) {
    return null;
  }

  const { state } = wizard;

  return (
    <WizardShell>
      {state.done ? (
        <StepSuccess wizard={wizard} />
      ) : (
        <>
          <WizardProgress
            stepNumber={state.step}
            totalSteps={wizard.totalSteps}
            stepLabel={wizard.stepLabel}
          />

          {state.step === 1 ? <StepEventInfo wizard={wizard} /> : null}
          {state.step === 2 ? <StepTickets wizard={wizard} /> : null}
          {state.step === 3 ? <StepPix wizard={wizard} /> : null}

          {state.error ? <p className="mt-4 text-sm text-danger">{state.error}</p> : null}

          <div className="mt-9 flex justify-between border-t border-divider pt-6">
            {wizard.canGoBack ? (
              <button
                type="button"
                onClick={wizard.onBack}
                className="text-sm font-medium text-ink-soft hover:text-ink"
              >
                Voltar
              </button>
            ) : (
              <span />
            )}
            <Button
              type="button"
              onClick={() => void wizard.onContinue()}
              disabled={!wizard.isStepValid}
              loading={state.submitting}
              className="px-6"
            >
              {wizard.continueLabel}
            </Button>
          </div>
        </>
      )}
    </WizardShell>
  );
}
