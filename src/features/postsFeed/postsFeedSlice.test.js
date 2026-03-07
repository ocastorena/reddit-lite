import reducer, { setFilteredPosts } from "./postsFeedSlice.js"
import { loadAllPosts, loadComments } from "./postsFeedThunks.js"
import {
  isLoadingPostsFeed,
  selectAllPosts,
  selectCommentsByPostId,
} from "./postsFeedSelectors.js"

describe("postsFeedSlice", () => {
  it("returns the initial state", () => {
    const state = reducer(undefined, { type: "unknown" })

    expect(state).toEqual({
      posts: {
        items: [],
        filteredItems: [],
        isLoading: false,
        hasError: false,
        currentRequestId: null,
        searchQuery: "",
      },
      commentsByPostId: {},
    })
  })

  it("setFilteredPosts filters by title case-insensitively and trims query", () => {
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
    }

    const state = reducer(initialState, setFilteredPosts("  REACT  "))
    expect(state.posts.filteredItems).toHaveLength(1)
    expect(state.posts.filteredItems[0].id).toBe("1")
    expect(state.posts.searchQuery).toBe("react")
  })

  describe("loadAllPosts thunk lifecycle", () => {
    it("updates posts state and ignores stale responses", () => {
      const pendingState = reducer(
        undefined,
        loadAllPosts.pending("req1", "reactjs"),
      )
      expect(pendingState.posts.isLoading).toBe(true)
      expect(pendingState.posts.hasError).toBe(false)
      expect(pendingState.posts.currentRequestId).toBe("req1")

      const payload = [{ id: "p1", title: "Post 1" }]
      const fulfilledState = reducer(
        pendingState,
        loadAllPosts.fulfilled(payload, "req1", "reactjs"),
      )
      expect(fulfilledState.posts.isLoading).toBe(false)
      expect(fulfilledState.posts.currentRequestId).toBe(null)
      expect(fulfilledState.posts.items).toEqual(payload)
      expect(fulfilledState.posts.filteredItems).toEqual(payload)

      // Testing stale response logic
      const staleFulfilledState = reducer(
        pendingState,
        loadAllPosts.fulfilled(
          [{ id: "stale", title: "Stale" }],
          "req2",
          "reactjs",
        ),
      )
      expect(staleFulfilledState.posts.items).toEqual([])
      expect(staleFulfilledState.posts.isLoading).toBe(true)

      const rejectedState = reducer(
        pendingState,
        loadAllPosts.rejected(null, "req1", "reactjs"),
      )
      expect(rejectedState.posts.isLoading).toBe(false)
      expect(rejectedState.posts.hasError).toBe(true)
    })
  })

  describe("loadComments thunk lifecycle", () => {
    it("updates comments per post id", () => {
      const arg = { subredditName: "reactjs", postId: "abc" }
      const pendingState = reducer(undefined, loadComments.pending("req1", arg))
      expect(pendingState.commentsByPostId.abc.isLoading).toBe(true)

      const payload = [{ id: "c1", body: "Nice post" }]
      const fulfilledState = reducer(
        pendingState,
        loadComments.fulfilled(payload, "req1", arg),
      )
      expect(fulfilledState.commentsByPostId.abc.isLoading).toBe(false)
      expect(fulfilledState.commentsByPostId.abc.items).toEqual(payload)

      const otherArg = { subredditName: "reactjs", postId: "xyz" }
      const rejectedState = reducer(
        fulfilledState,
        loadComments.rejected(null, "req2", otherArg, "Request failed"),
      )
      expect(rejectedState.commentsByPostId.xyz.hasError).toBe(true)
      expect(rejectedState.commentsByPostId.xyz.errorMessage).toBe(
        "Request failed",
      )
    })
  })

  describe("selectors", () => {
    it("read normalized postsFeed state correctly", () => {
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
      }

      expect(selectAllPosts(state)).toEqual([{ id: "p2" }])
      expect(isLoadingPostsFeed(state)).toBe(true)
      expect(selectCommentsByPostId(state, "p1")).toEqual([{ id: "c1" }])
      expect(selectCommentsByPostId(state, "missing")).toEqual([])
    })
  })
})
