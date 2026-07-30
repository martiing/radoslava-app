import type { TrainingTrack } from "@/types/quiz";
import type { NutritionTier, TrainingLevel } from "@/lib/plan/assignment";

export type TrainingPlanKey = `${TrainingLevel}_${TrainingTrack}`;

export interface WeekTheme {
  week: 1 | 2 | 3 | 4;
  title: string;
  focusHabit: string;
}

export interface PlanLink {
  label: string;
  /** null = not authored yet; the page must render a clear placeholder, never a dead link. */
  href: string | null;
}

export interface NutritionPlanContent {
  title: string;
  summary: string;
  link: PlanLink;
}

export interface TrainingPlanContent {
  title: string;
  summary: string;
  link: PlanLink;
}

export interface ProgramContent {
  /** Shared cohort start date (machine-readable) — keep in sync with siteConfig.hero.startDate's display string. */
  startDateIso: string;
  weekThemes: Record<1 | 2 | 3 | 4, WeekTheme>;
  nutritionPlans: Record<NutritionTier, NutritionPlanContent>;
  trainingPlans: Record<TrainingPlanKey, TrainingPlanContent>;
}

export const DEFAULT_PROGRAM_SLUG = "shape-squad-2026-09";

export const PLAN_PAGE_COPY = {
  heading: "Твоите Levels",
  intro: "Всяка седмица отключва нов Level с фокус навик за седмицата. Хранителният и тренировъчният ти план са достъпни през целия месец.",
  nutritionHeading: "Твоят хранителен план",
  trainingHeading: "Твоят тренировъчен план",
  levelsHeading: "Levels на предизвикателството",
  lockedLabel: "Заключено",
  unlockedLabel: "Отключено",
  unlocksOnPrefix: "Отключва се на",
  linkPendingLabel: "Предстои — очаквай го скоро",
  notYet: {
    heading: "Почти сме готови",
    body: "Твоите Levels ще се отключат тук веднага щом плащането е потвърдено и си добавена в затворената Viber група. Ако вече си платила, а все още не виждаш това да се е променило, пиши ни във Viber групата или на",
  },
  notFound: {
    heading: "Не открихме тази страница",
    body: "Линкът изглежда невалиден или остарял. Провери го в съобщението, което си получила, или се свържи с нас.",
  },
} as const;

export const PROGRAM_CONTENT: Record<string, ProgramContent> = {
  [DEFAULT_PROGRAM_SLUG]: {
    startDateIso: "2026-09-01",

    weekThemes: {
      1: {
        week: 1,
        title: "Level 1: Основа",
        focusHabit: "Фокусът тази седмица е хидратацията — достатъчен прием на вода всеки ден, основата, върху която стъпва всичко останало.",
      },
      2: {
        week: 2,
        title: "Level 2: Инерция",
        focusHabit: "Фокусът тази седмица е протеинът във всяко хранене — гради засищане и подкрепя резултатите ти.",
      },
      3: {
        week: 3,
        title: "Level 3: Дисциплина",
        focusHabit: "Фокусът тази седмица е сънят и възстановяването — без тях напредъкът е наполовина.",
      },
      4: {
        week: 4,
        title: "Level 4: Трансформация",
        focusHabit: "Фокусът тази седмица е последователността — довърши месеца силно и си отбележи резултатите.",
      },
    },

    nutritionPlans: {
      calorie_deficit: {
        title: "План с лек калориен дефицит",
        summary: "Насочен към постепенно и устойчиво отслабване, без драстични ограничения — балансирани хранения през целия 4-седмичен период.",
        link: { label: "Хранителен план (PDF)", href: null },
      },
      maintenance_recomp: {
        title: "План за поддържане и оформяне",
        summary: "Насочен към енергия, представяне и оформяне на тялото, без калориен дефицит.",
        link: { label: "Хранителен план (PDF)", href: null },
      },
    },

    trainingPlans: {
      beginner_home: {
        title: "Начинаещи · Вкъщи",
        summary: "Базови упражнения с минимално оборудване, подходящи за начало без опит.",
        link: { label: "Тренировъчен план (PDF)", href: null },
      },
      beginner_gym: {
        title: "Начинаещи · Фитнес зала",
        summary: "Базова тренировъчна структура за фитнес зала, подходяща за начало без опит.",
        link: { label: "Тренировъчен план (PDF)", href: null },
      },
      intermediate_home: {
        title: "Средно ниво · Вкъщи",
        summary: "Прогресивна тренировъчна структура с минимално оборудване за редовно трениращи.",
        link: { label: "Тренировъчен план (PDF)", href: null },
      },
      intermediate_gym: {
        title: "Средно ниво · Фитнес зала",
        summary: "Прогресивна тренировъчна структура за фитнес зала за редовно трениращи.",
        link: { label: "Тренировъчен план (PDF)", href: null },
      },
      advanced_home: {
        title: "Напреднали · Вкъщи",
        summary: "По-интензивна тренировъчна структура с минимално оборудване за напреднали.",
        link: { label: "Тренировъчен план (PDF)", href: null },
      },
      advanced_gym: {
        title: "Напреднали · Фитнес зала",
        summary: "По-интензивна тренировъчна структура за фитнес зала за напреднали.",
        link: { label: "Тренировъчен план (PDF)", href: null },
      },
    },
  },
};
