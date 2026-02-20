const BASE_URL = "https://www.reddit.com";
const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_MAX_RETRIES = 2;
const BASE_RETRY_DELAY_MS = 400;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isRetryableError = (error) =>
  error?.name === "AbortError" || error instanceof TypeError;

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
  const url = new URL(path, BASE_URL);
  url.searchParams.set("raw_json", "1");
  return url.toString();
};

const fetchJsonWithRetry = async (path, requestDescription) => {
  let latestError = null;

  for (let attempt = 0; attempt <= DEFAULT_MAX_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

    try {
      const response = await fetch(createUrl(path), {
        signal: controller.signal,
      });

      if (!response.ok) {
        const retryableStatus = response.status === 429 || response.status >= 500;
        if (retryableStatus && attempt < DEFAULT_MAX_RETRIES) {
          await sleep(BASE_RETRY_DELAY_MS * (attempt + 1));
          continue;
        }

        throw new Error(
          `Reddit API request failed (${response.status}) while loading ${requestDescription}`
        );
      }

      return await response.json();
    } catch (error) {
      latestError = error;
      if (isRetryableError(error) && attempt < DEFAULT_MAX_RETRIES) {
        await sleep(BASE_RETRY_DELAY_MS * (attempt + 1));
        continue;
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
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

export const fetchPosts = async (subreddit) => {
  try {
    const normalizedSubreddit = normalizeSubreddit(subreddit);
    const json = await fetchJsonWithRetry(
      `/r/${normalizedSubreddit}.json`,
      `posts from r/${subreddit}`
    );
    return mapListingChildren(json, `posts from r/${subreddit}`);
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
    return mapListingChildren(json, "popular subreddits");
  } catch (error) {
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
      `comments for post ${postId}`
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
      `details for r/${subreddit}`
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
