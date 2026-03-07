import { useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentSubreddit } from "../subredditsSlice";
import { loadSubreddits } from "../subredditsThunks";
import {
  hasSubredditsError,
  isLoadingSubreddits,
  selectAllSubreddits,
  selectCurrentSubreddit,
  selectSubredditsErrorMessage,
} from "../subredditsSelectors";
import defaultSubredditUrl from "../../../assets/letter-r.png";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";

const SubredditsList = ({ onSubredditSelect }) => {
  const dispatch = useDispatch();
  const subreddits = useSelector(selectAllSubreddits);
  const isLoading = useSelector(isLoadingSubreddits);
  const hasError = useSelector(hasSubredditsError);
  const errorMessage = useSelector(selectSubredditsErrorMessage);
  const currentSubreddit = useSelector(selectCurrentSubreddit);

  useEffect(() => {
    if (Object.keys(currentSubreddit).length === 0) {
      dispatch(loadSubreddits());
    }
  }, [dispatch, currentSubreddit]);

  return (
    <>
      <h2 className="text-lg text-zinc-100 font-bold mb-4 p-2">
        Popular Subreddits
      </h2>
      {isLoading ? (
        <LoadingSpinner />
      ) : hasError ? (
        <div className="px-2">
          <p className="text-sm text-zinc-400 mb-2">
            {errorMessage || "Failed to load subreddits."}
          </p>
          <button
            type="button"
            onClick={() => dispatch(loadSubreddits())}
            className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-100 hover:bg-zinc-700"
          >
            Retry
          </button>
        </div>
      ) : hasError ? (
        <div className="px-2">
          <p className="text-sm text-zinc-400 mb-2">Failed to load subreddits.</p>
          <button
            type="button"
            onClick={() => dispatch(loadSubreddits())}
            className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-100 hover:bg-zinc-700"
          >
            Retry
          </button>
        </div>
      ) : (
        <ul className="overflow-y-auto scrollbar-hide w-full space-y-1">
          {subreddits.map((subreddit) => (
            <li key={subreddit.id}>
              <button
                onClick={() => {
                  dispatch(setCurrentSubreddit(subreddit));
                  onSubredditSelect?.();
                }}
                className={`flex flex-wrap items-center text-sm text-left w-full p-2 rounded transition-colors duration-200 ${
                  currentSubreddit.id === subreddit.id
                    ? "bg-violet-500/15 text-violet-400"
                    : "text-zinc-300 hover:bg-zinc-700 active:bg-zinc-800"
                }`}
              >
                <img
                  className="w-6 h-6 rounded-full bg-zinc-100"
                  src={
                    subreddit.icon_img
                      ? subreddit.icon_img
                      : defaultSubredditUrl
                  }
                  alt={`${subreddit.display_name_prefixed} icon`}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = defaultSubredditUrl;
                  }}
                />
                <span className="p-2 break-words">
                  {subreddit.display_name_prefixed}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

SubredditsList.propTypes = {
  onSubredditSelect: PropTypes.func,
};

export default SubredditsList;
