import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loadCurrentSubredditDetails,
  selectCurrentSubreddit,
  selectSubredditDetails,
} from "../../features/subreddits/subredditsSlice";
import { formatNumber } from "../../utils/formatNumber";
import defaultSubredditUrl from "../../assets/letter-r.png";

const Sidebar = () => {
  const subreddit = useSelector(selectCurrentSubreddit);
  const subredditDetails = useSelector(selectSubredditDetails);
  const dispatch = useDispatch();

  useEffect(() => {
    if (Object.keys(subreddit).length > 0) {
      dispatch(loadCurrentSubredditDetails(subreddit.display_name));
    }
  }, [dispatch, subreddit]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
            alt={`${subreddit.display_name_prefixed} icon`}
            className="w-16 h-16 rounded-full mr-2 bg-zinc-100"
          />
          <h2 className="text-lg text-zinc-100 font-bold">
            {subredditDetails.display_name_prefixed}
          </h2>
        </div>
        <h3 className="mb-4 text-gray-400">
          {subredditDetails.public_description}
        </h3>
        <p className="text-sm text-gray-400 mb-2">
          <strong>Created:</strong> {formatDate(subredditDetails.created)}
        </p>
        <p className="text-sm text-gray-400 mb-2">
          <strong>Type:</strong> {subredditDetails.subreddit_type}
        </p>
        <div className="flex justify-around">
          <div className="flex flex-col items-center mb-4">
            <p className="text-sm font-bold text-gray-400">
              {formatNumber(subredditDetails.subscribers)}
            </p>
            <p className="text-sm text-gray-400">Members</p>
          </div>
          <div className="flex flex-col items-center mb-4">
            <p className="text-sm font-bold text-gray-400">
              {formatNumber(subredditDetails.active_user_count)}
            </p>
            <p className="flex items-center text-sm text-gray-400">
              <span className="w-2 h-2 bg-green-500 rounded-full mx-1"></span>
              Online
            </p>
          </div>
        </div>
      </div>
      <a
        href={`https://www.reddit.com${subreddit.url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-zinc-300 hover:underline text-sm"
      >
        Visit Subreddit
      </a>
    </>
  );
};

export default Sidebar;
