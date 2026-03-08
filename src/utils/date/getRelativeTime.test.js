import { describe, it, expect, vi, afterEach } from "vitest";
import { getRelativeTime } from "./getRelativeTime.js";

const NOW = new Date("2025-06-15T12:00:00Z");

describe("getRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const nowUnix = Math.floor(NOW.getTime() / 1000);

  it("returns 'just now' for very recent timestamps", () => {
    expect(getRelativeTime(nowUnix)).toBe("just now");
  });

  it("returns seconds ago", () => {
    expect(getRelativeTime(nowUnix - 1)).toBe("1 second ago");
    expect(getRelativeTime(nowUnix - 30)).toBe("30 seconds ago");
  });

  it("returns minutes ago", () => {
    expect(getRelativeTime(nowUnix - 60)).toBe("1 minute ago");
    expect(getRelativeTime(nowUnix - 120)).toBe("2 minutes ago");
  });

  it("returns hours ago", () => {
    expect(getRelativeTime(nowUnix - 3600)).toBe("1 hour ago");
    expect(getRelativeTime(nowUnix - 7200)).toBe("2 hours ago");
  });

  it("returns days ago", () => {
    expect(getRelativeTime(nowUnix - 86400)).toBe("1 day ago");
    expect(getRelativeTime(nowUnix - 172800)).toBe("2 days ago");
  });

  it("returns weeks ago", () => {
    expect(getRelativeTime(nowUnix - 604800)).toBe("1 week ago");
    expect(getRelativeTime(nowUnix - 1209600)).toBe("2 weeks ago");
  });

  it("returns months ago", () => {
    expect(getRelativeTime(nowUnix - 2592000)).toBe("1 month ago");
    expect(getRelativeTime(nowUnix - 5184000)).toBe("2 months ago");
  });

  it("returns years ago", () => {
    expect(getRelativeTime(nowUnix - 31536000)).toBe("1 year ago");
    expect(getRelativeTime(nowUnix - 63072000)).toBe("2 years ago");
  });

  it("uses singular form for exactly 1 unit", () => {
    expect(getRelativeTime(nowUnix - 60)).toBe("1 minute ago");
    expect(getRelativeTime(nowUnix - 3600)).toBe("1 hour ago");
    expect(getRelativeTime(nowUnix - 86400)).toBe("1 day ago");
  });
});
