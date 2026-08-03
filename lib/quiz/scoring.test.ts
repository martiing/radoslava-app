import { describe, expect, it } from "vitest";
import { computeGoalRealism } from "@/lib/quiz/scoring";
import type { QuizAnswers } from "@/types/quiz";

function answers(overrides: Partial<QuizAnswers> = {}): QuizAnswers {
  return {
    goal: "weight_loss",
    currentWeightKg: 80,
    targetWeightKg: 76,
    activityLevel: 3,
    weeklyCommitment: 3,
    primaryFocus: "nutrition",
    hasLimitations: false,
    expectations: "Устойчив напредък",
    ...overrides,
  };
}

describe("computeGoalRealism", () => {
  it("classifies up to one kilogram per week as realistic", () => {
    expect(computeGoalRealism(answers())).toEqual({
      goalRealism: "realistic",
      goalRealismScore: 1,
      impliedKgPerWeek: 1,
    });
  });

  it("raises the risk level when readiness is low", () => {
    expect(
      computeGoalRealism(answers({ activityLevel: 2, weeklyCommitment: 2 })).goalRealism
    ).toBe("ambitious");
  });

  it("reduces the risk level by one step when readiness is high", () => {
    expect(
      computeGoalRealism(
        answers({ targetWeightKg: 74, activityLevel: 4, weeklyCommitment: 4 })
      ).goalRealism
    ).toBe("realistic");
  });

  it("keeps goals above 1.5 kilograms per week unrealistic", () => {
    const result = computeGoalRealism(answers({ targetWeightKg: 72 }));
    expect(result.goalRealism).toBe("unrealistic");
    expect(result.impliedKgPerWeek).toBe(2);
  });

  it("uses readiness for goals without a numeric weight target", () => {
    const result = computeGoalRealism(
      answers({
        goal: "energy_habits",
        currentWeightKg: undefined,
        targetWeightKg: undefined,
        activityLevel: 1,
        weeklyCommitment: 2,
      })
    );

    expect(result).toEqual({
      goalRealism: "ambitious",
      goalRealismScore: 3,
      impliedKgPerWeek: null,
    });
  });
});
