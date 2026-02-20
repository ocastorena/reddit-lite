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
    hasError: false,
    subredditDetails: {},
    isLoadingSubredditDetails: false,
  });
});

test("setCurrentSubreddit updates selected subreddit", () => {
  const subreddit = { id: "1", display_name: "reactjs" };
  const state = reducer(undefined, setCurrentSubreddit(subreddit));
  assert.deepStrictEqual(state.currentSubreddit, subreddit);
});

test("loadSubreddits lifecycle updates subreddit list state", () => {
  const pendingState = reducer(undefined, loadSubreddits.pending("req1"));
  assert.equal(pendingState.isLoadingSubreddits, true);
  assert.equal(pendingState.hasError, false);

  const payload = [{ id: "s1", display_name: "reactjs" }];
  const fulfilledState = reducer(
    pendingState,
    loadSubreddits.fulfilled(payload, "req1")
  );
  assert.equal(fulfilledState.isLoadingSubreddits, false);
  assert.equal(fulfilledState.hasError, false);
  assert.deepStrictEqual(fulfilledState.subreddits, payload);
  assert.deepStrictEqual(fulfilledState.currentSubreddit, payload[0]);

  const rejectedState = reducer(fulfilledState, loadSubreddits.rejected(null, "req2"));
  assert.equal(rejectedState.isLoadingSubreddits, false);
  assert.equal(rejectedState.hasError, true);
});

test("loadCurrentSubredditDetails lifecycle updates details state", () => {
  const pendingState = reducer(
    undefined,
    loadCurrentSubredditDetails.pending("req1", "reactjs")
  );
  assert.equal(pendingState.isLoadingSubredditDetails, true);
  assert.equal(pendingState.hasError, false);

  const payload = { display_name: "reactjs", subscribers: 1000 };
  const fulfilledState = reducer(
    pendingState,
    loadCurrentSubredditDetails.fulfilled(payload, "req1", "reactjs")
  );
  assert.equal(fulfilledState.isLoadingSubredditDetails, false);
  assert.equal(fulfilledState.hasError, false);
  assert.deepStrictEqual(fulfilledState.subredditDetails, payload);

  const rejectedState = reducer(
    fulfilledState,
    loadCurrentSubredditDetails.rejected(null, "req2", "reactjs")
  );
  assert.equal(rejectedState.isLoadingSubredditDetails, false);
  assert.equal(rejectedState.hasError, true);
});

test("selectors read popularSubreddits state", () => {
  const state = {
    popularSubreddits: {
      currentSubreddit: { id: "s2", display_name: "javascript" },
      subreddits: [{ id: "s1", display_name: "reactjs" }],
      isLoadingSubreddits: true,
      hasError: false,
      subredditDetails: { display_name: "javascript", subscribers: 42 },
      isLoadingSubredditDetails: false,
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
