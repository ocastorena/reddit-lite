import { useState } from "react";
import { useDispatch } from "react-redux";
import { setFilteredPosts } from "../../features/postsFeed/postsFeedSlice";
// Components
import Sidebar from "../Sidebar/Sidebar";
import Subreddits from "../../features/subreddits/Subreddits";
// SVGs as components
import MenuIcon from "../../assets/hamburger-menu.svg?react";
// SVGs as images
import RedditIcon from "../../assets/reddit.svg";

const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    dispatch(setFilteredPosts(searchTerm));
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full py-4 px-4 bg-zinc-950 border-b-2 border-zinc-800 grid grid-cols-2 sm:grid-cols-3 sm:items-center sm:py-2 overflow-y-auto transition-all duration-300 ${
        isMenuOpen ? "h-screen" : ""
      }`}
    >
      <a className="flex items-center w-fit px-2" href="/">
        <img src={RedditIcon} alt="Site Logo" className="h-8 w-8 mr-2" />
        <span className="text-zinc-100 font-bold">Reddit</span>
        <span className="text-orange-400">Lite</span>
      </a>

      <form onSubmit={handleFormSubmit} className="hidden sm:block">
        <label htmlFor="search-input" className="sr-only">
          Search
        </label>
        <input
          type="text"
          id="search-input"
          placeholder="Search Subreddit"
          aria-label="Search"
          onChange={handleInputChange}
          className="w-full h-12 p-2 rounded-xl bg-zinc-900 text-zinc-100 placeholder-zinc-300 border-2 border-zinc-800"
        />
      </form>

      <button className="ml-auto sm:hidden" onClick={toggleMenu}>
        <MenuIcon className="w-10 h-10 fill-zinc-300" />
      </button>
      {isMenuOpen && (
        <div className="sm:hidden bg-zinc-900 w-full p-4 mt-4 col-span-2 overflow-y-auto scrollbar-hide">
          <Sidebar />
          <Subreddits />
        </div>
      )}
    </header>
  );
};

export default Navbar;
