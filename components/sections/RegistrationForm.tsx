"use client";

import { Check, MessageCircle, Phone, User } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { siteConfig } from "@/content/site-config";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { SectionIcon } from "@/components/ui/SectionIcon";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { registerAction, type RegisterFormState } from "@/app/actions/register";
import { SingleSelect } from "@/components/quiz/SingleSelect";
import { INTAKE_COPY, INTAKE_GOAL_OPTIONS, INTAKE_LEVEL_OPTIONS, INTAKE_TRACK_OPTIONS } from "@/lib/intake/questions";
import { INTAKE_GOAL_ICONS, INTAKE_LEVEL_ICONS, INTAKE_TRACK_ICONS } from "@/components/intake/optionIcons";
import type { IntakeExperienceLevel, IntakeGoal, IntakeTrainingTrack } from "@/types/intake";

const initialState: RegisterFormState = { status: "idle" };

const GOAL_OPTIONS_WITH_ICONS = INTAKE_GOAL_OPTIONS.map((option) => ({ ...option, icon: INTAKE_GOAL_ICONS[option.value] }));
const TRACK_OPTIONS_WITH_ICONS = INTAKE_TRACK_OPTIONS.map((option) => ({ ...option, icon: INTAKE_TRACK_ICONS[option.value] }));
const LEVEL_OPTIONS_WITH_ICONS = INTAKE_LEVEL_OPTIONS.map((option) => ({ ...option, icon: INTAKE_LEVEL_ICONS[option.value] }));

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} ariaBusy={pending} className="w-full">
      {pending ? "Изпращане..." : label}
    </Button>
  );
}

export function RegistrationForm() {
  const [state, formAction] = useActionState(registerAction, initialState);
  const renderedAtInputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (renderedAtInputRef.current) {
      renderedAtInputRef.current.value = String(Date.now());
    }
  }, []);
  const { registration, viberContact } = siteConfig;
  const isSuccess = state.status === "success";

  // Controlled fields: a Server Action form clears its DOM inputs after submission,
  // so on a validation error we'd otherwise wipe out everything the visitor already typed.
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState<IntakeGoal | null>(null);
  const [trainingTrack, setTrainingTrack] = useState<IntakeTrainingTrack | null>(null);
  const [experienceLevel, setExperienceLevel] = useState<IntakeExperienceLevel | null>(null);
  const [consent, setConsent] = useState(false);

  return (
    <SectionContainer id="registration" headingId="registration-heading">
      <RevealOnScroll>
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <SectionIcon icon={MessageCircle} />
          <h2
            id="registration-heading"
            className="w-full font-display text-3xl font-semibold text-foreground sm:text-4xl"
          >
            {registration.heading}
          </h2>
          <p className="mt-4 w-full text-lg text-muted">{registration.intro}</p>
        </div>

        <div className="mx-auto mt-10 max-w-2xl rounded-[2rem] border border-white/70 bg-surface/70 p-8 shadow-xl shadow-accent/5 backdrop-blur-xl sm:p-10">
          {isSuccess ? (
            <div role="status" className="flex flex-col items-center gap-5 py-4 text-center">
              <span className="animate-fade-up flex h-14 w-14 items-center justify-center rounded-full bg-lime/30 text-accent-hover">
                <Check aria-hidden="true" className="h-7 w-7" strokeWidth={2.5} />
              </span>
              <div>
                <p className="text-xl font-semibold text-foreground">{registration.successHeading}</p>
                <p className="mt-2 text-base text-muted">{registration.successBody}</p>
              </div>
              <Button href={viberContact.deepLink} className="mt-2 w-full sm:w-auto">
                {registration.viberButtonLabel}
              </Button>
            </div>
          ) : (
            <form action={formAction} noValidate className="flex flex-col gap-6">
              {/* Honeypot field: hidden from real users via CSS, left empty by them. */}
              <div aria-hidden="true" className="hidden">
                <label htmlFor="company">Company</label>
                <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
              </div>
              <input ref={renderedAtInputRef} type="hidden" name="renderedAt" defaultValue="" />

              <FormField
                id="name"
                name="name"
                label={INTAKE_COPY.name.label}
                autoComplete="name"
                error={state.fieldErrors?.name}
                value={name}
                onChange={setName}
                icon={<User className="h-5 w-5" strokeWidth={1.75} />}
              />
              <FormField
                id="phone"
                name="phone"
                label={INTAKE_COPY.phone.label}
                type="tel"
                autoComplete="tel"
                error={state.fieldErrors?.phone}
                value={phone}
                onChange={setPhone}
                icon={<Phone className="h-5 w-5" strokeWidth={1.75} />}
              />

              <input type="hidden" name="primaryGoal" value={primaryGoal ?? ""} />
              <SingleSelect
                legend={INTAKE_COPY.goal.question}
                name="primaryGoalSelect"
                options={GOAL_OPTIONS_WITH_ICONS}
                value={primaryGoal}
                onChange={setPrimaryGoal}
                error={state.fieldErrors?.primaryGoal}
              />

              <input type="hidden" name="trainingTrack" value={trainingTrack ?? ""} />
              <SingleSelect
                legend={INTAKE_COPY.trainingTrack.question}
                name="trainingTrackSelect"
                layout="row"
                options={TRACK_OPTIONS_WITH_ICONS}
                value={trainingTrack}
                onChange={setTrainingTrack}
                error={state.fieldErrors?.trainingTrack}
              />

              <input type="hidden" name="experienceLevel" value={experienceLevel ?? ""} />
              <SingleSelect
                legend={INTAKE_COPY.experienceLevel.question}
                name="experienceLevelSelect"
                layout="row"
                options={LEVEL_OPTIONS_WITH_ICONS}
                value={experienceLevel}
                onChange={setExperienceLevel}
                error={state.fieldErrors?.experienceLevel}
              />

              <label
                htmlFor="consent"
                className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-surface/60 p-4 transition-colors duration-200 hover:border-accent/30 hover:bg-accent-soft/30"
              >
                <input
                  id="consent"
                  name="consent"
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  aria-describedby={state.fieldErrors?.consent ? "consent-error" : undefined}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                />
                <span className="text-sm text-muted">{registration.privacyLabel}</span>
              </label>
              {state.fieldErrors?.consent && (
                <p id="consent-error" className="-mt-3 text-sm text-accent">
                  {state.fieldErrors.consent}
                </p>
              )}

              {state.status === "error" && state.message && (
                <p aria-live="polite" className="text-sm text-accent">
                  {state.message}
                </p>
              )}

              <SubmitButton label={registration.submitLabel} />
            </form>
          )}
        </div>
      </RevealOnScroll>
    </SectionContainer>
  );
}
