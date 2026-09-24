import { describe, expect, it } from "vitest";
import { buildWorkspaceUrl, pickSuggestions, planSubmit } from "./composer";

describe("buildWorkspaceUrl", () => {
  it("builds the workspace URL from a prompt", () => {
    expect(buildWorkspaceUrl("A todo app")).toBe(
      "/workspace?prompt=A%20todo%20app",
    );
  });

  it("trims surrounding whitespace before encoding", () => {
    expect(buildWorkspaceUrl("  \n A todo app \t\n")).toBe(
      "/workspace?prompt=A%20todo%20app",
    );
  });

  it.each(["", "   \n", "\t \n  "])(
    "returns null for an empty or whitespace-only prompt (%j)",
    (prompt) => {
      expect(buildWorkspaceUrl(prompt)).toBeNull();
    },
  );

  it("encodes characters that would break the query string", () => {
    expect(buildWorkspaceUrl("Tom & Jerry? #1")).toBe(
      "/workspace?prompt=Tom%20%26%20Jerry%3F%20%231",
    );
  });

  it("keeps inner newlines and emoji, percent-encoded", () => {
    expect(buildWorkspaceUrl("Line one\nLine two 🚀")).toBe(
      "/workspace?prompt=Line%20one%0ALine%20two%20%F0%9F%9A%80",
    );
  });

  it("round-trips through URLSearchParams to the trimmed prompt", () => {
    const url = buildWorkspaceUrl("  a=b&c?d#e\n🌅  ")!;
    const params = new URLSearchParams(url.split("?")[1]);
    expect(params.get("prompt")).toBe("a=b&c?d#e\n🌅");
  });
});

describe("pickSuggestions", () => {
  const items = ["a", "b", "c", "d", "e", "f"];

  it("always returns `count` distinct items from the list", () => {
    for (let run = 0; run < 200; run++) {
      const picked = pickSuggestions(items, 3);
      expect(picked).toHaveLength(3);
      expect(new Set(picked).size).toBe(3);
      for (const item of picked) expect(items).toContain(item);
    }
  });

  it("returns every item when asked for more than the list has", () => {
    const picked = pickSuggestions(["x", "y"], 3);
    expect([...picked].sort()).toEqual(["x", "y"]);
  });

  it("is deterministic for a given RNG", () => {
    const stub = () => {
      const seq = [0.99, 0.5, 0];
      let i = 0;
      return () => seq[i++ % seq.length];
    };
    expect(pickSuggestions(items, 3, stub())).toEqual(["f", "d", "c"]);
    expect(pickSuggestions(items, 3, stub())).toEqual(["f", "d", "c"]);
  });

  it("does not mutate the source list", () => {
    const source = [...items];
    pickSuggestions(source, 3, () => 0.7);
    expect(source).toEqual(items);
  });

  it.each([1, -0.5, Number.NaN])(
    "still returns three distinct items when the RNG misbehaves (%s)",
    (value) => {
      const picked = pickSuggestions(items, 3, () => value);
      expect(picked).toHaveLength(3);
      expect(new Set(picked).size).toBe(3);
      for (const item of picked) expect(items).toContain(item);
    },
  );
});

describe("planSubmit", () => {
  it("opens sign-in redirecting to the workspace URL when signed out", () => {
    expect(
      planSubmit(" Kanban & more ", { isLoaded: true, isSignedIn: false }),
    ).toEqual({
      type: "sign-in",
      forceRedirectUrl: "/workspace?prompt=Kanban%20%26%20more",
      signUpForceRedirectUrl: "/workspace?prompt=Kanban%20%26%20more",
    });
  });

  it("navigates straight to the workspace when signed in", () => {
    expect(planSubmit("A todo app", { isLoaded: true, isSignedIn: true })).toEqual(
      { type: "navigate", url: "/workspace?prompt=A%20todo%20app" },
    );
  });

  it("navigates while Clerk is still loading, leaving auth to the proxy", () => {
    expect(
      planSubmit("A todo app", { isLoaded: false, isSignedIn: undefined }),
    ).toEqual({ type: "navigate", url: "/workspace?prompt=A%20todo%20app" });
  });

  it.each(["", "  \n "])("plans nothing for a blank prompt (%j)", (prompt) => {
    expect(planSubmit(prompt, { isLoaded: true, isSignedIn: true })).toBeNull();
    expect(planSubmit(prompt, { isLoaded: true, isSignedIn: false })).toBeNull();
  });
});
