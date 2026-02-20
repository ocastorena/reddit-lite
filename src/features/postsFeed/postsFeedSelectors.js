export const selectAllPosts = (state) => state.postsFeed.posts.filteredItems;
export const isLoadingPostsFeed = (state) => state.postsFeed.posts.isLoading;
export const hasPostsFeedError = (state) => state.postsFeed.posts.hasError;

export const selectComments = (state) => state.postsFeed.comments.items;
export const isLoadingComments = (state) => state.postsFeed.comments.isLoading;
export const hasCommentsError = (state) => state.postsFeed.comments.hasError;
