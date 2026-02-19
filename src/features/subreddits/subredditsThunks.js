import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchPopularSubreddits,
  fetchSubredditDetails,
} from "../../utils/api.js";

export const loadSubreddits = createAsyncThunk(
  "popularSubreddits/loadSubreddits",
  async (thunkAPI) => {
    try {
      const subreddits = await fetchPopularSubreddits();
      return subreddits;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const loadCurrentSubredditDetails = createAsyncThunk(
  "popularSubreddits/loadCurrentSubredditDetails",
  async (subredditName, thunkAPI) => {
    try {
      const subredditDetails = await fetchSubredditDetails(subredditName);
      return subredditDetails;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
