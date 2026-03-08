import reducer, { setFilteredPosts } from "./postsFeedSlice.js"
import { loadAllPosts, loadComments } from "./postsFeedThunks.js"
import {
  isLoadingPostsFeed,
  hasPostsFeedError,
  selectAllPosts,
  selectCommentsByPostId,
  isLoadingCommentsByPostId,
  hasCommentsErrorByPostId,
  selectCommentsErrorMessageByPostId,
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

  it("setFilteredPosts with empty query returns all posts", () => {
    const initialState = {
      posts: {
        items: [
          { id: "1", title: "React Hooks Guide" },
          { id: "2", title: "Rust ownership tips" },
        ],
        filteredItems: [{ id: "1", title: "React Hooks Guide" }],
        isLoading: false,
        hasError: false,
        currentRequestId: null,
        searchQuery: "react",
      },
      commentsByPostId: {},
    }

    const state = reducer(initialState, setFilteredPosts(""))
    expect(state.posts.filteredItems).toHaveLength(2)
    expect(state.posts.searchQuery).toBe("")
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

    it("ignores stale rejected responses", () => {
      const pendingState = reducer(
        undefined,
        loadAllPosts.pending("req1", "reactjs"),
      )

      const staleRejectedState = reducer(
        pendingState,
        loadAllPosts.rejected(null, "req2", "reactjs"),
      )
      expect(staleRejectedState.posts.isLoading).toBe(true)
      expect(staleRejectedState.posts.hasError).toBe(false)
    })

    it("clears commentsByPostId on fulfilled", () => {
      const stateWithComments = {
        posts: {
          items: [],
          filteredItems: [],
          isLoading: true,
          hasError: false,
          currentRequestId: "req1",
          searchQuery: "",
        },
        commentsByPostId: {
          abc: { items: [{ id: "c1" }], isLoading: false, hasError: false, errorMessage: null },
        },
      }

      const fulfilled = reducer(
        stateWithComments,
        loadAllPosts.fulfilled([{ id: "p1", title: "New" }], "req1", "reactjs"),
      )
      expect(fulfilled.commentsByPostId).toEqual({})
    })

    it("applies active search query to new posts on fulfilled", () => {
      const stateWithQuery = {
        posts: {
          items: [],
          filteredItems: [],
          isLoading: true,
          hasError: false,
          currentRequestId: "req1",
          searchQuery: "rust",
        },
        commentsByPostId: {},
      }

      const payload = [
        { id: "1", title: "React tips" },
        { id: "2", title: "Rust guide" },
      ]
      const fulfilled = reducer(
        stateWithQuery,
        loadAllPosts.fulfilled(payload, "req1", "reactjs"),
      )
      expect(fulfilled.posts.filteredItems).toHaveLength(1)
      expect(fulfilled.posts.filteredItems[0].id).toBe("2")
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
      expect(hasPostsFeedError(state)).toBe(false)
      expect(selectCommentsByPostId(state, "p1")).toEqual([{ id: "c1" }])
      expect(selectCommentsByPostId(state, "missing")).toEqual([])
      expect(isLoadingCommentsByPostId(state, "p1")).toBe(false)
      expect(hasCommentsErrorByPostId(state, "p1")).toBe(false)
      expect(selectCommentsErrorMessageByPostId(state, "p1")).toBe(null)
    })

    it("returns defaults for missing comment post ids", () => {
      const state = {
        postsFeed: {
          posts: {
            items: [],
            filteredItems: [],
            isLoading: false,
            hasError: true,
            currentRequestId: null,
            searchQuery: "",
          },
          commentsByPostId: {},
        },
      }

      expect(hasPostsFeedError(state)).toBe(true)
      expect(isLoadingCommentsByPostId(state, "nope")).toBe(false)
      expect(hasCommentsErrorByPostId(state, "nope")).toBe(false)
      expect(selectCommentsErrorMessageByPostId(state, "nope")).toBe(null)
    })
  })
})
