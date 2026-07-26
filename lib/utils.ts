export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Shared "nearly full width, capped on huge screens" container used by header, footer, hero and section panels. */
export const wideContainer = "mx-auto w-[calc(100%-2rem)] max-w-[1800px] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-5rem)]";
