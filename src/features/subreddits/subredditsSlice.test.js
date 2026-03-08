import reducer, { setCurrentSubreddit } from "./subredditsSlice.js"
import {
  loadCurrentSubredditDetails,
  loadSubreddits,
} from "./subredditsThunks.js"
import {
  isLoadingSubreddits,
  hasSubredditsError,
  selectSubredditsErrorMessage,
  selectAllSubreddits,
  selectCurrentSubreddit,
  selectSubredditDetails,
  isLoadingSubredditDetails,
} from "./subredditsSelectors.js"

describe("subredditsSlice", () => {
  it("returns the initial state", () => {
    const state = reducer(undefined, { type: "unknown" })

    expect(state).toEqual({
      currentSubreddit: {},
      subreddits: [],
      isLoadingSubreddits: false,
      subredditsRequestId: null,
      hasError: false,
      errorMessage: null,
      subredditDetails: {},
      isLoadingSubredditDetails: false,
      subredditDetailsRequestId: null,
    })
  })

  describe("loadSubreddits lifecycle", () => {
    it("updates subreddit list state and ignores stale responses", () => {
      const pendingState = reducer(undefined, loadSubreddits.pending("req1"))
      expect(pendingState.isLoadingSubreddits).toBe(true)
      expect(pendingState.subredditsRequestId).toBe("req1")

      const payload = [{ id: "s1", display_name: "reactjs" }]
      const fulfilledState = reducer(
        pendingState,
        loadSubreddits.fulfilled(payload, "req1"),
      )
      expect(fulfilledState.isLoadingSubreddits).toBe(false)
      expect(fulfilledState.subreddits).toEqual(payload)
      expect(fulfilledState.currentSubreddit).toEqual(payload[0])

      // Stale check
      const staleState = reducer(
        pendingState,
        loadSubreddits.fulfilled([{ id: "stale" }], "req2"),
      )
      expect(staleState.subreddits).toEqual([])
      expect(staleState.isLoadingSubreddits).toBe(true)
    })

    it("handles rejections correctly based on request ID", () => {
      const pendingState = reducer(undefined, loadSubreddits.pending("req1"))

      const activeRejectedState = reducer(
        pendingState,
        loadSubreddits.rejected(
          new Error(),
          "req1",
          undefined,
          "Request failed",
        ),
      )
      expect(activeRejectedState.isLoadingSubreddits).toBe(false)
      expect(activeRejectedState.hasError).toBe(true)
      expect(activeRejectedState.errorMessage).toBe("Request failed")
    })

    it("ignores stale rejected responses", () => {
      const pendingState = reducer(undefined, loadSubreddits.pending("req1"))

      const staleRejected = reducer(
        pendingState,
        loadSubreddits.rejected(new Error(), "req2", undefined, "Stale error"),
      )
      expect(staleRejected.isLoadingSubreddits).toBe(true)
      expect(staleRejected.hasError).toBe(false)
    })

    it("defaults currentSubreddit to {} when payload is empty", () => {
      const pendingState = reducer(undefined, loadSubreddits.pending("req1"))
      const fulfilled = reducer(
        pendingState,
        loadSubreddits.fulfilled([], "req1"),
      )
      expect(fulfilled.currentSubreddit).toEqual({})
      expect(fulfilled.subreddits).toEqual([])
    })
  })

  describe("loadCurrentSubredditDetails lifecycle", () => {
    it("updates details state and ignores stale responses", () => {
      const pendingState = reducer(
        undefined,
        loadCurrentSubredditDetails.pending("req1", "reactjs"),
      )
      expect(pendingState.isLoadingSubredditDetails).toBe(true)

      const payload = { display_name: "reactjs", subscribers: 1000 }
      const fulfilledState = reducer(
        pendingState,
        loadCurrentSubredditDetails.fulfilled(payload, "req1", "reactjs"),
      )
      expect(fulfilledState.subredditDetails).toEqual(payload)
      expect(fulfilledState.isLoadingSubredditDetails).toBe(false)
    })

    it("sets error message to 'Rejected' on active failure", () => {
      const pendingState = reducer(
        undefined,
        loadCurrentSubredditDetails.pending("req1", "reactjs"),
      )
      const rejectedState = reducer(
        pendingState,
        loadCurrentSubredditDetails.rejected(null, "req1", "reactjs"),
      )
      expect(rejectedState.hasError).toBe(true)
      expect(rejectedState.errorMessage).toBe("Rejected")
    })

    it("ignores stale fulfilled details responses", () => {
      const pendingState = reducer(
        undefined,
        loadCurrentSubredditDetails.pending("req1", "reactjs"),
      )
      const staleState = reducer(
        pendingState,
        loadCurrentSubredditDetails.fulfilled(
          { display_name: "stale" },
          "req2",
          "reactjs",
        ),
      )
      expect(staleState.isLoadingSubredditDetails).toBe(true)
      expect(staleState.subredditDetails).toEqual({})
    })

    it("ignores stale rejected details responses", () => {
      const pendingState = reducer(
        undefined,
        loadCurrentSubredditDetails.pending("req1", "reactjs"),
      )
      const staleState = reducer(
        pendingState,
        loadCurrentSubredditDetails.rejected(null, "req2", "reactjs"),
      )
      expect(staleState.isLoadingSubredditDetails).toBe(true)
      expect(staleState.hasError).toBe(false)
    })
  })

  describe("selectors", () => {
    it("read popularSubreddits state correctly", () => {
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
      }

      expect(selectAllSubreddits(state)).toEqual([
        { id: "s1", display_name: "reactjs" },
      ])
      expect(isLoadingSubreddits(state)).toBe(true)
      expect(selectCurrentSubreddit(state)).toEqual({
        id: "s2",
        display_name: "javascript",
      })
      expect(selectSubredditDetails(state).subscribers).toBe(42)
      expect(hasSubredditsError(state)).toBe(false)
      expect(selectSubredditsErrorMessage(state)).toBe(null)
      expect(isLoadingSubredditDetails(state)).toBe(false)
    })

    it("reads error state correctly", () => {
      const state = {
        popularSubreddits: {
          currentSubreddit: {},
          subreddits: [],
          isLoadingSubreddits: false,
          subredditsRequestId: null,
          hasError: true,
          errorMessage: "Something went wrong",
          subredditDetails: {},
          isLoadingSubredditDetails: true,
          subredditDetailsRequestId: "req1",
        },
      }

      expect(hasSubredditsError(state)).toBe(true)
      expect(selectSubredditsErrorMessage(state)).toBe("Something went wrong")
      expect(isLoadingSubredditDetails(state)).toBe(true)
    })
  })

  describe("setCurrentSubreddit action", () => {
    it("updates currentSubreddit", () => {
      const initial = reducer(undefined, { type: "unknown" })
      const newSub = { id: "s5", display_name: "vue" }
      const state = reducer(initial, setCurrentSubreddit(newSub))
      expect(state.currentSubreddit).toEqual(newSub)
    })
  })
})
