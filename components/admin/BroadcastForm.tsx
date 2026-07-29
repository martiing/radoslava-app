"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { sendBroadcastAction, type BroadcastState } from "@/app/actions/admin/participants";
import { STAGE_LABELS } from "@/lib/admin/stages";

const initialState: BroadcastState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="self-start rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Изпращане..." : "Изпрати"}
    </button>
  );
}

export function BroadcastForm() {
  const [state, formAction] = useActionState(sendBroadcastAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5">
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-neutral-700">Изпрати до участнички със статус</span>
        <select name="stage" required className="rounded-lg border border-neutral-300 px-3 py-2">
          {Object.entries(STAGE_LABELS).map(([stage, label]) => (
            <option key={stage} value={stage}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-neutral-700">Тема</span>
        <input name="subject" required className="rounded-lg border border-neutral-300 px-3 py-2" />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-neutral-700">Съобщение</span>
        <textarea name="body" required rows={6} className="rounded-lg border border-neutral-300 px-3 py-2" />
      </label>
      {state.message && (
        <p aria-live="polite" className={state.status === "error" ? "text-sm text-red-600" : "text-sm text-neutral-600"}>
          {state.message}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
