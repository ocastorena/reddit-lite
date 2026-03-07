import { createSlice } from "@reduxjs/toolkit";
import {
  loadCurrentSubredditDetails,
  loadSubreddits,
} from "./subredditsThunks.js";

const subredditsSlice = createSlice({
  name: "popularSubreddits",
  initialState: {
    currentSubreddit: {},
    subreddits: [],
    isLoadingSubreddits: false,
    subredditsRequestId: null,
    hasError: false,
    errorMessage: null,
    subredditDetails: {},
    isLoadingSubredditDetails: false,
    subredditDetailsRequestId: null,
  },
  reducers: {
    setCurrentSubreddit: (state, action) => {
      state.currentSubreddit = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSubreddits.pending, (state, action) => {
        state.isLoadingSubreddits = true;
        state.subredditsRequestId = action.meta.requestId;
        state.hasError = false;
        state.errorMessage = null;
      })
      .addCase(loadSubreddits.fulfilled, (state, action) => {
        if (state.subredditsRequestId !== action.meta.requestId) {
          return;
        }

        state.isLoadingSubreddits = false;
        state.subredditsRequestId = null;
        state.hasError = false;
        state.errorMessage = null;
        state.subreddits = action.payload;
        state.currentSubreddit = action.payload[0] ?? {};
      })
      .addCase(loadSubreddits.rejected, (state, action) => {
        if (state.subredditsRequestId !== action.meta.requestId) {
          return;
        }

        state.isLoadingSubreddits = false;
        state.subredditsRequestId = null;
        state.hasError = true;
        state.errorMessage =
          action.payload || action.error.message || "Failed to load subreddits.";
      })
      .addCase(loadCurrentSubredditDetails.pending, (state, action) => {
        state.isLoadingSubredditDetails = true;
        state.subredditDetailsRequestId = action.meta.requestId;
        state.hasError = false;
        state.errorMessage = null;
      })
      .addCase(loadCurrentSubredditDetails.fulfilled, (state, action) => {
        if (state.subredditDetailsRequestId !== action.meta.requestId) {
          return;
        }

        state.isLoadingSubredditDetails = false;
        state.subredditDetailsRequestId = null;
        state.hasError = false;
        state.errorMessage = null;
        state.subredditDetails = action.payload;
      })
      .addCase(loadCurrentSubredditDetails.rejected, (state, action) => {
        if (state.subredditDetailsRequestId !== action.meta.requestId) {
          return;
        }

        state.isLoadingSubredditDetails = false;
        state.subredditDetailsRequestId = null;
        state.hasError = true;
        state.errorMessage =
          action.payload ||
          action.error.message ||
          "Failed to load subreddit details.";
      });
  },
});

export const { setCurrentSubreddit } = subredditsSlice.actions;

export default subredditsSlice.reducer;
