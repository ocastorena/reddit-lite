import { useEffect, useRef, useState } from "react"
import { useDispatch } from "react-redux"
import { setFilteredPosts } from "../../features/postsFeed/postsFeedSlice"
// Components
import SubredditDetails from "../../features/subreddits/components/SubredditDetails"
import SubredditsList from "../../features/subreddits/components/SubredditsList"
// SVGs as components
import MenuIcon from "../../assets/hamburger-menu.svg?react"
// SVGs as images
import RedditIcon from "../../assets/reddit.svg"

const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const dispatch = useDispatch()
  const debounceRef = useRef(null)

  const handleInputChange = (e) => {
    const nextSearchTerm = e.target.value
    setSearchTerm(nextSearchTerm)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      dispatch(setFilteredPosts(nextSearchTerm))
    }, 300)
  }

  useEffect(() => {
    return () => clearTimeout(debounceRef.current)
  }, [])

  const handleFormSubmit = (e) => {
    e.preventDefault()
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header
      className="fixed top-0 left-0 z-50 w-full bg-zinc-950 border-b-2 border-zinc-800 flex flex-col">
      <nav className="grid grid-cols-[1fr_2fr_1fr] items-center gap-2 sm:gap-4 py-4 px-4 sm:py-2">
        <a className="flex items-center w-fit px-2" href="/">
          <img src={RedditIcon} alt="Site Logo" className="h-8 w-8 mr-2" />
          <span className="text-zinc-100 font-bold hidden sm:inline">Reddit</span>
          <span className="text-violet-400 hidden sm:inline">Lite</span>
        </a>

        <form onSubmit={handleFormSubmit} className="flex justify-center">
          <label htmlFor="search-input" className="sr-only">
            Search
          </label>
          <input
            type="text"
            id="search-input"
            placeholder="Search posts"
            aria-label="Search"
            value={searchTerm}
            onChange={handleInputChange}
            className="w-full max-w-lg h-10 sm:h-12 p-2 rounded-xl bg-zinc-900 text-zinc-100 placeholder-zinc-300 border-2 border-zinc-800"
          />
        </form>

        <div className="flex justify-end">
          <button
            className="sm:hidden"
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}>
            <MenuIcon className="w-10 h-10 fill-zinc-300" />
          </button>
        </div>
      </nav>
      {isMenuOpen && (
        <div className="sm:hidden p-4 overflow-y-auto overscroll-contain scrollbar-hide max-h-[calc(100vh-4rem)] space-y-4">
          <div className="bg-zinc-900 rounded-lg p-4">
            <SubredditDetails />
          </div>
          <div className="bg-zinc-900 rounded-lg p-4">
            <SubredditsList onSubredditSelect={() => setIsMenuOpen(false)} />
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
