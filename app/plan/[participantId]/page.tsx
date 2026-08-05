import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { LockedPlanNotice } from "@/components/plan/LockedPlanNotice";
import { PlanResourceCard } from "@/components/plan/PlanResourceCard";
import { LevelCard } from "@/components/plan/LevelCard";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getNutritionTier, getTrainingPlanKey, getTrainingPlanKeyFromLevel } from "@/lib/plan/assignment";
import { getWeekUnlockStatuses } from "@/lib/plan/weeks";
import { DEFAULT_PROGRAM_SLUG, PLAN_PAGE_COPY, PROGRAM_CONTENT } from "@/content/program-content";
import type { QuizAnswers } from "@/types/quiz";
import type { IntakeExperienceLevel, IntakeGoal, IntakeTrainingTrack } from "@/types/intake";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${PLAN_PAGE_COPY.heading} | Slavova's Shape Squad`,
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const FALLBACK_QUIZ_ANSWERS: QuizAnswers = {
  goal: "general_health",
  activityLevel: 3,
  weeklyCommitment: 3,
  primaryFocus: "accountability",
  hasLimitations: false,
  expectations: "",
};

export default async function PlanPage({ params }: { params: Promise<{ participantId: string }> }) {
  const { participantId } = await params;

  if (!UUID_PATTERN.test(participantId)) {
    notFound();
  }

  const supabase = getSupabaseServerClient();
  const { data: participant, error } = await supabase
    .from("participants")
    .select("id, name, stage, quiz_answers, program_slug, primary_goal, training_track, experience_level")
    .eq("id", participantId)
    .single();

  if (error || !participant) {
    notFound();
  }

  const hasAccess = participant.stage === "added_to_group" || participant.stage === "completed";

  if (!hasAccess) {
    return (
      <>
        <Header />
        <main>
          <SectionContainer id="plan" headingId="plan-heading">
            <LockedPlanNotice />
          </SectionContainer>
        </main>
        <Footer />
      </>
    );
  }

  const program = PROGRAM_CONTENT[participant.program_slug] ?? PROGRAM_CONTENT[DEFAULT_PROGRAM_SLUG];

  // Participants registered through the 5-question intake carry these
  // promoted columns; participants from the earlier 9-question quiz carry
  // `quiz_answers` instead. She's already paid, so a missing/incomplete
  // answer never blocks access — it just falls back to a sensible default.
  const hasIntakeAnswers = participant.primary_goal && participant.training_track && participant.experience_level;

  let nutritionGoal: IntakeGoal | QuizAnswers["goal"];
  let trainingPlanKey: ReturnType<typeof getTrainingPlanKey>;

  if (hasIntakeAnswers) {
    nutritionGoal = participant.primary_goal as IntakeGoal;
    trainingPlanKey = getTrainingPlanKeyFromLevel(
      participant.experience_level as IntakeExperienceLevel,
      participant.training_track as IntakeTrainingTrack
    );
  } else {
    const answers = (participant.quiz_answers as QuizAnswers | null) ?? FALLBACK_QUIZ_ANSWERS;
    nutritionGoal = answers.goal;
    trainingPlanKey = getTrainingPlanKey(answers);
  }

  const nutrition = program.nutritionPlans[getNutritionTier(nutritionGoal)];
  const training = program.trainingPlans[trainingPlanKey];
  const weekStatuses = getWeekUnlockStatuses(program.startDateIso);
  const firstName = participant.name.trim().split(/\s+/)[0] || participant.name;

  return (
    <>
      <Header />
      <main>
        <SectionContainer id="plan" headingId="plan-heading">
          <div className="mx-auto max-w-2xl text-center">
            <h1 id="plan-heading" className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
              {PLAN_PAGE_COPY.heading}
            </h1>
            <p className="mt-4 text-lg text-muted">
              Здравей, {firstName}! {PLAN_PAGE_COPY.intro}
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">
            <PlanResourceCard
              heading={PLAN_PAGE_COPY.nutritionHeading}
              title={nutrition.title}
              summary={nutrition.summary}
              link={nutrition.link}
            />
            <PlanResourceCard
              heading={PLAN_PAGE_COPY.trainingHeading}
              title={training.title}
              summary={training.summary}
              link={training.link}
            />
          </div>

          <h2 className="mx-auto mt-14 max-w-4xl font-display text-2xl font-semibold text-foreground">
            {PLAN_PAGE_COPY.levelsHeading}
          </h2>
          <div className="mx-auto mt-6 grid max-w-4xl gap-6 sm:grid-cols-2">
            {weekStatuses.map((status) => (
              <LevelCard key={status.week} status={status} theme={program.weekThemes[status.week]} />
            ))}
          </div>
        </SectionContainer>
      </main>
      <Footer />
    </>
  );
}
