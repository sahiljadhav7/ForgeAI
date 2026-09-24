import { describe, expect, it } from "vitest";
import {
  createRevealRegistry,
  shouldDeferReveal,
  type RevealEntry,
} from "./reveal";

// A stand-in for IntersectionObserver: records what is observed and lets the
// test fire entries by hand.
function fakeObserverFactory() {
  const created: FakeObserver[] = [];
  const factory = (onEntries: (entries: RevealEntry<string>[]) => void) => {
    const observer = new FakeObserver(onEntries);
    created.push(observer);
    return observer;
  };
  return { factory, created };
}

class FakeObserver {
  observed = new Set<string>();
  disconnected = false;
  constructor(private onEntries: (entries: RevealEntry<string>[]) => void) {}
  observe(target: string) {
    this.observed.add(target);
  }
  unobserve(target: string) {
    this.observed.delete(target);
  }
  disconnect() {
    this.observed.clear();
    this.disconnected = true;
  }
  fire(...entries: RevealEntry<string>[]) {
    this.onEntries(entries);
  }
}

describe("createRevealRegistry", () => {
  it("reveals a watched element when it intersects", () => {
    const { factory, created } = fakeObserverFactory();
    const registry = createRevealRegistry(factory);
    const revealed: string[] = [];

    registry.watch("a", () => revealed.push("a"));
    created[0].fire({ target: "a", isIntersecting: true });

    expect(revealed).toEqual(["a"]);
  });

  it("does not reveal an element that is not intersecting", () => {
    const { factory, created } = fakeObserverFactory();
    const registry = createRevealRegistry(factory);
    const revealed: string[] = [];

    registry.watch("a", () => revealed.push("a"));
    created[0].fire({ target: "a", isIntersecting: false });

    expect(revealed).toEqual([]);
  });

  it("reveals each element only once and stops observing it", () => {
    const { factory, created } = fakeObserverFactory();
    const registry = createRevealRegistry(factory);
    const revealed: string[] = [];

    registry.watch("a", () => revealed.push("a"));
    registry.watch("b", () => revealed.push("b"));
    created[0].fire({ target: "a", isIntersecting: true });
    created[0].fire({ target: "a", isIntersecting: true });

    expect(revealed).toEqual(["a"]);
    expect([...created[0].observed]).toEqual(["b"]);
  });

  it("shares one observer between all watched elements", () => {
    const { factory, created } = fakeObserverFactory();
    const registry = createRevealRegistry(factory);

    registry.watch("a", () => {});
    registry.watch("b", () => {});
    registry.watch("c", () => {});

    expect(created).toHaveLength(1);
    expect([...created[0].observed]).toEqual(["a", "b", "c"]);
  });

  it("unwatching stops observing and never reveals", () => {
    const { factory, created } = fakeObserverFactory();
    const registry = createRevealRegistry(factory);
    const revealed: string[] = [];

    const unwatch = registry.watch("a", () => revealed.push("a"));
    registry.watch("b", () => {});
    unwatch();
    created[0].fire({ target: "a", isIntersecting: true });

    expect(revealed).toEqual([]);
    expect([...created[0].observed]).toEqual(["b"]);
  });

  it("disconnects once nothing is left and starts a new observer on the next watch", () => {
    const { factory, created } = fakeObserverFactory();
    const registry = createRevealRegistry(factory);

    const unwatchA = registry.watch("a", () => {});
    registry.watch("b", () => {});
    created[0].fire({ target: "b", isIntersecting: true });
    expect(created[0].disconnected).toBe(false);
    unwatchA();
    expect(created[0].disconnected).toBe(true);

    registry.watch("c", () => {});
    expect(created).toHaveLength(2);
    expect([...created[1].observed]).toEqual(["c"]);
  });
});

describe("shouldDeferReveal", () => {
  it("defers an element that starts below the fold", () => {
    expect(
      shouldDeferReveal({ top: 1200, viewportHeight: 900, reducedMotion: false }),
    ).toBe(true);
  });

  it("defers an element whose top sits exactly on the fold", () => {
    expect(
      shouldDeferReveal({ top: 900, viewportHeight: 900, reducedMotion: false }),
    ).toBe(true);
  });

  it.each([
    ["partly on screen", 600],
    ["already scrolled past", -400],
  ])("leaves an element that is %s visible", (_, top) => {
    expect(
      shouldDeferReveal({ top, viewportHeight: 900, reducedMotion: false }),
    ).toBe(false);
  });

  it("never defers under reduced motion", () => {
    expect(
      shouldDeferReveal({ top: 1200, viewportHeight: 900, reducedMotion: true }),
    ).toBe(false);
  });
});
