import { isParticipantStage, type ParticipantStage } from "@/lib/admin/stages";

export const MAX_PARTICIPANT_SEARCH_LENGTH = 100;

export interface ParticipantListFilters {
  stage: ParticipantStage | null;
  query: string;
}

export type ParticipantListFilterResult =
  | { ok: true; filters: ParticipantListFilters }
  | { ok: false; message: string };

/**
 * Validates URL-controlled admin filters before they reach Supabase.
 *
 * Repeated parameters arrive as arrays in App Router pages; accepting one
 * arbitrarily makes validation dependent on framework ordering, so they are
 * rejected like every other malformed value.
 */
export function parseParticipantListFilters(
  stageValue: unknown,
  queryValue: unknown
): ParticipantListFilterResult {
  if (stageValue !== undefined && stageValue !== null && typeof stageValue !== "string") {
    return { ok: false, message: "Невалиден филтър за статус." };
  }
  if (queryValue !== undefined && queryValue !== null && typeof queryValue !== "string") {
    return { ok: false, message: "Невалидна заявка за търсене." };
  }

  const stageRaw = typeof stageValue === "string" ? stageValue.trim() : "";
  if (stageRaw && !isParticipantStage(stageRaw)) {
    return { ok: false, message: "Невалиден филтър за статус." };
  }

  const query = typeof queryValue === "string" ? queryValue.trim() : "";
  if (query.length > MAX_PARTICIPANT_SEARCH_LENGTH) {
    return {
      ok: false,
      message: `Търсенето може да съдържа най-много ${MAX_PARTICIPANT_SEARCH_LENGTH} символа.`,
    };
  }

  return {
    ok: true,
    filters: {
      stage: stageRaw ? (stageRaw as ParticipantStage) : null,
      query,
    },
  };
}

interface SearchableParticipant {
  name: string;
  email: string | null;
  phone: string;
}

function normalizeSearchText(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase("bg-BG");
}

/**
 * Searches already-authorized server-side rows without constructing raw
 * PostgREST filter syntax from user input.
 */
export function filterParticipantsByQuery<TParticipant extends SearchableParticipant>(
  participants: TParticipant[],
  query: string
): TParticipant[] {
  if (!query) return participants;

  const needle = normalizeSearchText(query);
  return participants.filter((participant) =>
    [participant.name, participant.email ?? "", participant.phone].some((value) =>
      normalizeSearchText(value).includes(needle)
    )
  );
}
