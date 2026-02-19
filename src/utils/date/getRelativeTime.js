export const getRelativeTime = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp * 1000);
  const secondsAgo = Math.floor((now - date) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(secondsAgo / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval !== 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
};
