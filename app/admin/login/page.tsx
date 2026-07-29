"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { adminLoginAction, type AdminLoginState } from "@/app/actions/admin-login";

const initialState: AdminLoginState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Вход..." : "Вход"}
    </button>
  );
}

export default function AdminLoginPage() {
  const [state, formAction] = useActionState(adminLoginAction, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <form
        action={formAction}
        noValidate
        className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm"
      >
        <h1 className="text-lg font-semibold text-neutral-900">Администрация</h1>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-neutral-700">Парола</span>
          <input
            type="password"
            name="password"
            required
            autoFocus
            autoComplete="current-password"
            aria-invalid={state.status === "error"}
            aria-describedby={state.status === "error" ? "password-error" : undefined}
            className="rounded-xl border border-neutral-300 px-4 py-3 text-base text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
          />
        </label>
        {state.status === "error" && state.message && (
          <p id="password-error" aria-live="polite" className="text-sm text-red-600">
            {state.message}
          </p>
        )}
        <SubmitButton />
      </form>
    </main>
  );
}
