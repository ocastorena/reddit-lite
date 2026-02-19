import { createSlice } from "@reduxjs/toolkit";
import { loadAllPosts, loadComments } from "./postsFeedThunks.js";

const postsFeedSlice = createSlice({
  name: "postsFeed",
  initialState: {
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
  },
  reducers: {
    setFilteredPosts: (state, action) => {
      state.posts.filteredItems = state.posts.items.filter((post) =>
        post.title.toLowerCase().includes(action.payload)
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAllPosts.pending, (state) => {
        state.posts.isLoading = true;
        state.posts.hasError = false;
      })
      .addCase(loadAllPosts.fulfilled, (state, action) => {
        state.posts.isLoading = false;
        state.posts.items = action.payload;
        state.posts.filteredItems = action.payload;
      })
      .addCase(loadAllPosts.rejected, (state) => {
        state.posts.isLoading = false;
        state.posts.hasError = true;
      })
      .addCase(loadComments.pending, (state) => {
        state.comments.isLoading = true;
        state.comments.hasError = false;
      })
      .addCase(loadComments.fulfilled, (state, action) => {
        state.comments.isLoading = false;
        state.comments.items = action.payload;
      })
      .addCase(loadComments.rejected, (state) => {
        state.comments.isLoading = false;
        state.comments.hasError = true;
      });
  },
});

export const { setFilteredPosts } = postsFeedSlice.actions;

export default postsFeedSlice.reducer;
