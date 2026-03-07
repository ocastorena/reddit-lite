const IS_DEV = import.meta.env.DEV;
const BASE_URL = IS_DEV ? "/reddit-api" : "https://www.reddit.com";
const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_MAX_RETRIES = 2;
const BASE_RETRY_DELAY_MS = 400;
const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;

const responseCache = new Map();

const getCached = (key) => {
  const entry = responseCache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiry) {
    responseCache.delete(key);
    return undefined;
  }
  return entry.data;
};

const setCache = (key, data, ttl = DEFAULT_CACHE_TTL_MS) => {
  responseCache.set(key, { data, expiry: Date.now() + ttl });
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error) =>
  error?.name === "AbortError" || error instanceof TypeError;

const isCorsOrNetworkError = (error) => {
  if (error instanceof TypeError) {
    return true;
  }

  const message = error?.message ?? "";
  return /CORS|Failed to fetch|NetworkError|blocked the request/i.test(message);
};

const normalizeSubreddit = (subreddit) => {
  const trimmedSubreddit = subreddit?.trim();
  if (!trimmedSubreddit) {
    throw new Error("A subreddit name is required.");
  }

  return encodeURIComponent(trimmedSubreddit);
};

const normalizePostId = (postId) => {
  const trimmedPostId = postId?.trim();
  if (!trimmedPostId) {
    throw new Error("A post id is required.");
  }

  return encodeURIComponent(trimmedPostId);
};

const createUrl = (path) => {
  if (IS_DEV) {
    const separator = path.includes("?") ? "&" : "?";
    return `${BASE_URL}${path}${separator}raw_json=1`;
  }
  const url = new URL(path, BASE_URL);
  url.searchParams.set("raw_json", "1");
  return url.toString();
};

const fetchJsonWithRetry = async (path, requestDescription, { cacheTtl = DEFAULT_CACHE_TTL_MS } = {}) => {
  const cached = getCached(path);
  if (cached) return cached;

  let latestError = null;

  for (let attempt = 0; attempt <= DEFAULT_MAX_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      const response = await fetch(createUrl(path), {
        signal: controller.signal,
      });

      if (!response.ok) {
        if (response.status === 429 && attempt < DEFAULT_MAX_RETRIES) {
          await sleep(2000 * (attempt + 1));
          continue;
        }
        if (response.status >= 500 && attempt < DEFAULT_MAX_RETRIES) {
          await sleep(BASE_RETRY_DELAY_MS * (attempt + 1));
          continue;
        }

        const err = new Error(
          `Reddit API request failed (${response.status}) while loading ${requestDescription}`
        );
        err.status = response.status;
        throw err;
      }

      const data = await response.json();
      setCache(path, data, cacheTtl);
      return data;
    } catch (error) {
      latestError = error;
      if (isRetryableError(error)) {
        if (attempt < DEFAULT_MAX_RETRIES) {
          await sleep(BASE_RETRY_DELAY_MS * (attempt + 1));
          continue;
        }

        break;
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  if (latestError?.name === "AbortError") {
    throw new Error(`Request timed out while loading ${requestDescription}`);
  }

  if (isCorsOrNetworkError(latestError)) {
    throw new Error(
      `Reddit blocked the request while loading ${requestDescription}. This is usually temporary (CORS/rate limit). Please try again.`
    );
  }

  throw latestError;
};

const mapListingChildren = (json, requestDescription) => {
  const children = json?.data?.children;

  if (!Array.isArray(children)) {
    throw new Error(`Unexpected Reddit response while loading ${requestDescription}`);
  }

  return children.map((child) => child?.data).filter(Boolean);
};

const mapSubredditsFromPopularPosts = (posts) => {
  const uniqueSubreddits = new Map();

  for (const post of posts) {
    const displayName = post?.subreddit;
    if (!displayName || uniqueSubreddits.has(displayName)) {
      continue;
    }

    uniqueSubreddits.set(displayName, {
      id: post?.sr_detail?.id ?? `fallback-${displayName.toLowerCase()}`,
      display_name: displayName,
      display_name_prefixed: post?.subreddit_name_prefixed ?? `r/${displayName}`,
      icon_img: post?.sr_detail?.icon_img ?? "",
      url: post?.sr_detail?.url ?? `/r/${displayName}/`,
    });
  }

  return [...uniqueSubreddits.values()];
};

export const fetchPosts = async (subreddit) => {
  try {
    const normalizedSubreddit = normalizeSubreddit(subreddit);
    const json = await fetchJsonWithRetry(
      `/r/${normalizedSubreddit}.json`,
      `posts from r/${subreddit}`,
      { cacheTtl: 2 * 60 * 1000 }
    );
    const posts = mapListingChildren(json, `posts from r/${subreddit}`);
    return posts.filter((post) => !post.over_18);
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    throw error;
  }
};

export const fetchPopularSubreddits = async () => {
  try {
    const json = await fetchJsonWithRetry(
      "/subreddits/popular.json",
      "popular subreddits"
    );
    const subreddits = mapListingChildren(json, "popular subreddits");
    return subreddits.filter((sub) => !sub.over18);
  } catch (error) {
    const isRateLimited = error?.status === 429;
    if (isCorsOrNetworkError(error) || isRateLimited) {
      try {
        const fallbackJson = await fetchJsonWithRetry(
          "/r/popular.json",
          "popular posts"
        );
        const popularPosts = mapListingChildren(fallbackJson, "popular posts");
        const fallbackSubreddits = mapSubredditsFromPopularPosts(popularPosts);

        if (fallbackSubreddits.length > 0) {
          console.warn(
            "Falling back to subreddits derived from /r/popular due to Reddit rate limiting."
          );
          return fallbackSubreddits;
        }
      } catch (fallbackError) {
        console.error("Fallback popular subreddit request failed:", fallbackError);
      }
    }

    console.error("Failed to fetch popular subreddits:", error);
    throw error;
  }
};

export const fetchComments = async (subreddit, postId) => {
  try {
    const normalizedSubreddit = normalizeSubreddit(subreddit);
    const normalizedPostId = normalizePostId(postId);
    const json = await fetchJsonWithRetry(
      `/r/${normalizedSubreddit}/comments/${normalizedPostId}.json`,
      `comments for post ${postId}`,
      { cacheTtl: 2 * 60 * 1000 }
    );

    const children = json?.[1]?.data?.children;
    if (!Array.isArray(children)) {
      throw new Error(`Unexpected Reddit response while loading comments for ${postId}`);
    }

    return children.map((child) => child?.data).filter(Boolean);
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    throw error;
  }
};

export const fetchSubredditDetails = async (subreddit) => {
  try {
    const normalizedSubreddit = normalizeSubreddit(subreddit);
    const json = await fetchJsonWithRetry(
      `/r/${normalizedSubreddit}/about.json`,
      `details for r/${subreddit}`,
      { cacheTtl: 10 * 60 * 1000 }
    );

    if (!json?.data || typeof json.data !== "object") {
      throw new Error(`Unexpected Reddit response while loading details for ${subreddit}`);
    }

    return json.data;
  } catch (error) {
    console.error(`Failed to fetch details for subreddit ${subreddit}:`, error);
    throw error;
  }
};
