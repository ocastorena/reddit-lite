export const selectAllPosts = (state) => state.postsFeed.posts.filteredItems;
export const isLoadingPostsFeed = (state) => state.postsFeed.posts.isLoading;
export const hasPostsFeedError = (state) => state.postsFeed.posts.hasError;

const EMPTY_COMMENTS_STATE = Object.freeze({
  items: [],
  isLoading: false,
  hasError: false,
  errorMessage: null,
});

const selectCommentsStateByPostId = (state, postId) =>
  state.postsFeed.commentsByPostId[postId] || EMPTY_COMMENTS_STATE;

export const selectCommentsByPostId = (state, postId) =>
  selectCommentsStateByPostId(state, postId).items;
export const isLoadingCommentsByPostId = (state, postId) =>
  selectCommentsStateByPostId(state, postId).isLoading;
export const hasCommentsErrorByPostId = (state, postId) =>
  selectCommentsStateByPostId(state, postId).hasError;
export const selectCommentsErrorMessageByPostId = (state, postId) =>
  selectCommentsStateByPostId(state, postId).errorMessage;
