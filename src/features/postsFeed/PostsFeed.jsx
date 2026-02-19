import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Card from "./components/Card";
import { loadAllPosts } from "./postsFeedThunks";
import { isLoadingPostsFeed, selectAllPosts } from "./postsFeedSelectors";
import { selectCurrentSubreddit } from "../subreddits/subredditsSelectors";

const PostsFeed = () => {
  const dispatch = useDispatch();
  const posts = useSelector(selectAllPosts);
  const isLoading = useSelector(isLoadingPostsFeed);
  const currentSubreddit = useSelector(selectCurrentSubreddit);

  useEffect(() => {
    if (Object.keys(currentSubreddit).length > 0) {
      dispatch(loadAllPosts(currentSubreddit.display_name));
    }
  }, [dispatch, currentSubreddit]);

  if (isLoading || Object.keys(currentSubreddit).length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500">No posts matching search term</p>
      </div>
    );
  }

  return (
    <>
      {posts.map((post, index) => (
        <Card key={index} post={post} subreddit={currentSubreddit} />
      ))}
    </>
  );
};

export default PostsFeed;
