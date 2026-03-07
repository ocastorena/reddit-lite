import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadCurrentSubredditDetails } from "../subredditsThunks";
import {
  hasSubredditsError,
  isLoadingSubredditDetails,
  selectCurrentSubreddit,
  selectSubredditDetails,
  selectSubredditsErrorMessage,
} from "../subredditsSelectors";
import { formatNumber } from "../../../utils/formatNumber";
import defaultSubredditUrl from "../../../assets/letter-r.png";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";

const SubredditDetails = () => {
  const subreddit = useSelector(selectCurrentSubreddit);
  const subredditDetails = useSelector(selectSubredditDetails);
  const isLoadingDetails = useSelector(isLoadingSubredditDetails);
  const hasError = useSelector(hasSubredditsError);
  const errorMessage = useSelector(selectSubredditsErrorMessage);
  const dispatch = useDispatch();
  const subredditName = subreddit.display_name;
  const subredditUrl = subreddit.url || "/";
  const displayName =
    subredditDetails.display_name_prefixed || subreddit.display_name_prefixed;

  useEffect(() => {
    if (subredditName && subredditDetails.display_name !== subredditName) {
      dispatch(loadCurrentSubredditDetails(subredditName));
    }
  }, [dispatch, subredditName, subredditDetails.display_name]);

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

  if (isLoadingDetails && !subredditDetails.display_name_prefixed) {
    return <LoadingSpinner size="h-8 w-8" />;
  }

  if (hasError && !subredditDetails.display_name_prefixed) {
    return <p className="text-sm text-zinc-400">{errorMessage || "Failed to load subreddit details."}</p>;
  }

  const bannerUrl = subredditDetails.banner_img || subredditDetails.banner_background_image?.split("?")[0] || null;

  return (
    <div className={`transition-opacity duration-200 ${isLoadingDetails ? "opacity-50" : ""}`}>
      {bannerUrl && (
        <div className="-mx-4 -mt-4 mb-4 rounded-t-lg overflow-hidden">
          <img
            src={bannerUrl}
            alt=""
            className="w-full h-20 object-cover"
            referrerPolicy="no-referrer"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}
      <div className="flex flex-col items-center text-center mb-4">
        <img
          src={
            subredditDetails.icon_img
              ? subredditDetails.icon_img
              : defaultSubredditUrl
          }
          alt={`${displayName || "Subreddit"} icon`}
          className={`w-14 h-14 rounded-full mb-2 bg-zinc-100${bannerUrl ? " -mt-10 ring-4 ring-zinc-900" : ""}`}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = defaultSubredditUrl;
          }}
        />
        <div className="flex items-center gap-2">
          <h2 className="text-base text-zinc-100 font-bold">
            {displayName}
          </h2>
          {subredditDetails.over18 && (
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-red-500/15 text-red-400">
              NSFW
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
        {subredditDetails.public_description || "No description available."}
      </p>

      <div className="flex justify-around py-3 mb-4 rounded-lg bg-zinc-800/50">
        <div className="flex flex-col items-center">
          <p className="text-sm font-bold text-zinc-200">
            {formatNumber(subredditDetails.subscribers || 0)}
          </p>
          <p className="text-xs text-zinc-500">Members</p>
        </div>
        {subredditDetails.active_user_count > 0 && (
          <div className="flex flex-col items-center">
            <p className="text-sm font-bold text-zinc-200">
              {formatNumber(subredditDetails.active_user_count)}
            </p>
            <p className="flex items-center text-xs text-zinc-500">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
              Online
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {subredditDetails.allow_images && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400">Images</span>
        )}
        {subredditDetails.allow_videos && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400">Videos</span>
        )}
        {subredditDetails.submission_type !== "self" && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">Links</span>
        )}
        {subredditDetails.submission_type !== "link" && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">Text</span>
        )}
      </div>

      <div className="space-y-1 mb-4 text-xs text-zinc-500">
        <p><span className="text-zinc-400">Created:</span> {formatDate(subredditDetails.created)}</p>
        <p><span className="text-zinc-400">Type:</span> {subredditDetails.subreddit_type || "Unknown"}</p>
      </div>

      <a
        href={`https://www.reddit.com${subredditUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center text-sm text-violet-400 bg-violet-500/15 hover:bg-violet-500/25 rounded-full py-2 px-4 transition-colors"
      >
        Visit Subreddit
      </a>
    </div>
  );
};

export default SubredditDetails;
