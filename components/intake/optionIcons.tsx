import { Dumbbell, Flame, Heart, Home, Shuffle, Sparkles, Sprout, TrendingUp, Zap } from "lucide-react";
import type { IntakeExperienceLevel, IntakeGoal, IntakeTrainingTrack } from "@/types/intake";

export const INTAKE_GOAL_ICONS: Record<IntakeGoal, typeof Dumbbell> = {
  weight_loss: Zap,
  tone_and_shape: Sparkles,
  muscle_gain: Dumbbell,
  general_health: Heart,
};

export const INTAKE_TRACK_ICONS: Record<IntakeTrainingTrack, typeof Dumbbell> = {
  gym: Dumbbell,
  home: Home,
  both: Shuffle,
};

export const INTAKE_LEVEL_ICONS: Record<IntakeExperienceLevel, typeof Dumbbell> = {
  beginner: Sprout,
  intermediate: TrendingUp,
  advanced: Flame,
};
