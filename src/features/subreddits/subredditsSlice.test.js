import test from "node:test";
import assert from "node:assert/strict";
import reducer, { setCurrentSubreddit } from "./subredditsSlice.js";
import {
  loadCurrentSubredditDetails,
  loadSubreddits,
} from "./subredditsThunks.js";
import {
  hasSubredditsError,
  isLoadingSubredditDetails,
  isLoadingSubreddits,
  selectAllSubreddits,
  selectCurrentSubreddit,
  selectSubredditDetails,
} from "./subredditsSelectors.js";

test("returns the initial state", () => {
  const state = reducer(undefined, { type: "unknown" });

  assert.deepStrictEqual(state, {
    currentSubreddit: {},
    subreddits: [],
    isLoadingSubreddits: false,
    subredditsRequestId: null,
    hasError: false,
    errorMessage: null,
    subredditDetails: {},
    isLoadingSubredditDetails: false,
    subredditDetailsRequestId: null,
  });
});

test("setCurrentSubreddit updates selected subreddit and clears stale details", () => {
  const subreddit = { id: "1", display_name: "reactjs" };
  const initialState = {
    currentSubreddit: { id: "0", display_name: "javascript" },
    subreddits: [],
    isLoadingSubreddits: false,
    subredditsRequestId: null,
    hasError: false,
    errorMessage: null,
    subredditDetails: { display_name: "javascript", subscribers: 100 },
    isLoadingSubredditDetails: true,
    subredditDetailsRequestId: "req-in-flight",
  };
  const state = reducer(initialState, setCurrentSubreddit(subreddit));
  assert.deepStrictEqual(state.currentSubreddit, subreddit);
  assert.deepStrictEqual(state.subredditDetails, {});
  assert.equal(state.isLoadingSubredditDetails, false);
  assert.equal(state.subredditDetailsRequestId, null);
});

test("loadSubreddits lifecycle updates subreddit list state and ignores stale responses", () => {
  const pendingState = reducer(undefined, loadSubreddits.pending("req1"));
  assert.equal(pendingState.isLoadingSubreddits, true);
  assert.equal(pendingState.subredditsRequestId, "req1");
  assert.equal(pendingState.hasError, false);
  assert.equal(pendingState.errorMessage, null);

  const payload = [{ id: "s1", display_name: "reactjs" }];
  const fulfilledState = reducer(
    pendingState,
    loadSubreddits.fulfilled(payload, "req1")
  );
  assert.equal(fulfilledState.isLoadingSubreddits, false);
  assert.equal(fulfilledState.subredditsRequestId, null);
  assert.equal(fulfilledState.hasError, false);
  assert.equal(fulfilledState.errorMessage, null);
  assert.deepStrictEqual(fulfilledState.subreddits, payload);
  assert.deepStrictEqual(fulfilledState.currentSubreddit, payload[0]);

  const staleFulfilledState = reducer(
    pendingState,
    loadSubreddits.fulfilled([{ id: "stale", display_name: "stale" }], "req2")
  );
  assert.deepStrictEqual(staleFulfilledState.subreddits, []);
  assert.equal(staleFulfilledState.isLoadingSubreddits, true);

  const rejectedState = reducer(
    pendingState,
    loadSubreddits.rejected(new Error("boom"), "req2", undefined, "Request failed")
  );
  assert.equal(rejectedState.isLoadingSubreddits, true);
  assert.equal(rejectedState.hasError, false);
  assert.equal(rejectedState.errorMessage, null);

  const activeRejectedState = reducer(
    pendingState,
    loadSubreddits.rejected(new Error("boom"), "req1", undefined, "Request failed")
  );
  assert.equal(activeRejectedState.isLoadingSubreddits, false);
  assert.equal(activeRejectedState.subredditsRequestId, null);
  assert.equal(activeRejectedState.hasError, true);
  assert.equal(activeRejectedState.errorMessage, "Request failed");
});

test("loadCurrentSubredditDetails lifecycle updates details state and ignores stale responses", () => {
  const pendingState = reducer(
    undefined,
    loadCurrentSubredditDetails.pending("req1", "reactjs")
  );
  assert.equal(pendingState.isLoadingSubredditDetails, true);
  assert.equal(pendingState.subredditDetailsRequestId, "req1");
  assert.equal(pendingState.hasError, false);
  assert.equal(pendingState.errorMessage, null);

  const payload = { display_name: "reactjs", subscribers: 1000 };
  const fulfilledState = reducer(
    pendingState,
    loadCurrentSubredditDetails.fulfilled(payload, "req1", "reactjs")
  );
  assert.equal(fulfilledState.isLoadingSubredditDetails, false);
  assert.equal(fulfilledState.subredditDetailsRequestId, null);
  assert.equal(fulfilledState.hasError, false);
  assert.equal(fulfilledState.errorMessage, null);
  assert.deepStrictEqual(fulfilledState.subredditDetails, payload);

  const staleFulfilledState = reducer(
    pendingState,
    loadCurrentSubredditDetails.fulfilled(
      { display_name: "stale", subscribers: 1 },
      "req2",
      "stale"
    )
  );
  assert.deepStrictEqual(staleFulfilledState.subredditDetails, {});
  assert.equal(staleFulfilledState.isLoadingSubredditDetails, true);

  const rejectedState = reducer(
    pendingState,
    loadCurrentSubredditDetails.rejected(null, "req2", "reactjs")
  );
  assert.equal(rejectedState.isLoadingSubredditDetails, true);
  assert.equal(rejectedState.hasError, false);
  assert.equal(rejectedState.errorMessage, null);

  const activeRejectedState = reducer(
    pendingState,
    loadCurrentSubredditDetails.rejected(null, "req1", "reactjs")
  );
  assert.equal(activeRejectedState.isLoadingSubredditDetails, false);
  assert.equal(activeRejectedState.subredditDetailsRequestId, null);
  assert.equal(activeRejectedState.hasError, true);
  assert.equal(activeRejectedState.errorMessage, "Rejected");
});

test("selectors read popularSubreddits state", () => {
  const state = {
    popularSubreddits: {
      currentSubreddit: { id: "s2", display_name: "javascript" },
      subreddits: [{ id: "s1", display_name: "reactjs" }],
      isLoadingSubreddits: true,
      subredditsRequestId: "req-list",
      hasError: false,
      errorMessage: null,
      subredditDetails: { display_name: "javascript", subscribers: 42 },
      isLoadingSubredditDetails: false,
      subredditDetailsRequestId: null,
    },
  };

  assert.deepStrictEqual(selectAllSubreddits(state), [
    { id: "s1", display_name: "reactjs" },
  ]);
  assert.equal(isLoadingSubreddits(state), true);
  assert.equal(hasSubredditsError(state), false);
  assert.deepStrictEqual(selectCurrentSubreddit(state), {
    id: "s2",
    display_name: "javascript",
  });
  assert.deepStrictEqual(selectSubredditDetails(state), {
    display_name: "javascript",
    subscribers: 42,
  });
  assert.equal(isLoadingSubredditDetails(state), false);
});
