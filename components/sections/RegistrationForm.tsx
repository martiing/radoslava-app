"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Phone,
  User,
  X,
} from "lucide-react";
import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { siteConfig } from "@/content/site-config";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import {
  TurnstileWidget,
  type TurnstileWidgetState,
} from "@/components/ui/TurnstileWidget";
import { registerAction, type RegisterFormState } from "@/app/actions/register";
import { SingleSelect } from "@/components/quiz/SingleSelect";
import {
  INTAKE_COPY,
  INTAKE_GOAL_OPTIONS,
  INTAKE_LEVEL_OPTIONS,
  INTAKE_TRACK_OPTIONS,
} from "@/lib/intake/questions";
import {
  INTAKE_GOAL_ICONS,
  INTAKE_LEVEL_ICONS,
  INTAKE_TRACK_ICONS,
} from "@/components/intake/optionIcons";
import type {
  IntakeExperienceLevel,
  IntakeGoal,
  IntakeTrainingTrack,
} from "@/types/intake";
import {
  validateRegistrationContact,
  type RegistrationContactErrors,
} from "@/lib/validation/registration-contact";

const initialState: RegisterFormState = { status: "idle" };
const REGISTRATION_HASH = "#registration";
const REGISTRATION_HISTORY_KEY = "registrationDialog";

const GOAL_OPTIONS_WITH_ICONS = INTAKE_GOAL_OPTIONS.map((option) => ({
  ...option,
  icon: INTAKE_GOAL_ICONS[option.value],
}));
const TRACK_OPTIONS_WITH_ICONS = INTAKE_TRACK_OPTIONS.map((option) => ({
  ...option,
  icon: INTAKE_TRACK_ICONS[option.value],
}));
const LEVEL_OPTIONS_WITH_ICONS = INTAKE_LEVEL_OPTIONS.map((option) => ({
  ...option,
  icon: INTAKE_LEVEL_ICONS[option.value],
}));

// Production must fail closed when Turnstile is missing. Local development
// stays usable without Cloudflare credentials.
const turnstileEnabled = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
const turnstileRequired = process.env.NODE_ENV === "production";
const initialTurnstileState:
  | TurnstileWidgetState
  | "configuration"
  | "not-required" = turnstileEnabled
  ? "loading"
  : turnstileRequired
    ? "configuration"
    : "not-required";

function getHistoryState() {
  return typeof window.history.state === "object" && window.history.state
    ? window.history.state
    : {};
}

export function RegistrationForm() {
  const [state, formAction, actionPending] = useActionState(registerAction, initialState);
  const [transitionPending, startTransition] = useTransition();
  const isPending = actionPending || transitionPending;
  const { registration, viberContact } = siteConfig;
  const isSuccess = state.status === "success";

  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const stepContentRef = useRef<HTMLDivElement | null>(null);
  const previousOverflowRef = useRef("");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [renderedAt, setRenderedAt] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [contactErrors, setContactErrors] = useState<RegistrationContactErrors>({});
  const [primaryGoal, setPrimaryGoal] = useState<IntakeGoal | null>(null);
  const [trainingTrack, setTrainingTrack] = useState<IntakeTrainingTrack | null>(null);
  const [experienceLevel, setExperienceLevel] = useState<IntakeExperienceLevel | null>(null);
  const [consent, setConsent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [viberCopyState, setViberCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [turnstileState, setTurnstileState] = useState<
    TurnstileWidgetState | "configuration" | "not-required"
  >(initialTurnstileState);

  async function copyViberNumber() {
    try {
      await navigator.clipboard.writeText(viberContact.phoneE164);
      setViberCopyState("copied");
    } catch {
      setViberCopyState("error");
    }
  }

  const showDialog = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    setRenderedAt((value) => value || String(Date.now()));
    setIsDialogOpen(true);

    if (!dialog.open) {
      previousOverflowRef.current = document.documentElement.style.overflow;
      document.documentElement.style.overflow = "hidden";
      dialog.showModal();
    }
  }, []);

  const hideDialog = useCallback(() => {
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
    document.documentElement.style.overflow = previousOverflowRef.current;
    setIsDialogOpen(false);
  }, []);

  const closeDialogFromUi = useCallback(() => {
    hideDialog();

    if (window.location.hash !== REGISTRATION_HASH) return;

    const stateHasDialogEntry = Boolean(getHistoryState()[REGISTRATION_HISTORY_KEY]);
    if (stateHasDialogEntry) {
      window.history.back();
      return;
    }

    const nextState = { ...getHistoryState() };
    delete nextState[REGISTRATION_HISTORY_KEY];
    window.history.replaceState(
      nextState,
      "",
      `${window.location.pathname}${window.location.search}`
    );
  }, [hideDialog]);

  useEffect(() => {
    const mountedDialog = dialogRef.current;

    function syncDialogToUrl() {
      if (window.location.hash === REGISTRATION_HASH) showDialog();
      else hideDialog();
    }

    function handleRegistrationTrigger(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;

      const url = new URL(anchor.href, window.location.href);
      if (
        url.origin !== window.location.origin ||
        url.pathname !== window.location.pathname ||
        url.hash !== REGISTRATION_HASH
      ) {
        return;
      }

      event.preventDefault();

      if (window.location.hash !== REGISTRATION_HASH) {
        window.history.pushState(
          { ...getHistoryState(), [REGISTRATION_HISTORY_KEY]: true },
          "",
          `${window.location.pathname}${window.location.search}${REGISTRATION_HASH}`
        );
      }

      showDialog();
    }

    document.addEventListener("click", handleRegistrationTrigger, { capture: true });
    window.addEventListener("popstate", syncDialogToUrl);
    window.addEventListener("hashchange", syncDialogToUrl);
    syncDialogToUrl();

    return () => {
      document.removeEventListener("click", handleRegistrationTrigger, { capture: true });
      window.removeEventListener("popstate", syncDialogToUrl);
      window.removeEventListener("hashchange", syncDialogToUrl);
      if (mountedDialog?.open) mountedDialog.close();
      document.documentElement.style.overflow = previousOverflowRef.current;
    };
  }, [hideDialog, showDialog]);

  useEffect(() => {
    if (!isDialogOpen || isSuccess) return;

    // Mobile keyboards often scroll the current step to the focused field.
    // Reset only the dialog's content when advancing so the next question and
    // its progress indicator are visible without moving the landing page.
    if (stepContentRef.current) stepContentRef.current.scrollTop = 0;

    const frame = window.requestAnimationFrame(() => {
      document.getElementById("registration-step-heading")?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [isDialogOpen, isSuccess, stepIndex]);

  useEffect(() => {
    if (state.status !== "error") return;

    const errors = state.fieldErrors;
    if (!errors) return;

    let targetStep = 2;
    let targetName = "consent";

    if (errors.name || errors.phone) {
      targetStep = 0;
      targetName = errors.name ? "name" : "phone";
    } else if (errors.primaryGoal || errors.trainingTrack) {
      targetStep = 1;
      targetName = errors.primaryGoal ? "primaryGoalSelect" : "trainingTrackSelect";
    } else if (errors.experienceLevel) {
      targetName = "experienceLevelSelect";
    }

    const frame = window.requestAnimationFrame(() => {
      setStepIndex(targetStep);
      window.requestAnimationFrame(() => {
        formRef.current
          ?.querySelector<HTMLElement>(`[name="${targetName}"]`)
          ?.focus({ preventScroll: true });
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [state]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending || !canSubmit) return;

    const formData = new FormData(event.currentTarget);
    setTurnstileToken("");
    if (turnstileEnabled) setTurnstileState("loading");
    setTurnstileKey((key) => key + 1);
    startTransition(() => {
      formAction(formData);
    });
  }

  function focusContactError(errors: RegistrationContactErrors) {
    const fieldName = errors.name ? "name" : errors.phone ? "phone" : null;
    if (!fieldName) return;

    window.requestAnimationFrame(() => {
      formRef.current
        ?.querySelector<HTMLElement>(`[name="${fieldName}"]`)
        ?.focus({ preventScroll: true });
    });
  }

  function continueFromCurrentStep() {
    if (stepIndex === 0) {
      const errors = validateRegistrationContact(name, phone);
      setContactErrors(errors);
      if (errors.name || errors.phone) {
        focusContactError(errors);
        return;
      }
    }

    setStepIndex((step) => Math.min(registration.dialogSteps.length - 1, step + 1));
  }

  function resetTurnstile() {
    setTurnstileToken("");
    setTurnstileState(initialTurnstileState);
    setTurnstileKey((key) => key + 1);
  }

  function goBackOneStep() {
    if (stepIndex === registration.dialogSteps.length - 1) resetTurnstile();
    setStepIndex((step) => Math.max(0, step - 1));
  }

  const canContinueFromContact = name.trim().length > 0 && phone.trim().length > 0;
  const canContinueFromPreferences = primaryGoal !== null && trainingTrack !== null;
  const canSubmit =
    experienceLevel !== null &&
    consent &&
    renderedAt.length > 0 &&
    ((!turnstileRequired && !turnstileEnabled) ||
      (turnstileState === "verified" && turnstileToken.length > 0));

  const activeStep = registration.dialogSteps[stepIndex];

  return (
    <>
      {/*
        The one #registration target on the page. Every CTA points here.

        With JavaScript on it renders nothing visible and behaves exactly like
        the scroll sentinel it replaces — the dialog does the work.

        With JavaScript off the dialog can never open, so this is what the
        visitor actually lands on. It has to say so and offer a way through,
        otherwise the CTA is a button that silently does nothing.

        A no-JS version of the form itself is not the fix here: the intake is a
        multi-step wizard whose later fields do not exist in the DOM until the
        earlier steps advance, and Turnstile requires JavaScript by definition.
        A native submit would post a half-empty request that fails validation
        and spends the visitor's IP rate limit. Viber is the working path.
      */}
      <div id="registration" className="scroll-mt-24">
        <noscript>
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-accent/20 bg-accent-soft/40 p-6 text-center sm:p-8">
            <p className="font-display text-xl font-semibold text-foreground">
              {registration.heading}
            </p>
            <p className="mt-3 text-base leading-relaxed text-muted">
              Формата за записване изисква включен JavaScript. Ако не можеш да го включиш, пиши
              директно на Радослава във Viber — така или иначе това е следващата стъпка след
              записване.
            </p>
            <a
              href={viberContact.deepLink}
              className="mt-5 inline-block rounded-full bg-accent px-7 py-3 font-semibold text-white"
            >
              {registration.viberButtonLabel}
            </a>
            <p className="mt-3 text-sm text-muted">{viberContact.phoneDisplay}</p>
          </div>
        </noscript>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="registration-dialog-title"
        aria-describedby="registration-dialog-intro"
        className="m-0 h-[100dvh] max-h-none w-full max-w-none overflow-hidden border-0 bg-surface p-0 text-foreground backdrop:bg-plum/75 backdrop:backdrop-blur-sm open:flex open:flex-col sm:m-auto sm:h-auto sm:max-h-[90dvh] sm:max-w-2xl sm:rounded-[2rem] sm:border sm:border-white/70 sm:shadow-2xl"
        onCancel={(event) => {
          event.preventDefault();
          closeDialogFromUi();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialogFromUi();
        }}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-border bg-surface/95 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur sm:gap-4 sm:px-8 sm:pt-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-hover">
              {siteConfig.hero.eyebrow}
            </p>
            <h2 id="registration-dialog-title" className="mt-1 font-display text-[1.35rem] font-semibold leading-tight sm:text-3xl">
              {registration.dialogTitle}
            </h2>
            <p id="registration-dialog-intro" className="mt-1 text-sm text-muted">
              {registration.dialogIntro}
            </p>
          </div>
          <button
            type="button"
            aria-label={registration.closeLabel}
            onClick={closeDialogFromUi}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-white/70 text-foreground transition-colors hover:border-accent/40 hover:bg-accent-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X aria-hidden="true" className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        {isSuccess ? (
          <div role="status" className="flex flex-1 flex-col items-center justify-center gap-5 overflow-y-auto px-4 py-8 text-center sm:px-10 sm:py-10">
            <span className="animate-fade-up flex h-16 w-16 items-center justify-center rounded-full bg-lime/30 text-accent-hover">
              <Check aria-hidden="true" className="h-8 w-8" strokeWidth={2.5} />
            </span>
            <div>
              <p className="text-2xl font-semibold text-foreground">{registration.successHeading}</p>
              <p className="mt-3 max-w-md text-base leading-relaxed text-muted">{registration.successBody}</p>
            </div>
            <Button type="button" onClick={() => void copyViberNumber()} className="mt-2 w-full sm:w-auto">
              {viberCopyState === "copied" ? "Номерът е копиран" : "Копирай номера за Viber"}
            </Button>
            <p aria-live="polite" className="max-w-md text-sm leading-relaxed text-muted">
              {viberCopyState === "copied" ? (
                <>
                  Копирано:{" "}
                  <span className="select-all whitespace-nowrap font-semibold text-foreground">
                    {viberContact.phoneE164}
                  </span>
                  . Отвори Viber → Още → Добави контакт и постави номера.
                </>
              ) : viberCopyState === "error" ? (
                <>
                  Копирането не се получи. Задръж върху номера и го копирай ръчно:{" "}
                  <span className="select-all whitespace-nowrap font-semibold text-foreground">
                    {viberContact.phoneE164}
                  </span>
                  .
                </>
              ) : (
                <>
                  Надеждният начин е да добавиш Радослава като контакт с номер{" "}
                  <span className="select-all whitespace-nowrap font-semibold text-foreground">
                    {viberContact.phoneE164}
                  </span>
                  .
                </>
              )}
            </p>
            <Button href={viberContact.deepLink} variant="secondary" className="w-full sm:w-auto">
              Опитай да отвориш Viber
            </Button>
            <Button type="button" variant="secondary" onClick={closeDialogFromUi} className="w-full sm:w-auto">
              {registration.closeLabel}
            </Button>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div aria-hidden="true" className="hidden">
              <label htmlFor="company">Company</label>
              <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
            </div>
            <input type="hidden" name="renderedAt" value={renderedAt} readOnly />
            <input type="hidden" name="turnstileToken" value={turnstileToken} readOnly />
            <input type="hidden" name="primaryGoal" value={primaryGoal ?? ""} readOnly />
            <input type="hidden" name="trainingTrack" value={trainingTrack ?? ""} readOnly />
            <input type="hidden" name="experienceLevel" value={experienceLevel ?? ""} readOnly />
            {stepIndex > 0 && (
              <>
                <input type="hidden" name="name" value={name} readOnly />
                <input type="hidden" name="phone" value={phone} readOnly />
              </>
            )}

            <div ref={stepContentRef} className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-8 sm:py-6">
              <div className="mb-6" aria-label={`Стъпка ${stepIndex + 1} от ${registration.dialogSteps.length}`}>
                <div className="flex gap-2" aria-hidden="true">
                  {registration.dialogSteps.map((dialogStep, index) => (
                    <span
                      key={dialogStep.title}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        index <= stepIndex ? "bg-accent" : "bg-border"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-accent-hover">
                  Стъпка {stepIndex + 1} от {registration.dialogSteps.length}
                </p>
                <h3
                  id="registration-step-heading"
                  tabIndex={-1}
                  className="mt-2 text-xl font-semibold text-foreground focus:outline-none"
                >
                  {activeStep.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{activeStep.body}</p>
              </div>

              {stepIndex === 0 && (
                <div className="flex flex-col gap-5">
                  <FormField
                    id="name"
                    name="name"
                    label={INTAKE_COPY.name.label}
                    autoComplete="name"
                    error={contactErrors.name ?? state.fieldErrors?.name}
                    value={name}
                    onChange={(value) => {
                      setName(value);
                      if (contactErrors.name) {
                        setContactErrors((errors) => ({ ...errors, name: undefined }));
                      }
                    }}
                    icon={<User className="h-5 w-5" strokeWidth={1.75} />}
                  />
                  <FormField
                    id="phone"
                    name="phone"
                    label={INTAKE_COPY.phone.label}
                    type="tel"
                    autoComplete="tel"
                    error={contactErrors.phone ?? state.fieldErrors?.phone}
                    value={phone}
                    onChange={(value) => {
                      setPhone(value);
                      if (contactErrors.phone) {
                        setContactErrors((errors) => ({ ...errors, phone: undefined }));
                      }
                    }}
                    icon={<Phone className="h-5 w-5" strokeWidth={1.75} />}
                  />
                </div>
              )}

              {stepIndex === 1 && (
                <div className="flex flex-col gap-6">
                  <SingleSelect
                    legend={INTAKE_COPY.goal.question}
                    name="primaryGoalSelect"
                    options={GOAL_OPTIONS_WITH_ICONS}
                    value={primaryGoal}
                    onChange={setPrimaryGoal}
                    error={state.fieldErrors?.primaryGoal}
                  />
                  <SingleSelect
                    legend={INTAKE_COPY.trainingTrack.question}
                    name="trainingTrackSelect"
                    layout="row"
                    options={TRACK_OPTIONS_WITH_ICONS}
                    value={trainingTrack}
                    onChange={setTrainingTrack}
                    error={state.fieldErrors?.trainingTrack}
                  />
                </div>
              )}

              {stepIndex === 2 && (
                <div className="flex flex-col gap-6">
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
                    className="flex min-h-11 cursor-pointer items-start gap-3 rounded-2xl border border-border bg-surface/60 p-4 transition-colors duration-200 hover:border-accent/30 hover:bg-accent-soft/30"
                  >
                    <input
                      id="consent"
                      name="consent"
                      type="checkbox"
                      required
                      checked={consent}
                      onChange={(event) => setConsent(event.target.checked)}
                      aria-describedby={state.fieldErrors?.consent ? "consent-error" : undefined}
                      className="mt-0.5 h-5 w-5 shrink-0 rounded border-border text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    />
                    <span className="text-sm leading-relaxed text-muted">{registration.privacyLabel}</span>
                  </label>
                  {state.fieldErrors?.consent && (
                    <p id="consent-error" className="-mt-3 text-sm text-accent">
                      {state.fieldErrors.consent}
                    </p>
                  )}

                  {(turnstileState === "loading" || turnstileState === "verified") && (
                    <TurnstileWidget
                      key={turnstileKey}
                      onToken={setTurnstileToken}
                      onStateChange={setTurnstileState}
                    />
                  )}

                  {turnstileState === "loading" && (
                    <p role="status" className="text-sm text-muted">
                      {registration.securityCheckLoading}
                    </p>
                  )}

                  {(turnstileState === "configuration" ||
                    turnstileState === "error" ||
                    turnstileState === "expired") && (
                    <div role="alert" className="rounded-2xl border border-accent/30 bg-accent-soft/50 p-4">
                      <p className="text-sm leading-relaxed text-accent-hover">
                        {turnstileState === "expired"
                          ? registration.securityCheckExpired
                          : registration.securityCheckError}
                      </p>
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                        {turnstileState !== "configuration" && (
                          <Button type="button" variant="secondary" onClick={resetTurnstile} className="px-5">
                            {registration.securityCheckRetryLabel}
                          </Button>
                        )}
                        <Button href={viberContact.deepLink} className="px-5">
                          {registration.securityCheckViberLabel}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {state.status === "error" && state.message && (
                <div
                  aria-live="polite"
                  className="mt-5 rounded-xl bg-accent-soft px-4 py-3 text-sm text-accent-hover"
                >
                  <p>{state.message}</p>
                  {!state.fieldErrors && (
                    <a
                      href={viberContact.deepLink}
                      className="mt-2 inline-block font-semibold underline underline-offset-4"
                    >
                      {registration.securityCheckViberLabel}
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-border bg-surface/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur sm:gap-3 sm:px-8 sm:pb-5">
              {stepIndex > 0 ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={goBackOneStep}
                  className="gap-2 px-5"
                >
                  <ArrowLeft aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
                  {registration.backLabel}
                </Button>
              ) : (
                <span />
              )}

              {stepIndex < registration.dialogSteps.length - 1 ? (
                <Button
                  type="button"
                  disabled={stepIndex === 0 ? !canContinueFromContact : !canContinueFromPreferences}
                  onClick={continueFromCurrentStep}
                  className="gap-2 px-5"
                >
                  {registration.nextLabel}
                  <ArrowRight aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
                </Button>
              ) : (
                <Button type="submit" disabled={!canSubmit || isPending} ariaBusy={isPending} className="px-5">
                  {isPending ? "Изпращане..." : registration.submitLabel}
                </Button>
              )}
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
