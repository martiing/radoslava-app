"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import {
  clientForgotPasswordAction,
  clientLoginAction,
  clientRegisterAction,
  clientUpdatePasswordAction,
  type ClientAuthState,
} from "@/app/actions/client-auth";
import { TurnstileWidget } from "@/components/ui/TurnstileWidget";

const turnstileEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
const initialClientAuthState: ClientAuthState = { status: "idle" };

interface AuthFieldProps {
  id: string;
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "password";
  autoComplete: string;
  error?: string;
  icon: React.ReactNode;
  value?: string;
  onChange?: (value: string) => void;
}

function AuthField({ id, name, label, type, autoComplete, error, icon, value, onChange }: AuthFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-foreground">
        {label} <span aria-hidden="true">*</span>
        <span className="sr-only"> (задължително)</span>
      </label>
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted"
        >
          {icon}
        </span>
        <input
          id={id}
          name={name}
          type={type}
          required
          autoComplete={autoComplete}
          value={value}
          onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="min-h-12 w-full rounded-2xl border border-border bg-white py-3 pl-11 pr-4 text-base text-foreground outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15 aria-[invalid=true]:border-accent"
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

function AuthStatus({ state }: { state: ClientAuthState }) {
  if (!state.message) return null;

  return (
    <p
      role={state.status === "error" ? "alert" : "status"}
      aria-live="polite"
      className={
        state.status === "error"
          ? "rounded-2xl border border-accent/25 bg-accent-soft/60 px-4 py-3 text-sm text-accent-hover"
          : "rounded-2xl border border-lime/50 bg-lime/15 px-4 py-3 text-sm text-foreground"
      }
    >
      {state.message}
    </p>
  );
}

function SubmitButton({
  label,
  pendingLabel,
  disabled = false,
}: {
  label: string;
  pendingLabel: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      aria-busy={pending}
      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-accent/20 transition hover:-translate-y-0.5 hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
    >
      {pending ? pendingLabel : label}
      {!pending && <ArrowRight aria-hidden="true" className="h-4 w-4" />}
    </button>
  );
}

export function ClientLoginForm({
  next,
  confirmationError,
  passwordUpdated,
}: {
  next: string;
  confirmationError: boolean;
  passwordUpdated: boolean;
}) {
  const [state, formAction] = useActionState(clientLoginAction, initialClientAuthState);

  return (
    <form action={formAction} noValidate className="grid gap-5">
      <input type="hidden" name="next" value={next} />
      {confirmationError && (
        <p role="alert" className="rounded-2xl border border-accent/25 bg-accent-soft/60 px-4 py-3 text-sm text-accent-hover">
          Потвърждението не беше завършено. Отвори последния линк от имейла или опитай отново.
        </p>
      )}
      {passwordUpdated && (
        <p role="status" className="rounded-2xl border border-lime/50 bg-lime/15 px-4 py-3 text-sm text-foreground">
          Паролата е сменена успешно. Влез отново с новата парола.
        </p>
      )}
      <AuthField
        id="client-email"
        name="email"
        label="Имейл"
        type="email"
        autoComplete="email"
        error={state.fieldErrors?.email}
        icon={<Mail className="h-5 w-5" />}
      />
      <AuthField
        id="client-password"
        name="password"
        label="Парола"
        type="password"
        autoComplete="current-password"
        error={state.fieldErrors?.password}
        icon={<LockKeyhole className="h-5 w-5" />}
      />
      <a
        href="/portal/forgot-password"
        className="-mt-2 w-fit text-sm font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Забравена парола?
      </a>
      <AuthStatus state={state} />
      <SubmitButton label="Влез в портала" pendingLabel="Влизане..." />
    </form>
  );
}

export function ClientRegisterForm() {
  const [state, formAction] = useActionState(clientRegisterAction, initialClientAuthState);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [seenState, setSeenState] = useState(state);

  if (state !== seenState) {
    setSeenState(state);
    if (state.status === "error") {
      setTurnstileToken("");
      setTurnstileKey((key) => key + 1);
    }
  }

  if (state.status === "success") {
    return (
      <div className="grid gap-5">
        <AuthStatus state={state} />
        <p className="text-sm leading-6 text-muted">
          Линкът за потвърждение е ограничен във времето. Ако не го виждаш, провери папка „Спам“.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="grid gap-5">
      <input type="hidden" name="turnstileToken" value={turnstileToken} />
      <div className="grid gap-5 sm:grid-cols-2">
        <AuthField
          id="register-name"
          name="name"
          label="Име"
          type="text"
          autoComplete="name"
          error={state.fieldErrors?.name}
          icon={<UserRound className="h-5 w-5" />}
          value={name}
          onChange={setName}
        />
        <AuthField
          id="register-phone"
          name="phone"
          label="Телефон"
          type="tel"
          autoComplete="tel"
          error={state.fieldErrors?.phone}
          icon={<Phone className="h-5 w-5" />}
          value={phone}
          onChange={setPhone}
        />
      </div>
      <AuthField
        id="register-email"
        name="email"
        label="Имейл"
        type="email"
        autoComplete="email"
        error={state.fieldErrors?.email}
        icon={<Mail className="h-5 w-5" />}
        value={email}
        onChange={setEmail}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <AuthField
          id="register-password"
          name="password"
          label="Парола"
          type="password"
          autoComplete="new-password"
          error={state.fieldErrors?.password}
          icon={<LockKeyhole className="h-5 w-5" />}
          value={password}
          onChange={setPassword}
        />
        <AuthField
          id="register-confirm-password"
          name="confirmPassword"
          label="Повтори паролата"
          type="password"
          autoComplete="new-password"
          error={state.fieldErrors?.confirmPassword}
          icon={<LockKeyhole className="h-5 w-5" />}
          value={confirmPassword}
          onChange={setConfirmPassword}
        />
      </div>
      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-background/60 p-4 text-sm leading-5 text-muted">
        <input
          type="checkbox"
          name="consent"
          required
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          aria-invalid={Boolean(state.fieldErrors?.consent)}
          aria-describedby={state.fieldErrors?.consent ? "register-consent-error" : undefined}
          className="mt-0.5 h-5 w-5 shrink-0 accent-accent"
        />
        <span>
          Съгласна съм с{" "}
          <a
            href="/politika-za-poveritelnost"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-accent underline-offset-4 hover:underline"
          >
            политиката за поверителност
          </a>
          .
        </span>
      </label>
      {state.fieldErrors?.consent && (
        <p id="register-consent-error" className="-mt-3 text-sm text-accent">
          {state.fieldErrors.consent}
        </p>
      )}
      <AuthStatus state={state} />
      <TurnstileWidget key={turnstileKey} onToken={setTurnstileToken} />
      <SubmitButton
        label="Създай профил"
        pendingLabel="Създаване..."
        disabled={turnstileEnabled && turnstileToken.length === 0}
      />
    </form>
  );
}

export function ClientForgotPasswordForm() {
  const [state, formAction] = useActionState(clientForgotPasswordAction, initialClientAuthState);

  if (state.status === "success") {
    return <AuthStatus state={state} />;
  }

  return (
    <form action={formAction} noValidate className="grid gap-5">
      <AuthField
        id="forgot-password-email"
        name="email"
        label="Имейл"
        type="email"
        autoComplete="email"
        error={state.fieldErrors?.email}
        icon={<Mail className="h-5 w-5" />}
      />
      <AuthStatus state={state} />
      <SubmitButton label="Изпрати линк" pendingLabel="Изпращане..." />
    </form>
  );
}

export function ClientUpdatePasswordForm() {
  const [state, formAction] = useActionState(clientUpdatePasswordAction, initialClientAuthState);

  return (
    <form action={formAction} noValidate className="grid gap-5">
      <AuthField
        id="new-password"
        name="password"
        label="Нова парола"
        type="password"
        autoComplete="new-password"
        error={state.fieldErrors?.password}
        icon={<LockKeyhole className="h-5 w-5" />}
      />
      <AuthField
        id="confirm-new-password"
        name="confirmPassword"
        label="Повтори новата парола"
        type="password"
        autoComplete="new-password"
        error={state.fieldErrors?.confirmPassword}
        icon={<LockKeyhole className="h-5 w-5" />}
      />
      <AuthStatus state={state} />
      <SubmitButton label="Запази новата парола" pendingLabel="Запазване..." />
    </form>
  );
}
