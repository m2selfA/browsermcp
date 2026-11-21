import { normalizeBrowserDescription } from "@browsermcp/protocol";

import { normalizeBrowserLabel } from "./browser-label";

/** Maximum Unicode code points in the displayed description, including its ellipsis. */
export const PROFILE_TITLE_DESCRIPTION_LENGTH = 30;

/** Formats the profile name and short purpose for the toolbar and popup header. */
export function formatProfileTitle(
  storedLabel: string | null | undefined,
  storedDescription: string | null | undefined,
  fallback: string,
): string {
  const label = normalizeBrowserLabel(storedLabel);
  const characters = Array.from(
    normalizeBrowserDescription(storedDescription) ?? "",
  );
  const description =
    characters.length > PROFILE_TITLE_DESCRIPTION_LENGTH
      ? `${characters.slice(0, PROFILE_TITLE_DESCRIPTION_LENGTH - 1).join("")}…`
      : characters.join("");

  return [label, description].filter(Boolean).join(" - ") || fallback;
}
