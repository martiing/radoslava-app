"use client";

import { Check } from "lucide-react";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { siteConfig } from "@/content/site-config";
import { GOAL_OPTIONS, FOCUS_OPTIONS, QUIZ_COPY } from "@/lib/quiz/questions";
import { SingleSelect } from "@/components/quiz/SingleSelect";
import { ScaleInput } from "@/components/quiz/ScaleInput";
import { FormField } from "@/components/ui/FormField";
import { TextareaField } from "@/components/ui/TextareaField";
import { Button } from "@/components/ui/Button";
import { submitQuizAction, type QuizFormState } from "@/app/actions/quiz";
import type { PrimaryFocus, QuizGoal } from "@/types/quiz";

const initialState: QuizFormState = { status: "idle" };

const LIMITATIONS_OPTIONS = [
  { value: "no" as const, label: QUIZ_COPY.limitations.noLabel },
  { value: "yes" as const, label: QUIZ_COPY.limitations.yesLabel },
];

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} ariaBusy={pending} className="w-full">
      {pending ? "Изпращане..." : label}
    </Button>
  );
}

export function QuizForm({ quizToken }: { quizToken: string }) {
  const [state, formAction] = useActionState(submitQuizAction, initialState);
  const { quiz } = siteConfig;

  const [goal, setGoal] = useState<QuizGoal | null>(null);
  const [currentWeightKg, setCurrentWeightKg] = useState("");
  const [targetWeightKg, setTargetWeightKg] = useState("");
  const [activityLevel, setActivityLevel] = useState(3);
  const [weeklyCommitment, setWeeklyCommitment] = useState(3);
  const [primaryFocus, setPrimaryFocus] = useState<PrimaryFocus | null>(null);
  const [hasLimitations, setHasLimitations] = useState<"yes" | "no" | null>(null);
  const [limitationsNote, setLimitationsNote] = useState("");
  const [expectations, setExpectations] = useState("");
  const [extraNotes, setExtraNotes] = useState("");

  if (state.status === "success") {
    return (
      <div role="status" className="flex flex-col items-center gap-4 py-6 text-center">
        <span className="animate-fade-up flex h-14 w-14 items-center justify-center rounded-full bg-lime/30 text-accent-hover">
          <Check aria-hidden="true" className="h-7 w-7" strokeWidth={2.5} />
        </span>
        <p className="w-full text-lg font-medium text-foreground">{state.message ?? quiz.successMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 border-t border-border pt-8">
      <div className="text-center">
        <h3 className="font-display text-2xl font-semibold text-foreground">{quiz.heading}</h3>
        <p className="mt-2 text-base text-muted">{quiz.intro}</p>
      </div>

      <form action={formAction} noValidate className="flex flex-col gap-6">
        <input type="hidden" name="quizToken" value={quizToken} />
        <input type="hidden" name="goal" value={goal ?? ""} />
        <input type="hidden" name="activityLevel" value={activityLevel} />
        <input type="hidden" name="weeklyCommitment" value={weeklyCommitment} />
        <input type="hidden" name="primaryFocus" value={primaryFocus ?? ""} />
        <input type="hidden" name="hasLimitations" value={hasLimitations ?? ""} />

        <SingleSelect
          legend={QUIZ_COPY.goal.question}
          name="goal"
          options={GOAL_OPTIONS}
          value={goal}
          onChange={setGoal}
          error={state.fieldErrors?.goal}
        />

        {goal === "weight_loss" && (
          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium text-foreground">{QUIZ_COPY.weight.question}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                id="currentWeightKg"
                name="currentWeightKg"
                label={QUIZ_COPY.weight.currentLabel}
                type="number"
                value={currentWeightKg}
                onChange={setCurrentWeightKg}
                error={state.fieldErrors?.currentWeightKg}
              />
              <FormField
                id="targetWeightKg"
                name="targetWeightKg"
                label={QUIZ_COPY.weight.targetLabel}
                type="number"
                value={targetWeightKg}
                onChange={setTargetWeightKg}
                error={state.fieldErrors?.targetWeightKg}
              />
            </div>
          </div>
        )}

        <ScaleInput
          legend={QUIZ_COPY.activityLevel.question}
          name="activityLevelRange"
          value={activityLevel}
          onChange={setActivityLevel}
          minLabel={QUIZ_COPY.activityLevel.minLabel}
          maxLabel={QUIZ_COPY.activityLevel.maxLabel}
        />

        <ScaleInput
          legend={QUIZ_COPY.weeklyCommitment.question}
          name="weeklyCommitmentRange"
          value={weeklyCommitment}
          onChange={setWeeklyCommitment}
          minLabel={QUIZ_COPY.weeklyCommitment.minLabel}
          maxLabel={QUIZ_COPY.weeklyCommitment.maxLabel}
        />

        <SingleSelect
          legend={QUIZ_COPY.primaryFocus.question}
          name="primaryFocus"
          options={FOCUS_OPTIONS}
          value={primaryFocus}
          onChange={setPrimaryFocus}
          error={state.fieldErrors?.primaryFocus}
        />

        <SingleSelect
          legend={QUIZ_COPY.limitations.question}
          name="hasLimitations"
          options={LIMITATIONS_OPTIONS}
          value={hasLimitations}
          onChange={setHasLimitations}
          error={state.fieldErrors?.hasLimitations}
        />

        {hasLimitations === "yes" && (
          <TextareaField
            id="limitationsNote"
            name="limitationsNote"
            label={QUIZ_COPY.limitations.noteLabel}
            value={limitationsNote}
            onChange={setLimitationsNote}
            error={state.fieldErrors?.limitationsNote}
            rows={3}
          />
        )}

        <TextareaField
          id="expectations"
          name="expectations"
          label={QUIZ_COPY.expectations.question}
          required
          value={expectations}
          onChange={setExpectations}
          error={state.fieldErrors?.expectations}
        />

        <TextareaField
          id="extraNotes"
          name="extraNotes"
          label={QUIZ_COPY.extraNotes.question}
          value={extraNotes}
          onChange={setExtraNotes}
          error={state.fieldErrors?.extraNotes}
          rows={3}
        />

        <p className="text-xs text-muted">{quiz.skipNote}</p>

        {state.status === "error" && state.message && (
          <p aria-live="polite" className="text-sm text-accent">
            {state.message}
          </p>
        )}

        <SubmitButton label={quiz.submitLabel} />
      </form>
    </div>
  );
}
