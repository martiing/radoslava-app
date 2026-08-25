export interface PainPoint {
  text: string;
}

export interface ResultClient {
  name: string;
  beforeSrc: string;
  afterSrc: string;
  quote: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface OfferValueItem {
  text: string;
}

export interface OfferDayPreview {
  heading: string;
  toggleHomeLabel: string;
  toggleGymLabel: string;
  mealLine: string;
  workoutHomeLine: string;
  workoutGymLine: string;
  doneLine: string;
}

export interface OfferPrice {
  amount: string;
  period: string;
  note: string;
}

export interface FitCheckChip {
  id: string;
  problem: string;
  solution: string;
}

export interface RegistrationFlowStep {
  title: string;
  body: string;
}

export interface RegistrationDialogStep {
  title: string;
  body: string;
}

export interface SiteConfig {
  meta: {
    title: string;
    description: string;
    siteUrl: string;
  };
  header: {
    brandShort: string;
    brandFull: string;
    brandMobile: string;
    ctaLabel: string;
  };
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    ctaPrimaryLabel: string;
    ctaSecondaryLabel: string;
    startDate: string;
    registrationDeadline: string;
    price: string;
    photoSrc: string | null;
  };
  painPoints: {
    heading: string;
    intro: string;
    items: PainPoint[];
  };
  offerBlock: {
    eyebrow: string;
    heading: string;
    subhead: string;
    valuesLabel: string;
    values: OfferValueItem[];
    dayPreview: OfferDayPreview;
    price: OfferPrice;
    ctaLabel: string;
    guarantee: string;
  };
  fitCheck: {
    heading: string;
    subhead: string;
    chipsLabel: string;
    defaultPanelText: string;
    chips: FitCheckChip[];
  };
  meetRadoslava: {
    heading: string;
    subhead: string;
    photoSrc: string | null;
    bio: string;
    credentialBadge: string;
    credentials: string[];
    results: {
      clients: ResultClient[];
      disclaimer: string;
    };
  };
  registration: {
    heading: string;
    intro: string;
    ctaLabel: string;
    flowHeading: string;
    flowSteps: RegistrationFlowStep[];
    dialogTitle: string;
    dialogIntro: string;
    dialogSteps: RegistrationDialogStep[];
    nextLabel: string;
    backLabel: string;
    closeLabel: string;
    privacyLabel: string;
    submitLabel: string;
    securityCheckLoading: string;
    securityCheckError: string;
    securityCheckExpired: string;
    securityCheckRetryLabel: string;
    securityCheckViberLabel: string;
    successHeading: string;
    successBody: string;
    viberButtonLabel: string;
  };
  quiz: {
    heading: string;
    intro: string;
    nextLabel: string;
    backLabel: string;
    submitLabel: string;
    successMessage: string;
    skipNote: string;
  };
  faq: {
    heading: string;
    items: FaqItem[];
  };
  finalCta: {
    headline: string;
    body: string;
    ctaLabel: string;
  };
  viberContact: {
    /** Local display format, e.g. "0896 273 376". */
    phoneDisplay: string;
    /** viber://chat deep link straight to Radoslava's contact. */
    deepLink: string;
  };
  footer: {
    projectName: string;
    contactEmail: string;
    instagramUrl: string | null;
    privacyPolicyHref: string;
    termsHref: string;
    medicalDisclaimer: string;
    /**
     * ISO date of the current privacy policy. Stored alongside every lead so
     * you can prove which version of the policy a person actually agreed to.
     * Bump it whenever the policy text changes materially.
     */
    privacyPolicyVersion: string;
  };
}
