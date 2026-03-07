import test from "node:test";
import assert from "node:assert/strict";
import reducer, { setFilteredPosts } from "./postsFeedSlice.js";
import { loadAllPosts, loadComments } from "./postsFeedThunks.js";
import {
  hasCommentsErrorByPostId,
  hasPostsFeedError,
  isLoadingCommentsByPostId,
  isLoadingPostsFeed,
  selectAllPosts,
  selectCommentsByPostId,
  selectCommentsErrorMessageByPostId,
} from "./postsFeedSelectors.js";

test("returns the initial state", () => {
  const state = reducer(undefined, { type: "unknown" });

  assert.deepStrictEqual(state, {
    posts: {
      items: [],
      filteredItems: [],
      isLoading: false,
      hasError: false,
      currentRequestId: null,
      searchQuery: "",
    },
    commentsByPostId: {},
  });
});

test("setFilteredPosts filters by title case-insensitively and trims query", () => {
  const initialState = {
    posts: {
      items: [
        { id: "1", title: "React Hooks Guide" },
        { id: "2", title: "Rust ownership tips" },
      ],
      filteredItems: [],
      isLoading: false,
      hasError: false,
      currentRequestId: null,
      searchQuery: "",
    },
    commentsByPostId: {},
  };

  const state = reducer(initialState, setFilteredPosts("  REACT  "));
  assert.equal(state.posts.filteredItems.length, 1);
  assert.equal(state.posts.filteredItems[0].id, "1");
  assert.equal(state.posts.searchQuery, "react");
});

test("loadAllPosts lifecycle updates posts state and ignores stale responses", () => {
  const pendingState = reducer(undefined, loadAllPosts.pending("req1", "reactjs"));
  assert.equal(pendingState.posts.isLoading, true);
  assert.equal(pendingState.posts.hasError, false);
  assert.equal(pendingState.posts.currentRequestId, "req1");

  const payload = [{ id: "p1", title: "Post 1" }];
  const fulfilledState = reducer(
    pendingState,
    loadAllPosts.fulfilled(payload, "req1", "reactjs")
  );
  assert.equal(fulfilledState.posts.isLoading, false);
  assert.equal(fulfilledState.posts.currentRequestId, null);
  assert.deepStrictEqual(fulfilledState.posts.items, payload);
  assert.deepStrictEqual(fulfilledState.posts.filteredItems, payload);
  assert.deepStrictEqual(fulfilledState.commentsByPostId, {});

  const staleFulfilledState = reducer(
    pendingState,
    loadAllPosts.fulfilled([{ id: "stale", title: "Stale" }], "req2", "reactjs")
  );
  assert.deepStrictEqual(staleFulfilledState.posts.items, []);
  assert.equal(staleFulfilledState.posts.isLoading, true);

  const rejectedState = reducer(
    pendingState,
    loadAllPosts.rejected(null, "req1", "reactjs")
  );
  assert.equal(rejectedState.posts.isLoading, false);
  assert.equal(rejectedState.posts.hasError, true);
  assert.equal(rejectedState.posts.currentRequestId, null);
});

test("loadComments lifecycle updates comments per post id", () => {
  const arg = { subredditName: "reactjs", postId: "abc" };
  const pendingState = reducer(undefined, loadComments.pending("req1", arg));
  assert.equal(pendingState.commentsByPostId.abc.isLoading, true);
  assert.equal(pendingState.commentsByPostId.abc.hasError, false);
  assert.equal(pendingState.commentsByPostId.abc.errorMessage, null);

  const payload = [{ id: "c1", body: "Nice post" }];
  const fulfilledState = reducer(pendingState, loadComments.fulfilled(payload, "req1", arg));
  assert.equal(fulfilledState.commentsByPostId.abc.isLoading, false);
  assert.deepStrictEqual(fulfilledState.commentsByPostId.abc.items, payload);
  assert.equal(fulfilledState.commentsByPostId.abc.hasError, false);

  const otherArg = { subredditName: "reactjs", postId: "xyz" };
  const rejectedState = reducer(
    fulfilledState,
    loadComments.rejected(null, "req2", otherArg, "Request failed")
  );
  assert.equal(rejectedState.commentsByPostId.xyz.isLoading, false);
  assert.equal(rejectedState.commentsByPostId.xyz.hasError, true);
  assert.equal(rejectedState.commentsByPostId.xyz.errorMessage, "Request failed");
  assert.deepStrictEqual(rejectedState.commentsByPostId.abc.items, payload);
});

test("selectors read normalized postsFeed state", () => {
  const state = {
    postsFeed: {
      posts: {
        items: [{ id: "p1" }],
        filteredItems: [{ id: "p2" }],
        isLoading: true,
        hasError: false,
        currentRequestId: "req1",
        searchQuery: "react",
      },
      commentsByPostId: {
        p1: {
          items: [{ id: "c1" }],
          isLoading: false,
          hasError: false,
          errorMessage: null,
        },
      },
    },
  };

  assert.deepStrictEqual(selectAllPosts(state), [{ id: "p2" }]);
  assert.equal(isLoadingPostsFeed(state), true);
  assert.equal(hasPostsFeedError(state), false);
  assert.deepStrictEqual(selectCommentsByPostId(state, "p1"), [{ id: "c1" }]);
  assert.equal(isLoadingCommentsByPostId(state, "p1"), false);
  assert.equal(hasCommentsErrorByPostId(state, "p1"), false);
  assert.equal(selectCommentsErrorMessageByPostId(state, "p1"), null);
  assert.deepStrictEqual(selectCommentsByPostId(state, "missing"), []);
});
