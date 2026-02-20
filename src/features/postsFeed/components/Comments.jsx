import { useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { loadComments } from "../postsFeedThunks";
import {
  hasCommentsError,
  isLoadingComments,
  selectComments,
} from "../postsFeedSelectors";
import { getRelativeTime } from "../../../utils/date/getRelativeTime";

const Comments = ({ subredditName, postId }) => {
  const dispatch = useDispatch();
  const comments = useSelector(selectComments);
  const isLoading = useSelector(isLoadingComments);
  const hasError = useSelector(hasCommentsError);

  useEffect(() => {
    dispatch(loadComments({ subredditName, postId }));
  }, [dispatch, subredditName, postId]);

  return (
    <section>
      {isLoading ? (
        <div>
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="p-2 border-b-2 border-zinc-700 animate-pulse"
            >
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : hasError ? (
        <div className="p-4">
          <p className="text-sm text-zinc-400 mb-2">Failed to load comments.</p>
          <button
            type="button"
            onClick={() => dispatch(loadComments({ subredditName, postId }))}
            className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-100 hover:bg-zinc-700"
          >
            Retry
          </button>
        </div>
      ) : comments.length > 0 ? (
        comments.map((comment) => (
          <article key={comment.id} className="p-6 border-b-2 border-zinc-700">
            <header className="flex items-center space-x-2 mb-1">
              <span className="text-xs text-zinc-400">u/{comment.author}</span>
              <time className="text-xs text-zinc-400">
                {getRelativeTime(comment.created_utc)}
              </time>
            </header>
            <p className="text-sm text-zinc-200 break-words">{comment.body}</p>
          </article>
        ))
      ) : (
        <p className="text-gray-500">No comments available</p>
      )}
    </section>
  );
};

Comments.propTypes = {
  subredditName: PropTypes.string.isRequired,
  postId: PropTypes.string.isRequired,
};

export default Comments;
