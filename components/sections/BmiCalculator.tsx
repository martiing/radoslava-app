"use client";

import { Scale } from "lucide-react";
import { useMemo, useState } from "react";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SectionIcon } from "@/components/ui/SectionIcon";
import { Button } from "@/components/ui/Button";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

const GAUGE_MIN = 15;
const GAUGE_MAX = 35;

interface BmiCategory {
  label: string;
  range: string;
  color: string;
}

function getCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return { label: "Поднормено тегло", range: "под 18.5", color: "var(--accent-bright)" };
  if (bmi < 25) return { label: "Нормално тегло", range: "18.5 – 24.9", color: "var(--lime)" };
  if (bmi < 30) return { label: "Леко наднормено тегло", range: "25 – 29.9", color: "var(--accent)" };
  return { label: "Наднормено тегло", range: "над 30", color: "var(--accent-hover)" };
}

export function BmiCalculator() {
  const [height, setHeight] = useState("165");
  const [weight, setWeight] = useState("65");

  const bmi = useMemo(() => {
    const heightM = Number(height) / 100;
    const weightKg = Number(weight);
    if (!heightM || !weightKg || heightM <= 0) return null;
    return weightKg / (heightM * heightM);
  }, [height, weight]);

  const category = bmi ? getCategory(bmi) : null;
  const pointerPercent = bmi
    ? ((Math.min(Math.max(bmi, GAUGE_MIN), GAUGE_MAX) - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN)) * 100
    : 0;

  return (
    <SectionContainer id="bmi-calculator" headingId="bmi-calculator-heading" tone="tint">
      <RevealOnScroll>
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <SectionIcon icon={Scale} />
          <h2
            id="bmi-calculator-heading"
            className="font-display text-3xl font-semibold text-foreground sm:text-4xl"
          >
            Провери своя ИТМ
          </h2>
          <p className="mt-4 text-lg text-muted">
            Индекс на телесна маса (ИТМ) е бърз ориентировъчен показател — не диагноза. Използвай го само
            като отправна точка.
          </p>
        </div>
      </RevealOnScroll>

      <RevealOnScroll delayMs={100}>
        <div className="mx-auto mt-10 max-w-2xl rounded-[2rem] border border-white/70 bg-surface/70 p-8 shadow-xl shadow-accent/5 backdrop-blur-xl sm:p-10">
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">Височина (см)</span>
              <input
                type="range"
                min={140}
                max={210}
                value={height || 0}
                onChange={(event) => setHeight(event.target.value)}
                className="accent-accent"
                aria-describedby="height-value"
              />
              <span id="height-value" className="text-sm text-muted">
                {height || 0} см
              </span>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">Тегло (кг)</span>
              <input
                type="range"
                min={40}
                max={150}
                value={weight || 0}
                onChange={(event) => setWeight(event.target.value)}
                className="accent-accent"
                aria-describedby="weight-value"
              />
              <span id="weight-value" className="text-sm text-muted">
                {weight || 0} кг
              </span>
            </label>
          </div>

          <div className="mt-8" role="status" aria-live="polite">
            <div className="flex items-baseline justify-between">
              <span className="font-display text-4xl font-bold text-foreground">
                {bmi ? bmi.toFixed(1) : "—"}
              </span>
              {category && (
                <span className="text-sm font-semibold" style={{ color: category.color }}>
                  {category.label}
                </span>
              )}
            </div>

            <div className="relative mt-4 h-3 w-full overflow-hidden rounded-full bg-gradient-to-r from-accent-bright via-lime via-40% to-accent-hover">
              <div
                className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-white bg-plum shadow-md transition-all duration-500 ease-out"
                style={{ left: `calc(${pointerPercent}% - 10px)` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted">
              <span>15</span>
              <span>20</span>
              <span>25</span>
              <span>30</span>
              <span>35+</span>
            </div>
          </div>

          <p className="mt-6 text-sm text-muted">
            Този резултат е ориентировъчен и не замества консултация със специалист.
          </p>

          <div className="mt-6 flex justify-center">
            <Button href="#registration" variant="secondary">
              Искам план, съобразен с моите цели
            </Button>
          </div>
        </div>
      </RevealOnScroll>
    </SectionContainer>
  );
}
