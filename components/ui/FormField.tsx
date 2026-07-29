import { cn } from "@/lib/utils";

interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "number";
  autoComplete?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
}

export function FormField({
  id,
  name,
  label,
  type = "text",
  autoComplete,
  required = true,
  error,
  disabled,
  value,
  onChange,
  icon,
}: FormFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <div className="group relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted transition-colors duration-200 group-focus-within:text-accent">
            {icon}
          </span>
        )}
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "w-full rounded-2xl border bg-surface/80 py-3.5 text-base text-foreground placeholder:text-muted/70 transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/15 focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-60",
            icon ? "pl-11 pr-4" : "px-4",
            error ? "border-accent" : "border-border"
          )}
        />
      </div>
      {error && (
        <p id={errorId} className="text-sm text-accent">
          {error}
        </p>
      )}
    </div>
  );
}
