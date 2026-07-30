import { Brain, Dumbbell, HeartPulse, Sparkles, Users, Utensils, Zap } from "lucide-react";
import type { PrimaryFocus, QuizGoal } from "@/types/quiz";

export const GOAL_ICONS: Record<QuizGoal, typeof Dumbbell> = {
  weight_loss: Zap,
  tone_and_shape: Sparkles,
  strength: Dumbbell,
  energy_habits: HeartPulse,
  general_health: HeartPulse,
};

export const FOCUS_ICONS: Record<PrimaryFocus, typeof Dumbbell> = {
  nutrition: Utensils,
  training: Dumbbell,
  accountability: Users,
  mindset: Brain,
};
