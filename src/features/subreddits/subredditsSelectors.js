export const selectAllSubreddits = (state) =>
  state.popularSubreddits.subreddits;

export const isLoadingSubreddits = (state) =>
  state.popularSubreddits.isLoadingSubreddits;

export const selectCurrentSubreddit = (state) =>
  state.popularSubreddits.currentSubreddit;

export const selectSubredditDetails = (state) =>
  state.popularSubreddits.subredditDetails;
