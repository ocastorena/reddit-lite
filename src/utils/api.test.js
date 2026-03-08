import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

let fetchPosts, fetchPopularSubreddits, fetchComments, fetchSubredditDetails;

const mockJsonResponse = (data, options = {}) => ({
  ok: options.ok ?? true,
  status: options.status ?? 200,
  json: () => Promise.resolve(data),
});

const listing = (children) => ({
  data: { children: children.map((c) => ({ data: c })) },
});

beforeEach(async () => {
  vi.stubGlobal("fetch", vi.fn());
  // Re-import to get a fresh module with empty cache each test
  vi.resetModules();
  const mod = await import("./api.js");
  fetchPosts = mod.fetchPosts;
  fetchPopularSubreddits = mod.fetchPopularSubreddits;
  fetchComments = mod.fetchComments;
  fetchSubredditDetails = mod.fetchSubredditDetails;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchPosts", () => {
  it("returns posts filtered by over_18", async () => {
    const posts = [
      { id: "1", title: "Safe", over_18: false },
      { id: "2", title: "NSFW", over_18: true },
      { id: "3", title: "Also safe" },
    ];
    fetch.mockResolvedValueOnce(mockJsonResponse(listing(posts)));

    const result = await fetchPosts("reactjs");

    expect(result).toEqual([
      { id: "1", title: "Safe", over_18: false },
      { id: "3", title: "Also safe" },
    ]);
    expect(fetch).toHaveBeenCalledOnce();
    expect(fetch.mock.calls[0][0]).toContain("/r/reactjs.json");
  });

  it("throws on empty subreddit name", async () => {
    await expect(fetchPosts("  ")).rejects.toThrow(
      "A subreddit name is required."
    );
  });

  it("encodes special characters in subreddit name", async () => {
    fetch.mockResolvedValueOnce(mockJsonResponse(listing([])));
    await fetchPosts("a&b");
    expect(fetch.mock.calls[0][0]).toContain("/r/a%26b.json");
  });

  it("throws on unexpected response shape", async () => {
    fetch.mockResolvedValueOnce(mockJsonResponse({ wrong: "shape" }));
    await expect(fetchPosts("reactjs")).rejects.toThrow(
      "Unexpected Reddit response"
    );
  });
});

describe("fetchPopularSubreddits", () => {
  it("returns subreddits filtered by over18", async () => {
    const subs = [
      { id: "s1", display_name: "pics", over18: false },
      { id: "s2", display_name: "nsfw_sub", over18: true },
    ];
    fetch.mockResolvedValueOnce(mockJsonResponse(listing(subs)));

    const result = await fetchPopularSubreddits();

    expect(result).toEqual([
      { id: "s1", display_name: "pics", over18: false },
    ]);
  });

  it(
    "falls back to /r/popular on CORS/network error",
    async () => {
      // Primary request: 3 attempts (1 initial + 2 retries), all fail with TypeError
      fetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));
      fetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));
      fetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));

      const popularPosts = [
        {
          subreddit: "AskReddit",
          subreddit_name_prefixed: "r/AskReddit",
          sr_detail: { id: "sr1", icon_img: "icon.png", url: "/r/AskReddit/" },
        },
        {
          subreddit: "AskReddit",
          subreddit_name_prefixed: "r/AskReddit",
          sr_detail: { id: "sr1", icon_img: "icon.png", url: "/r/AskReddit/" },
        },
      ];
      // Fallback request succeeds
      fetch.mockResolvedValueOnce(mockJsonResponse(listing(popularPosts)));

      const result = await fetchPopularSubreddits();

      expect(result).toHaveLength(1);
      expect(result[0].display_name).toBe("AskReddit");
      expect(result[0].id).toBe("sr1");
    },
    15000
  );

  it("throws when both primary and fallback fail", async () => {
    fetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    fetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(fetchPopularSubreddits()).rejects.toThrow();
  });
});

describe("fetchComments", () => {
  it("returns comments array from second listing", async () => {
    const comments = [
      { id: "c1", body: "Great post" },
      { id: "c2", body: "Thanks" },
    ];
    const response = [
      listing([{ id: "post1" }]),
      { data: { children: comments.map((c) => ({ data: c })) } },
    ];
    fetch.mockResolvedValueOnce(mockJsonResponse(response));

    const result = await fetchComments("reactjs", "abc123");

    expect(result).toEqual(comments);
    expect(fetch.mock.calls[0][0]).toContain(
      "/r/reactjs/comments/abc123.json"
    );
  });

  it("throws on empty postId", async () => {
    await expect(fetchComments("reactjs", "")).rejects.toThrow(
      "A post id is required."
    );
  });

  it("throws on unexpected comment response shape", async () => {
    fetch.mockResolvedValueOnce(mockJsonResponse([listing([]), {}]));
    await expect(fetchComments("reactjs", "abc")).rejects.toThrow(
      "Unexpected Reddit response"
    );
  });
});

describe("fetchSubredditDetails", () => {
  it("returns subreddit data", async () => {
    const details = { display_name: "reactjs", subscribers: 500000 };
    fetch.mockResolvedValueOnce(mockJsonResponse({ data: details }));

    const result = await fetchSubredditDetails("reactjs");

    expect(result).toEqual(details);
    expect(fetch.mock.calls[0][0]).toContain("/r/reactjs/about.json");
  });

  it("throws on missing data field", async () => {
    fetch.mockResolvedValueOnce(mockJsonResponse({ wrong: true }));
    await expect(fetchSubredditDetails("reactjs")).rejects.toThrow(
      "Unexpected Reddit response"
    );
  });

  it("throws on empty subreddit", async () => {
    await expect(fetchSubredditDetails("")).rejects.toThrow(
      "A subreddit name is required."
    );
  });
});

describe("retry and error handling", () => {
  it(
    "retries on 500 errors and eventually succeeds",
    async () => {
      fetch.mockResolvedValueOnce(
        mockJsonResponse(null, { ok: false, status: 500 })
      );
      fetch.mockResolvedValueOnce(
        mockJsonResponse({ data: { display_name: "test", subscribers: 1 } })
      );

      const result = await fetchSubredditDetails("test");
      expect(result).toEqual({ display_name: "test", subscribers: 1 });
      expect(fetch).toHaveBeenCalledTimes(2);
    },
    15000
  );

  it(
    "throws after exhausting retries on server errors",
    async () => {
      fetch.mockResolvedValueOnce(
        mockJsonResponse(null, { ok: false, status: 500 })
      );
      fetch.mockResolvedValueOnce(
        mockJsonResponse(null, { ok: false, status: 500 })
      );
      fetch.mockResolvedValueOnce(
        mockJsonResponse(null, { ok: false, status: 500 })
      );

      await expect(fetchSubredditDetails("test")).rejects.toThrow(
        "Reddit API request failed (500)"
      );
    },
    15000
  );

  it("throws on non-retryable HTTP errors (e.g. 404)", async () => {
    fetch.mockResolvedValueOnce(
      mockJsonResponse(null, { ok: false, status: 404 })
    );

    await expect(fetchPosts("nonexistent")).rejects.toThrow(
      "Reddit API request failed (404)"
    );
    expect(fetch).toHaveBeenCalledOnce();
  });

  it(
    "retries on network TypeError and wraps as CORS error",
    async () => {
      fetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));
      fetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));
      fetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));

      await expect(fetchSubredditDetails("corstest")).rejects.toThrow(
        "Reddit blocked the request"
      );
    },
    15000
  );

  it("returns cached data on second call", async () => {
    const details = { display_name: "cached", subscribers: 42 };
    fetch.mockResolvedValueOnce(mockJsonResponse({ data: details }));

    const first = await fetchSubredditDetails("cached");
    const second = await fetchSubredditDetails("cached");

    expect(first).toEqual(details);
    expect(second).toEqual(details);
    expect(fetch).toHaveBeenCalledOnce();
  });

  it(
    "handles abort/timeout by retrying then throwing timeout error",
    async () => {
      const abortError = new DOMException(
        "The operation was aborted",
        "AbortError"
      );
      fetch.mockRejectedValueOnce(abortError);
      fetch.mockRejectedValueOnce(abortError);
      fetch.mockRejectedValueOnce(abortError);

      await expect(fetchSubredditDetails("timeouttest")).rejects.toThrow(
        "Request timed out"
      );
    },
    15000
  );
});
