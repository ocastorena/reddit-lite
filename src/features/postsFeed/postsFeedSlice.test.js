import test from "node:test";
import assert from "node:assert/strict";
import reducer, { setFilteredPosts } from "./postsFeedSlice.js";
import { loadAllPosts, loadComments } from "./postsFeedThunks.js";
import {
  hasCommentsError,
  hasPostsFeedError,
  isLoadingComments,
  isLoadingPostsFeed,
  selectAllPosts,
  selectComments,
} from "./postsFeedSelectors.js";

test("returns the initial state", () => {
  const state = reducer(undefined, { type: "unknown" });

  assert.deepStrictEqual(state, {
    posts: {
      items: [],
      filteredItems: [],
      isLoading: false,
      hasError: false,
    },
    comments: {
      items: [],
      isLoading: false,
      hasError: false,
    },
  });
});

test("setFilteredPosts filters by title", () => {
  const initialState = {
    posts: {
      items: [
        { id: "1", title: "React Hooks Guide" },
        { id: "2", title: "Rust ownership tips" },
      ],
      filteredItems: [],
      isLoading: false,
      hasError: false,
    },
    comments: {
      items: [],
      isLoading: false,
      hasError: false,
    },
  };

  const state = reducer(initialState, setFilteredPosts("react"));
  assert.equal(state.posts.filteredItems.length, 1);
  assert.equal(state.posts.filteredItems[0].id, "1");
});

test("loadAllPosts lifecycle updates posts state", () => {
  const pendingState = reducer(undefined, loadAllPosts.pending("req1", "reactjs"));
  assert.equal(pendingState.posts.isLoading, true);
  assert.equal(pendingState.posts.hasError, false);

  const payload = [{ id: "p1", title: "Post 1" }];
  const fulfilledState = reducer(
    pendingState,
    loadAllPosts.fulfilled(payload, "req1", "reactjs")
  );
  assert.equal(fulfilledState.posts.isLoading, false);
  assert.deepStrictEqual(fulfilledState.posts.items, payload);
  assert.deepStrictEqual(fulfilledState.posts.filteredItems, payload);

  const rejectedState = reducer(fulfilledState, loadAllPosts.rejected(null, "req2", "reactjs"));
  assert.equal(rejectedState.posts.isLoading, false);
  assert.equal(rejectedState.posts.hasError, true);
});

test("loadComments lifecycle updates comments state", () => {
  const arg = { subredditName: "reactjs", postId: "abc" };
  const pendingState = reducer(undefined, loadComments.pending("req1", arg));
  assert.equal(pendingState.comments.isLoading, true);
  assert.equal(pendingState.comments.hasError, false);

  const payload = [{ id: "c1", body: "Nice post" }];
  const fulfilledState = reducer(pendingState, loadComments.fulfilled(payload, "req1", arg));
  assert.equal(fulfilledState.comments.isLoading, false);
  assert.deepStrictEqual(fulfilledState.comments.items, payload);

  const rejectedState = reducer(fulfilledState, loadComments.rejected(null, "req2", arg));
  assert.equal(rejectedState.comments.isLoading, false);
  assert.equal(rejectedState.comments.hasError, true);
});

test("selectors read normalized postsFeed state", () => {
  const state = {
    postsFeed: {
      posts: {
        items: [{ id: "p1" }],
        filteredItems: [{ id: "p2" }],
        isLoading: true,
        hasError: false,
      },
      comments: {
        items: [{ id: "c1" }],
        isLoading: false,
        hasError: false,
      },
    },
  };

  assert.deepStrictEqual(selectAllPosts(state), [{ id: "p2" }]);
  assert.equal(isLoadingPostsFeed(state), true);
  assert.equal(hasPostsFeedError(state), false);
  assert.deepStrictEqual(selectComments(state), [{ id: "c1" }]);
  assert.equal(isLoadingComments(state), false);
  assert.equal(hasCommentsError(state), false);
});
