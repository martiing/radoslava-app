export interface PainPoint {
  text: string;
}

export interface ChallengeFeature {
  title: string;
  description: string;
}

export interface Testimonial {
  id: string;
  name: string;
  timeframe: string;
  quote: string;
  beforeSrc: string | null;
  afterSrc: string | null;
}

export interface Step {
  title: string;
  description: string;
}

export interface Benefit {
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
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
    ctaLabel: string;
  };
  hero: {
    eyebrow: string;
    headline: string;
    subheadline: string;
    ctaPrimaryLabel: string;
    ctaSecondaryLabel: string;
    capacity: string;
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
  challenge: {
    heading: string;
    intro: string;
    disclaimer: string;
    features: ChallengeFeature[];
  };
  aboutRadoslava: {
    heading: string;
    photoSrc: string | null;
    story: string[];
    qualifications: string;
    experience: string;
    clientCount: string;
  };
  clientResults: {
    heading: string;
    intro: string;
    disclaimer: string;
    testimonials: Testimonial[];
  };
  howItWorks: {
    heading: string;
    steps: Step[];
  };
  whatYouGet: {
    heading: string;
    benefits: Benefit[];
    bonus: string;
  };
  limitedSpots: {
    heading: string;
    reasonText: string;
    registrationDeadline: string;
    capacity: string;
    ctaLabel: string;
  };
  registration: {
    heading: string;
    intro: string;
    successMessage: string;
    privacyLabel: string;
    submitLabel: string;
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
  footer: {
    projectName: string;
    contactEmail: string;
    instagramUrl: string;
    privacyPolicyHref: string;
    termsHref: string;
    medicalDisclaimer: string;
  };
}
