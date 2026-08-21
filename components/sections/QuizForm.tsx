"use client";

import { Check } from "lucide-react";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { siteConfig } from "@/content/site-config";
import { GOAL_OPTIONS, FOCUS_OPTIONS, TRACK_OPTIONS, QUIZ_COPY } from "@/lib/quiz/questions";
import { GOAL_ICONS, FOCUS_ICONS } from "@/components/quiz/optionIcons";
import { SingleSelect } from "@/components/quiz/SingleSelect";
import { ScaleInput } from "@/components/quiz/ScaleInput";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { FormField } from "@/components/ui/FormField";
import { TextareaField } from "@/components/ui/TextareaField";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { submitQuizAction, type QuizFormState } from "@/app/actions/quiz";
import type { PrimaryFocus, QuizGoal, TrainingTrack } from "@/types/quiz";

const initialState: QuizFormState = { status: "idle" };

const LIMITATIONS_OPTIONS = [
  { value: "no" as const, label: QUIZ_COPY.limitations.noLabel },
  { value: "yes" as const, label: QUIZ_COPY.limitations.yesLabel },
];

const GOAL_OPTIONS_WITH_ICONS = GOAL_OPTIONS.map((option) => ({ ...option, icon: GOAL_ICONS[option.value] }));
const FOCUS_OPTIONS_WITH_ICONS = FOCUS_OPTIONS.map((option) => ({ ...option, icon: FOCUS_ICONS[option.value] }));

const STEP_ORDER = [
  "goal",
  "weight",
  "activityLevel",
  "trainingTrack",
  "weeklyCommitment",
  "primaryFocus",
  "limitations",
  "expectations",
  "extraNotes",
  "review",
] as const;

type StepId = (typeof STEP_ORDER)[number];

interface QuizAnswerState {
  goal: QuizGoal | null;
  currentWeightKg: string;
  targetWeightKg: string;
  activityLevel: number;
  trainingTrack: TrainingTrack | null;
  weeklyCommitment: number;
  primaryFocus: PrimaryFocus | null;
  hasLimitations: "yes" | "no" | null;
  limitationsNote: string;
  expectations: string;
  extraNotes: string;
  stepIndex: number;
}

const DEFAULT_ANSWERS: QuizAnswerState = {
  goal: null,
  currentWeightKg: "",
  targetWeightKg: "",
  activityLevel: 3,
  trainingTrack: null,
  weeklyCommitment: 3,
  primaryFocus: null,
  hasLimitations: null,
  limitationsNote: "",
  expectations: "",
  extraNotes: "",
  stepIndex: 0,
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} ariaBusy={pending}>
      {pending ? "Изпращане..." : label}
    </Button>
  );
}

export function QuizForm({ quizToken }: { quizToken: string }) {
  const [state, formAction] = useActionState(submitQuizAction, initialState);
  const { quiz } = siteConfig;

  // Answers live in React state only, never in browser storage.
  //
  // This wizard collects weight, injuries and free text about the person's
  // body: health data. Persisting it put that on disk for anyone with access
  // to the machine, and any key shared between people using the same tab would
  // replay one person's answers into another's form. Losing a draft on refresh
  // is the cheaper failure.
  const [answers, setAnswers] = useState<QuizAnswerState>(DEFAULT_ANSWERS);

  function update<K extends keyof QuizAnswerState>(key: K, value: QuizAnswerState[K]) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

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

  const visibleSteps = STEP_ORDER.filter((id) => id !== "weight" || answers.goal === "weight_loss");
  const stepIndex = Math.min(answers.stepIndex, visibleSteps.length - 1);
  const currentStepId: StepId = visibleSteps[stepIndex];

  function isStepValid(stepId: StepId): boolean {
    switch (stepId) {
      case "goal":
        return answers.goal !== null;
      case "weight":
        return answers.currentWeightKg.trim() !== "" && answers.targetWeightKg.trim() !== "";
      case "trainingTrack":
        return answers.trainingTrack !== null;
      case "primaryFocus":
        return answers.primaryFocus !== null;
      case "limitations":
        return answers.hasLimitations !== null && (answers.hasLimitations === "no" || answers.limitationsNote.trim() !== "");
      case "expectations":
        return answers.expectations.trim() !== "";
      default:
        return true;
    }
  }

  function goNext() {
    if (!isStepValid(currentStepId)) return;
    update("stepIndex", Math.min(stepIndex + 1, visibleSteps.length - 1));
  }

  function goBack() {
    update("stepIndex", Math.max(stepIndex - 1, 0));
  }

  const goalLabel = GOAL_OPTIONS.find((option) => option.value === answers.goal)?.label;
  const focusLabel = FOCUS_OPTIONS.find((option) => option.value === answers.primaryFocus)?.label;
  const trackLabel = TRACK_OPTIONS.find((option) => option.value === answers.trainingTrack)?.label;

  return (
    <div className="flex flex-col gap-6 border-t border-border pt-8">
      <div className="text-center">
        <h3 className="font-display text-2xl font-semibold text-foreground">{quiz.heading}</h3>
        <p className="mt-2 text-base text-muted">{quiz.intro}</p>
      </div>

      <QuizProgress step={stepIndex} totalSteps={visibleSteps.length} />

      <form action={formAction} noValidate className="flex flex-col gap-6">
        {/*
          The signed token replaces the raw participant id in the form. It is
          signed, not encrypted — the id inside it is readable by anyone
          holding the token. What it buys is integrity and expiry: the value
          cannot be altered or pointed at another participant without the
          server's secret, and submitQuizAction re-verifies it on every submit.
        */}
        <input type="hidden" name="quizToken" value={quizToken} />
        <input type="hidden" name="goal" value={answers.goal ?? ""} />
        <input type="hidden" name="activityLevel" value={answers.activityLevel} />
        <input type="hidden" name="trainingTrack" value={answers.trainingTrack ?? ""} />
        <input type="hidden" name="weeklyCommitment" value={answers.weeklyCommitment} />
        <input type="hidden" name="primaryFocus" value={answers.primaryFocus ?? ""} />
        <input type="hidden" name="hasLimitations" value={answers.hasLimitations ?? ""} />

        <div className={cn("flex flex-col gap-6", currentStepId === "goal" ? "" : "hidden")}>
          <SingleSelect
            legend={QUIZ_COPY.goal.question}
            name="goal"
            options={GOAL_OPTIONS_WITH_ICONS}
            value={answers.goal}
            onChange={(value) => update("goal", value)}
            error={state.fieldErrors?.goal}
          />
        </div>

        <div className={cn("flex flex-col gap-4", currentStepId === "weight" ? "" : "hidden")}>
          <p className="text-lg font-semibold text-foreground">{QUIZ_COPY.weight.question}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="currentWeightKg"
              name="currentWeightKg"
              label={QUIZ_COPY.weight.currentLabel}
              type="number"
              value={answers.currentWeightKg}
              onChange={(value) => update("currentWeightKg", value)}
              error={state.fieldErrors?.currentWeightKg}
            />
            <FormField
              id="targetWeightKg"
              name="targetWeightKg"
              label={QUIZ_COPY.weight.targetLabel}
              type="number"
              value={answers.targetWeightKg}
              onChange={(value) => update("targetWeightKg", value)}
              error={state.fieldErrors?.targetWeightKg}
            />
          </div>
        </div>

        <div className={cn(currentStepId === "activityLevel" ? "" : "hidden")}>
          <ScaleInput
            legend={QUIZ_COPY.activityLevel.question}
            name="activityLevelRange"
            value={answers.activityLevel}
            onChange={(value) => update("activityLevel", value)}
            minLabel={QUIZ_COPY.activityLevel.minLabel}
            maxLabel={QUIZ_COPY.activityLevel.maxLabel}
          />
        </div>

        <div className={cn(currentStepId === "trainingTrack" ? "" : "hidden")}>
          <SingleSelect
            legend={QUIZ_COPY.trainingTrack.question}
            name="trainingTrack"
            layout="row"
            options={TRACK_OPTIONS}
            value={answers.trainingTrack}
            onChange={(value) => update("trainingTrack", value)}
            error={state.fieldErrors?.trainingTrack}
          />
        </div>

        <div className={cn(currentStepId === "weeklyCommitment" ? "" : "hidden")}>
          <ScaleInput
            legend={QUIZ_COPY.weeklyCommitment.question}
            name="weeklyCommitmentRange"
            value={answers.weeklyCommitment}
            onChange={(value) => update("weeklyCommitment", value)}
            minLabel={QUIZ_COPY.weeklyCommitment.minLabel}
            maxLabel={QUIZ_COPY.weeklyCommitment.maxLabel}
          />
        </div>

        <div className={cn(currentStepId === "primaryFocus" ? "" : "hidden")}>
          <SingleSelect
            legend={QUIZ_COPY.primaryFocus.question}
            name="primaryFocus"
            options={FOCUS_OPTIONS_WITH_ICONS}
            value={answers.primaryFocus}
            onChange={(value) => update("primaryFocus", value)}
            error={state.fieldErrors?.primaryFocus}
          />
        </div>

        <div className={cn("flex flex-col gap-4", currentStepId === "limitations" ? "" : "hidden")}>
          <SingleSelect
            legend={QUIZ_COPY.limitations.question}
            name="hasLimitations"
            layout="row"
            options={LIMITATIONS_OPTIONS}
            value={answers.hasLimitations}
            onChange={(value) => update("hasLimitations", value)}
            error={state.fieldErrors?.hasLimitations}
          />
          <p className="text-xs text-muted">
            Тази информация е поверителна и се използва само от Радослава и екипа, за да съобразят плана ти безопасно.
          </p>
          {answers.hasLimitations === "yes" && (
            <TextareaField
              id="limitationsNote"
              name="limitationsNote"
              label={QUIZ_COPY.limitations.noteLabel}
              value={answers.limitationsNote}
              onChange={(value) => update("limitationsNote", value)}
              error={state.fieldErrors?.limitationsNote}
              rows={3}
            />
          )}
        </div>

        <div className={cn(currentStepId === "expectations" ? "" : "hidden")}>
          <TextareaField
            id="expectations"
            name="expectations"
            label={QUIZ_COPY.expectations.question}
            required
            value={answers.expectations}
            onChange={(value) => update("expectations", value)}
            error={state.fieldErrors?.expectations}
          />
        </div>

        <div className={cn(currentStepId === "extraNotes" ? "" : "hidden")}>
          <TextareaField
            id="extraNotes"
            name="extraNotes"
            label={QUIZ_COPY.extraNotes.question}
            value={answers.extraNotes}
            onChange={(value) => update("extraNotes", value)}
            error={state.fieldErrors?.extraNotes}
            rows={3}
          />
        </div>

        {currentStepId === "review" && (
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface/60 p-5 text-sm">
            <p className="font-semibold text-foreground">Преди да завършиш, провери отговорите си:</p>
            <dl className="flex flex-col gap-2">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Цел</dt>
                <dd className="text-right font-medium">{goalLabel}</dd>
              </div>
              {answers.goal === "weight_loss" && (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Тегло сега → цел</dt>
                  <dd className="text-right font-medium">
                    {answers.currentWeightKg} кг → {answers.targetWeightKg} кг
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Място за тренировка</dt>
                <dd className="text-right font-medium">{trackLabel}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Най-голяма нужда от помощ</dt>
                <dd className="text-right font-medium">{focusLabel}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Здравословни ограничения</dt>
                <dd className="text-right font-medium">{answers.hasLimitations === "yes" ? "Да" : "Не"}</dd>
              </div>
            </dl>
            <p className="text-muted">{quiz.skipNote}</p>
          </div>
        )}

        {state.status === "error" && state.message && (
          <p aria-live="polite" className="text-sm text-accent">
            {state.message}
          </p>
        )}

        <div className="flex items-center justify-between gap-4 pt-2">
          {stepIndex > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-accent/40"
            >
              {quiz.backLabel}
            </button>
          ) : (
            <span />
          )}

          {currentStepId === "review" ? (
            <SubmitButton label={quiz.submitLabel} />
          ) : (
            <Button type="button" disabled={!isStepValid(currentStepId)} onClick={goNext}>
              {quiz.nextLabel}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
