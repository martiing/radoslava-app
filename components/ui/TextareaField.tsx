import { cn } from "@/lib/utils";

interface TextareaFieldProps {
  id: string;
  name: string;
  label: string;
  required?: boolean;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}

export function TextareaField({
  id,
  name,
  label,
  required = false,
  error,
  value,
  onChange,
  rows = 4,
}: TextareaFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <textarea
        id={id}
        name={name}
        required={required}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "w-full resize-none rounded-2xl border bg-surface/80 px-4 py-3.5 text-base text-foreground placeholder:text-muted/70 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/15 focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-60",
          error ? "border-accent" : "border-border"
        )}
      />
      {error && (
        <p id={errorId} className="text-sm text-accent">
          {error}
        </p>
      )}
    </div>
  );
}
