import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchComments, fetchPosts } from "../../utils/api.js";

export const loadAllPosts = createAsyncThunk(
  "postsFeed/loadAllPosts",
  async (subreddit, thunkAPI) => {
    try {
      const posts = await fetchPosts(subreddit);
      return posts;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const loadComments = createAsyncThunk(
  "postsFeed/loadComments",
  async ({ subredditName, postId }, thunkAPI) => {
    try {
      const comments = await fetchComments(subredditName, postId);
      return comments;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
