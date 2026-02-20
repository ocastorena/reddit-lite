import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import Comments from "./Comments";
import CommentIcon from "../../../assets/comments.svg?react";
import UpVoteIcon from "../../../assets/up.svg?react";
import DownVoteIcon from "../../../assets/down.svg?react";
import { formatNumber } from "../../../utils/formatNumber";
import { getRelativeTime } from "../../../utils/date/getRelativeTime";

const decodeRedditUrl = (url) =>
  typeof url === "string" ? url.replace(/&amp;/g, "&") : null;

const isHttpUrl = (value) => {
  if (typeof value !== "string" || value.length === 0) {
    return false;
  }

  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
};

const normalizePreviewImageUrl = (url) => {
  if (!isHttpUrl(url)) {
    return null;
  }

  const parsedUrl = new URL(url);
  if (parsedUrl.hostname !== "preview.redd.it") {
    return null;
  }

  // preview.redd.it frequently fails with CORS/CORP in browsers; i.redd.it is more stable.
  return `https://i.redd.it${parsedUrl.pathname}`;
};

const getImageCandidates = (post) => {
  const previewSourceUrl = decodeRedditUrl(post.preview?.images?.[0]?.source?.url);
  const directImageUrl = decodeRedditUrl(post.url_overridden_by_dest);

  return [
    normalizePreviewImageUrl(previewSourceUrl),
    directImageUrl,
    previewSourceUrl,
  ].filter((url, index, urls) => isHttpUrl(url) && urls.indexOf(url) === index);
};

const Card = ({ post, subreddit }) => {
  const [showComments, setShowComments] = useState(false);
  const [voteCount, setVoteCount] = useState(post.ups + post.downs);
  const [voteStatus, setVoteStatus] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const imageCandidates = useMemo(() => getImageCandidates(post), [post]);
  const imageUrl = imageCandidates[activeImageIndex] || null;
  const decodedThumbnailUrl = decodeRedditUrl(post.thumbnail);
  const thumbnailUrl =
    decodedThumbnailUrl && decodedThumbnailUrl.startsWith("http")
      ? decodedThumbnailUrl
      : null;

  useEffect(() => {
    setActiveImageIndex(0);
  }, [post.id]);

  const postTime = getRelativeTime(post.created_utc);

  const handleToggleComments = () => {
    setShowComments((prevShowComments) => !prevShowComments);
  };

  const handleUpvote = () => {
    if (voteStatus === "upvoted") {
      setVoteCount((prevVoteCount) => prevVoteCount - 1);
      setVoteStatus(null);
    } else {
      setVoteCount(
        (prevVoteCount) => prevVoteCount + (voteStatus === "downvoted" ? 2 : 1)
      );
      setVoteStatus("upvoted");
    }
  };

  const handleDownvote = () => {
    if (voteStatus === "downvoted") {
      setVoteCount((prevVoteCount) => prevVoteCount + 1);
      setVoteStatus(null);
    } else {
      setVoteCount(
        (prevVoteCount) => prevVoteCount - (voteStatus === "upvoted" ? 2 : 1)
      );
      setVoteStatus("downvoted");
    }
  };

  const handleImageError = () => {
    setActiveImageIndex((previousIndex) => previousIndex + 1);
  };

  return (
    <article className="flex flex-col rounded-lg shadow-md text-light bg-zinc-900 w-full mb-4 px-4 py-2">
      <header className="flex items-center space-x-2">
        <h6 className="text-xs">{"u/" + post.author}</h6>
        <span className="text-zinc-500">•</span>
        <p className="text-xs leading-none text-zinc-500">{`Posted ${postTime}`}</p>
      </header>
      {!imageUrl && !thumbnailUrl && (
        <div>
          <h2 className="mt-2 mb-2">
            <a
              href={post.url}
              className="text-zinc-300 text-base font-semibold break-words hover:text-white"
            >
              {post.title}
            </a>
          </h2>
          <p className="mt-2 text-gray-400 text-sm break-words">
            {post.selftext}
          </p>
        </div>
      )}
      {!imageUrl && thumbnailUrl && (
        <section className="flex mt-2 max-w-full items-center">
          <h2 className="my-2 mr-2">
            <a
              href={post.url}
              className="text-zinc-300 text-base font-semibold break-words hover:text-white"
            >
              {post.title}
            </a>
          </h2>
          <img
            src={thumbnailUrl}
            alt="Thumbnail"
            className="w-6 h-6 ml-auto rounded"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.style.display = "none";
            }}
          />
        </section>
      )}
      {imageUrl && (
        <section className="max-w-full overflow-hidden">
          <h2 className="mt-2 mb-2">
            <a
              href={post.url}
              className="text-zinc-300 md:text-lg text-base font-semibold break-words hover:text-white"
            >
              {post.title}
            </a>
          </h2>
          <img
            src={imageUrl}
            alt="Post"
            className="w-full h-auto mt-5 rounded"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={handleImageError}
          />
        </section>
      )}
      <div className="border-t-2 border-zinc-700 mt-5"></div>
      <footer className="flex items-center space-x-4 mt-5 text-gray-500">
        <div className="flex items-center shadow-md no-underline rounded-full bg-very-dark">
          <button
            onClick={handleUpvote}
            className={`flex items-center space-x-2 py-1 px-2 shadow-md no-underline rounded-full bg-very-dark text-light border-blue btn-primary hover:bg-gray-700 focus:outline-none active:shadow-none ${voteStatus === "upvoted" ? "text-green-500" : ""}`}
          >
            <UpVoteIcon
              className={`w-5 h-5 fill-current ${voteStatus === "upvoted" ? "text-green-500" : ""}`}
            />
          </button>
          <span
            className={`text-sm px-1 ${voteStatus === "upvoted" ? "text-green-500" : voteStatus === "downvoted" ? "text-red-500" : "text-zinc-200"}`}
          >
            {formatNumber(voteCount)}
          </span>
          <button
            onClick={handleDownvote}
            className={`flex items-center space-x-2 py-1 px-2 shadow-md no-underline rounded-full bg-very-dark text-light border-blue btn-primary hover:bg-gray-700 focus:outline-none active:shadow-none ${voteStatus === "downvoted" ? "text-red-500" : ""}`}
          >
            <DownVoteIcon
              className={`w-5 h-5 fill-current ${voteStatus === "downvoted" ? "text-red-500" : ""}`}
            />
          </button>
        </div>
        <button
          onClick={handleToggleComments}
          className="flex items-center space-x-2 px-2 shadow-md no-underline rounded-full bg-very-dark text-light border-blue btn-primary hover:bg-gray-700 focus:outline-none active:shadow-none"
        >
          <CommentIcon className="w-7 h-7 fill-light" />
          <span className="text-sm px-1">
            {formatNumber(post.num_comments)}
          </span>
        </button>
      </footer>
      {showComments && (
        <Comments subredditName={subreddit.display_name} postId={post.id} />
      )}
    </article>
  );
};

Card.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    created_utc: PropTypes.number.isRequired,
    num_comments: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    selftext: PropTypes.string,
    url: PropTypes.string.isRequired,
    ups: PropTypes.number.isRequired,
    downs: PropTypes.number.isRequired,
    thumbnail: PropTypes.string,
    url_overridden_by_dest: PropTypes.string,
    preview: PropTypes.shape({
      images: PropTypes.arrayOf(
        PropTypes.shape({
          source: PropTypes.shape({
            url: PropTypes.string,
          }),
        })
      ),
    }),
  }).isRequired,
  subreddit: PropTypes.shape({
    display_name: PropTypes.string.isRequired,
  }).isRequired,
};

export default Card;
