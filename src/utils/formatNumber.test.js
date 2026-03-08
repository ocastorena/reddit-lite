import { describe, it, expect } from "vitest";
import { formatNumber } from "./formatNumber.js";

describe("formatNumber", () => {
  it("returns numbers below 1000 as-is", () => {
    expect(formatNumber(0)).toBe(0);
    expect(formatNumber(1)).toBe(1);
    expect(formatNumber(999)).toBe(999);
  });

  it("formats thousands with K suffix", () => {
    expect(formatNumber(1000)).toBe("1.0K");
    expect(formatNumber(1500)).toBe("1.5K");
    expect(formatNumber(999999)).toBe("1000.0K");
  });

  it("formats millions with M suffix", () => {
    expect(formatNumber(1000000)).toBe("1.0M");
    expect(formatNumber(2500000)).toBe("2.5M");
    expect(formatNumber(10000000)).toBe("10.0M");
  });
});
