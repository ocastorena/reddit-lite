import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "./components/Card";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { loadAllPosts } from "./postsFeedThunks";
import {
  hasPostsFeedError,
  isLoadingPostsFeed,
  selectAllPosts,
} from "./postsFeedSelectors";
import { selectCurrentSubreddit } from "../subreddits/subredditsSelectors";

const PostsFeed = () => {
  const dispatch = useDispatch();
  const posts = useSelector(selectAllPosts);
  const isLoading = useSelector(isLoadingPostsFeed);
  const hasError = useSelector(hasPostsFeedError);
  const currentSubreddit = useSelector(selectCurrentSubreddit);
  const currentSubredditName = currentSubreddit.display_name;

  useEffect(() => {
    if (currentSubredditName) {
      dispatch(loadAllPosts(currentSubredditName));
    }
  }, [dispatch, currentSubredditName]);

  if (isLoading || !currentSubredditName) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <p className="text-zinc-400">Failed to load posts. Please try again.</p>
        <button
          type="button"
          onClick={() => dispatch(loadAllPosts(currentSubredditName))}
          className="rounded-full bg-zinc-800 px-4 py-2 text-sm text-zinc-100 hover:bg-zinc-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-zinc-500">No posts matching search term</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {posts.map((post) => (
        <Card key={post.id} post={post} subreddit={currentSubreddit} />
      ))}
    </div>
  );
};

export default PostsFeed;
