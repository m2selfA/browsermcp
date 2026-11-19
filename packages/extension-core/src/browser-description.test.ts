import { describe, expect, it } from "vitest";

import {
  MAX_BROWSER_DESCRIPTION_LENGTH,
  normalizeBrowserDescription,
} from "@browsermcp/protocol";

describe("normalizeBrowserDescription()", () => {
  it("collapses whitespace into one display line", () => {
    expect(normalizeBrowserDescription("  文献检索\n  Research\t only  ")).toBe(
      "文献检索 Research only",
    );
  });

  it.each([undefined, null, "", "  \n\t", 42, {}, []])(
    "treats an absent or invalid description as unset: %j",
    (value) => {
      expect(normalizeBrowserDescription(value)).toBeNull();
    },
  );

  it("strips control and bidi override characters without removing emoji joiners", () => {
    expect(normalizeBrowserDescription("A\u0000\u001b\u202eB\u2066C 👩‍💻")).toBe(
      "ABC 👩‍💻",
    );
  });

  it("caps Unicode code points without splitting surrogates or keeping trailing spaces", () => {
    const n = MAX_BROWSER_DESCRIPTION_LENGTH;
    expect(normalizeBrowserDescription("😀".repeat(n + 1))).toBe(
      "😀".repeat(n),
    );
    expect(normalizeBrowserDescription(`${"a".repeat(n - 1)} b`)).toBe(
      "a".repeat(n - 1),
    );
  });
});
