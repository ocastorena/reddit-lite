import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import Comments from "./Comments";
import CommentIcon from "../../../assets/comments.svg?react";
import UpVoteIcon from "../../../assets/up.svg?react";
import DownVoteIcon from "../../../assets/down.svg?react";
import { formatNumber } from "../../../utils/formatNumber";
import { getRelativeTime } from "../../../utils/date/getRelativeTime";

const renderTextWithLinks = (text) => {
  if (!text) return null;
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (match) {
      return (
        <a
          key={i}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          {match[1]}
        </a>
      );
    }
    return part;
  });
};

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
    <article className="flex flex-col rounded-lg border border-zinc-800 text-zinc-200 bg-zinc-900 w-full mb-3 px-4 py-3">
      <header className="flex items-center space-x-1.5 text-xs">
        <span className="text-zinc-400 font-medium">{"r/" + subreddit.display_name}</span>
        <span className="text-zinc-600">·</span>
        <span className="text-zinc-500">{"u/" + post.author}</span>
        <span className="text-zinc-600">·</span>
        <span className="text-zinc-500">{postTime}</span>
      </header>
      <h2 className="mt-1.5 mb-1.5">
        <a
          href={post.url}
          className="text-zinc-200 text-base font-semibold break-words hover:text-violet-400 transition-colors"
        >
          {post.title}
        </a>
      </h2>
      {imageUrl ? (
        <div className="rounded-lg overflow-hidden">
          <img
            src={imageUrl}
            alt={post.title}
            className="w-full aspect-[4/3] object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={handleImageError}
          />
        </div>
      ) : thumbnailUrl ? (
        <div className="flex items-start gap-3">
          <p className="text-sm text-zinc-400 break-words line-clamp-3 flex-1">
            {renderTextWithLinks(post.selftext)}
          </p>
          <img
            src={thumbnailUrl}
            alt={post.title}
            className="w-16 h-16 rounded-lg object-cover shrink-0 bg-zinc-800"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.style.display = "none";
            }}
          />
        </div>
      ) : post.selftext ? (
        <p className="text-sm text-zinc-400 break-words line-clamp-4">
          {renderTextWithLinks(post.selftext)}
        </p>
      ) : null}
      <footer className="flex items-center space-x-3 mt-2.5 text-zinc-500">
        <div className="flex items-center rounded-full bg-zinc-800">
          <button
            onClick={handleUpvote}
            aria-label="Upvote"
            className={`flex items-center py-1.5 px-2 rounded-full hover:bg-zinc-700 focus-visible:ring-2 focus-visible:ring-zinc-500 transition-colors ${voteStatus === "upvoted" ? "text-green-500" : "text-zinc-200"}`}
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
            aria-label="Downvote"
            className={`flex items-center py-1.5 px-2 rounded-full hover:bg-zinc-700 focus-visible:ring-2 focus-visible:ring-zinc-500 transition-colors ${voteStatus === "downvoted" ? "text-red-500" : "text-zinc-200"}`}
          >
            <DownVoteIcon
              className={`w-5 h-5 fill-current ${voteStatus === "downvoted" ? "text-red-500" : ""}`}
            />
          </button>
        </div>
        <button
          onClick={handleToggleComments}
          aria-label="Toggle comments"
          className={`flex items-center space-x-1.5 py-1.5 px-3 rounded-full hover:bg-zinc-700 focus-visible:ring-2 focus-visible:ring-zinc-500 transition-colors ${showComments ? "bg-violet-500/15 text-violet-400" : "bg-zinc-800 text-zinc-200"}`}
        >
          <CommentIcon className={`w-5 h-5 ${showComments ? "fill-violet-400" : "fill-zinc-200"}`} />
          <span className="text-sm">
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
