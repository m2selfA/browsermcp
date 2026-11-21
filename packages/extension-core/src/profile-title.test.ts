import { describe, expect, it } from "vitest";

import {
  formatProfileTitle,
  PROFILE_TITLE_DESCRIPTION_LENGTH,
} from "./profile-title";

describe("formatProfileTitle()", () => {
  it("joins the profile name and description without extra copy", () => {
    expect(
      formatProfileTitle(" Research ", " University papers ", "Browser MCP"),
    ).toBe("Research - University papers");
  });

  it("shows whichever profile field is set and falls back only when both are empty", () => {
    expect(formatProfileTitle("Work", null, "Browser MCP")).toBe("Work");
    expect(formatProfileTitle(null, "QA", "Browser MCP")).toBe("QA");
    expect(formatProfileTitle(" ", " ", "Browser MCP")).toBe("Browser MCP");
  });

  it("keeps descriptions at the limit without an ellipsis", () => {
    const description = "文".repeat(PROFILE_TITLE_DESCRIPTION_LENGTH);
    expect(formatProfileTitle("Lab", description, "Browser MCP")).toBe(
      `Lab - ${description}`,
    );
  });

  it("truncates long descriptions to 29 code points and one ellipsis", () => {
    for (const character of ["文", "😀"]) {
      const description = character.repeat(
        PROFILE_TITLE_DESCRIPTION_LENGTH + 1,
      );
      const title = formatProfileTitle("Lab", description, "Browser MCP");
      expect(title).toBe(`Lab - ${character.repeat(29)}…`);
      expect(Array.from(title.slice("Lab - ".length))).toHaveLength(
        PROFILE_TITLE_DESCRIPTION_LENGTH,
      );
    }
  });
});
