import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadCurrentSubredditDetails } from "../subredditsThunks";
import {
  hasSubredditsError,
  isLoadingSubredditDetails,
  selectCurrentSubreddit,
  selectSubredditDetails,
} from "../subredditsSelectors";
import { formatNumber } from "../../../utils/formatNumber";
import defaultSubredditUrl from "../../../assets/letter-r.png";

const SubredditDetails = () => {
  const subreddit = useSelector(selectCurrentSubreddit);
  const subredditDetails = useSelector(selectSubredditDetails);
  const isLoadingDetails = useSelector(isLoadingSubredditDetails);
  const hasError = useSelector(hasSubredditsError);
  const dispatch = useDispatch();
  const subredditName = subreddit.display_name;
  const subredditUrl = subreddit.url || "/";
  const displayName =
    subredditDetails.display_name_prefixed || subreddit.display_name_prefixed;

  useEffect(() => {
    if (subredditName) {
      dispatch(loadCurrentSubredditDetails(subredditName));
    }
  }, [dispatch, subredditName]);

  const formatDate = (timestamp) => {
    if (!timestamp) {
      return "Unknown";
    }

    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!subredditName) {
    return <p className="text-sm text-zinc-400">Select a subreddit to view details.</p>;
  }

  if (isLoadingDetails) {
    return <p className="text-sm text-zinc-400">Loading subreddit details...</p>;
  }

  if (hasError && !subredditDetails.display_name_prefixed) {
    return <p className="text-sm text-zinc-400">Failed to load subreddit details.</p>;
  }

  return (
    <>
      <div className="border-b-zinc-700 border-b-2 mb-4">
        <div className="flex flex-wrap overflow-hidden items-baseline">
          <img
            src={
              subredditDetails.icon_img
                ? subredditDetails.icon_img
                : defaultSubredditUrl
            }
            alt={`${displayName || "Subreddit"} icon`}
            className="w-16 h-16 rounded-full mr-2 bg-zinc-100"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = defaultSubredditUrl;
            }}
          />
          <h2 className="text-lg text-zinc-100 font-bold">
            {displayName}
          </h2>
        </div>
        <h3 className="mb-4 text-gray-400">
          {subredditDetails.public_description || "No description available."}
        </h3>
        <p className="text-sm text-gray-400 mb-2">
          <strong>Created:</strong> {formatDate(subredditDetails.created)}
        </p>
        <p className="text-sm text-gray-400 mb-2">
          <strong>Type:</strong> {subredditDetails.subreddit_type || "Unknown"}
        </p>
        <div className="flex justify-around">
          <div className="flex flex-col items-center mb-4">
            <p className="text-sm font-bold text-gray-400">
              {formatNumber(subredditDetails.subscribers || 0)}
            </p>
            <p className="text-sm text-gray-400">Members</p>
          </div>
          <div className="flex flex-col items-center mb-4">
            <p className="text-sm font-bold text-gray-400">
              {formatNumber(subredditDetails.active_user_count || 0)}
            </p>
            <p className="flex items-center text-sm text-gray-400">
              <span className="w-2 h-2 bg-green-500 rounded-full mx-1"></span>
              Online
            </p>
          </div>
        </div>
      </div>
      <a
        href={`https://www.reddit.com${subredditUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-zinc-300 hover:underline text-sm"
      >
        Visit Subreddit
      </a>
    </>
  );
};

export default SubredditDetails;
