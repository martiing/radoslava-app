import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary";

const baseClasses =
  "inline-flex min-h-11 items-center justify-center rounded-full px-7 py-3.5 text-sm font-semibold tracking-wide transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0";

const variantClasses: Record<Variant, string> = {
  primary: "bg-accent text-white shadow-md shadow-accent/20 hover:bg-accent-hover hover:shadow-lg hover:shadow-accent/30",
  secondary:
    "bg-transparent text-foreground border border-foreground/20 hover:border-accent hover:text-accent-hover",
};

interface BaseProps {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}

interface ButtonAsLink extends BaseProps {
  href: string;
  target?: string;
  rel?: string;
}

interface ButtonAsButton extends BaseProps {
  href?: undefined;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  ariaBusy?: boolean;
}

export function Button(props: ButtonAsLink | ButtonAsButton) {
  const { variant = "primary", className, children } = props;
  const classes = cn(baseClasses, variantClasses[variant], className);

  if (props.href) {
    const opensRegistrationDialog = props.href.endsWith("#registration");

    return (
      <Link
        href={props.href}
        className={classes}
        target={props.target}
        rel={props.rel}
        aria-haspopup={opensRegistrationDialog ? "dialog" : undefined}
      >
        {children}
      </Link>
    );
  }

  const buttonProps = props as ButtonAsButton;

  return (
    <button
      type={buttonProps.type ?? "button"}
      className={classes}
      disabled={buttonProps.disabled}
      onClick={buttonProps.onClick}
      aria-busy={buttonProps.ariaBusy}
    >
      {children}
    </button>
  );
}
