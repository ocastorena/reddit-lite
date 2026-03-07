import { useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { loadComments } from "../postsFeedThunks";
import {
  hasCommentsErrorByPostId,
  isLoadingCommentsByPostId,
  selectCommentsByPostId,
  selectCommentsErrorMessageByPostId,
} from "../postsFeedSelectors";
import { formatNumber } from "../../../utils/formatNumber";
import { getRelativeTime } from "../../../utils/date/getRelativeTime";
import UpVoteIcon from "../../../assets/up.svg?react";

const Comments = ({ subredditName, postId }) => {
  const dispatch = useDispatch();
  const comments = useSelector((state) => selectCommentsByPostId(state, postId));
  const isLoading = useSelector((state) =>
    isLoadingCommentsByPostId(state, postId)
  );
  const hasError = useSelector((state) =>
    hasCommentsErrorByPostId(state, postId)
  );
  const errorMessage = useSelector((state) =>
    selectCommentsErrorMessageByPostId(state, postId)
  );

  useEffect(() => {
    dispatch(loadComments({ subredditName, postId }));
  }, [dispatch, subredditName, postId]);

  return (
    <section className="mt-3 border-t border-zinc-800 pt-2 flex flex-col max-h-80">
      <div className="overflow-y-auto overscroll-contain scrollbar-hide flex-1">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="animate-pulse space-y-2 px-3 py-2">
                <div className="h-3 bg-zinc-800 rounded w-1/3"></div>
                <div className="h-3 bg-zinc-800 rounded w-5/6"></div>
                <div className="h-3 bg-zinc-800 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : hasError ? (
          <div className="px-3 py-2">
            <p className="text-sm text-zinc-400 mb-2">
              {errorMessage || "Failed to load comments."}
            </p>
            <button
              type="button"
              onClick={() => dispatch(loadComments({ subredditName, postId }))}
              className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-100 hover:bg-zinc-700"
            >
              Retry
            </button>
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-0.5">
            {comments.map((comment) => (
              <article key={comment.id} className="px-3 py-2.5 rounded-lg hover:bg-zinc-800/50 transition-colors">
                <header className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs font-medium text-zinc-300">u/{comment.author}</span>
                  <span className="text-zinc-600">·</span>
                  <time className="text-xs text-zinc-500">
                    {getRelativeTime(comment.created_utc)}
                  </time>
                </header>
                <p className="text-sm text-zinc-300 break-words leading-relaxed">{comment.body}</p>
                {comment.ups != null && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <UpVoteIcon className="w-3.5 h-3.5 fill-zinc-500" />
                    <span className="text-xs text-zinc-500">{formatNumber(comment.ups)}</span>
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500 px-3 py-2">No comments available</p>
        )}
      </div>
    </section>
  );
};

Comments.propTypes = {
  subredditName: PropTypes.string.isRequired,
  postId: PropTypes.string.isRequired,
};

export default Comments;
