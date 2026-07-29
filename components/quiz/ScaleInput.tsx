"use client";

interface ScaleInputProps {
  legend: string;
  name: string;
  value: number;
  onChange: (value: number) => void;
  minLabel: string;
  maxLabel: string;
}

export function ScaleInput({ legend, name, value, onChange, minLabel, maxLabel }: ScaleInputProps) {
  const valueId = `${name}-value`;

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-medium text-foreground">{legend}</legend>
      <input
        type="range"
        name={name}
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="accent-accent"
        aria-describedby={valueId}
      />
      <div id={valueId} className="flex justify-between text-xs text-muted">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </fieldset>
  );
}
