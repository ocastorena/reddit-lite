import { createSlice } from "@reduxjs/toolkit";
import { loadAllPosts, loadComments } from "./postsFeedThunks.js";

const normalizeQuery = (query) => query?.trim().toLowerCase() ?? "";

const filterPosts = (posts, query) => {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return posts;
  }

  return posts.filter((post) =>
    String(post.title ?? "").toLowerCase().includes(normalizedQuery)
  );
};

const createCommentsState = () => ({
  items: [],
  isLoading: false,
  hasError: false,
  errorMessage: null,
});

const postsFeedSlice = createSlice({
  name: "postsFeed",
  initialState: {
    posts: {
      items: [],
      filteredItems: [],
      isLoading: false,
      hasError: false,
      currentRequestId: null,
      searchQuery: "",
    },
    commentsByPostId: {},
  },
  reducers: {
    setFilteredPosts: (state, action) => {
      state.posts.searchQuery = normalizeQuery(action.payload);
      state.posts.filteredItems = filterPosts(
        state.posts.items,
        state.posts.searchQuery
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAllPosts.pending, (state, action) => {
        state.posts.isLoading = true;
        state.posts.hasError = false;
        state.posts.currentRequestId = action.meta.requestId;
      })
      .addCase(loadAllPosts.fulfilled, (state, action) => {
        if (state.posts.currentRequestId !== action.meta.requestId) {
          return;
        }

        state.posts.isLoading = false;
        state.posts.currentRequestId = null;
        state.posts.items = action.payload;
        state.posts.filteredItems = filterPosts(
          action.payload,
          state.posts.searchQuery
        );
        state.commentsByPostId = {};
      })
      .addCase(loadAllPosts.rejected, (state, action) => {
        if (state.posts.currentRequestId !== action.meta.requestId) {
          return;
        }

        state.posts.isLoading = false;
        state.posts.hasError = true;
        state.posts.currentRequestId = null;
      })
      .addCase(loadComments.pending, (state, action) => {
        const postId = action.meta.arg?.postId;
        if (!postId) {
          return;
        }

        if (!state.commentsByPostId[postId]) {
          state.commentsByPostId[postId] = createCommentsState();
        }

        state.commentsByPostId[postId].isLoading = true;
        state.commentsByPostId[postId].hasError = false;
        state.commentsByPostId[postId].errorMessage = null;
      })
      .addCase(loadComments.fulfilled, (state, action) => {
        const postId = action.meta.arg?.postId;
        if (!postId) {
          return;
        }

        if (!state.commentsByPostId[postId]) {
          state.commentsByPostId[postId] = createCommentsState();
        }

        state.commentsByPostId[postId].isLoading = false;
        state.commentsByPostId[postId].hasError = false;
        state.commentsByPostId[postId].errorMessage = null;
        state.commentsByPostId[postId].items = action.payload;
      })
      .addCase(loadComments.rejected, (state, action) => {
        const postId = action.meta.arg?.postId;
        if (!postId) {
          return;
        }

        if (!state.commentsByPostId[postId]) {
          state.commentsByPostId[postId] = createCommentsState();
        }

        state.commentsByPostId[postId].isLoading = false;
        state.commentsByPostId[postId].hasError = true;
        state.commentsByPostId[postId].errorMessage =
          action.payload || action.error.message || "Failed to load comments.";
      });
  },
});

export const { setFilteredPosts } = postsFeedSlice.actions;

export default postsFeedSlice.reducer;
