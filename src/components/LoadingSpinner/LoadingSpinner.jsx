import PropTypes from "prop-types";

const LoadingSpinner = ({ size = "h-12 w-12" }) => {
  return (
    <div className="flex justify-center items-center" role="status">
      <div
        className={`animate-spin rounded-full border-4 border-zinc-700 border-t-zinc-300 ${size}`}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.string,
};

export default LoadingSpinner;
