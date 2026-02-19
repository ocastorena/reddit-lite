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
    hasError: false,
    subredditDetails: {},
    isLoadingSubredditDetails: false,
  },
  reducers: {
    setCurrentSubreddit: (state, action) => {
      state.currentSubreddit = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSubreddits.pending, (state) => {
        state.isLoadingSubreddits = true;
        state.hasError = false;
      })
      .addCase(loadSubreddits.fulfilled, (state, action) => {
        state.isLoadingSubreddits = false;
        state.hasError = false;
        state.subreddits = action.payload;
        state.currentSubreddit = action.payload[0];
      })
      .addCase(loadSubreddits.rejected, (state) => {
        state.isLoadingSubreddits = false;
        state.hasError = true;
      })
      .addCase(loadCurrentSubredditDetails.pending, (state) => {
        state.isLoadingSubredditDetails = true;
        state.hasError = false;
      })
      .addCase(loadCurrentSubredditDetails.fulfilled, (state, action) => {
        state.isLoadingSubredditDetails = false;
        state.hasError = false;
        state.subredditDetails = action.payload;
      })
      .addCase(loadCurrentSubredditDetails.rejected, (state) => {
        state.isLoadingSubredditDetails = false;
        state.hasError = true;
      });
  },
});

export const { setCurrentSubreddit } = subredditsSlice.actions;

export default subredditsSlice.reducer;
