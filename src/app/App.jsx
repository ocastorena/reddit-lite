import Header from "../components/Navbar/Header";
import PostsFeed from "../features/postsFeed/PostsFeed";
import SubredditsList from "../features/subreddits/components/SubredditsList";
import SubredditDetails from "../features/subreddits/components/SubredditDetails";
import GitHubIcon from "../assets/github.svg?react";

function App() {
  return (
    <>
      <Header />
      <main className="grid grid-cols-4 gap-4 px-4 pt-20 pb-10 w-full h-[calc(100vh-4rem)] max-w-7xl mx-auto">
        <aside className="hidden sm:block col-span-1 bg-zinc-900 rounded-lg p-4 overflow-y-auto overscroll-contain scrollbar-hide">
          <SubredditDetails />
        </aside>
        <section className="col-span-4 sm:col-span-2 flex flex-col items-center rounded-lg w-full overflow-y-auto overscroll-contain scrollbar-hide">
          <PostsFeed />
        </section>
        <aside className="hidden sm:flex col-span-1 flex-col rounded-lg bg-zinc-900 p-4 overflow-y-auto overscroll-contain scrollbar-hide">
          <SubredditsList />
        </aside>
      </main>
      <footer className="fixed bottom-0 left-0 z-50 w-full bg-zinc-950 border-t border-zinc-800 px-6 py-3 flex items-center justify-between text-xs text-zinc-500">
        <p>
          Built with{" "}
          <span className="text-zinc-400">React</span>,{" "}
          <span className="text-zinc-400">Redux Toolkit</span>,{" "}
          <span className="text-zinc-400">Tailwind CSS</span>{" "}
          &amp; <span className="text-zinc-400">Vite</span>
        </p>
        <a
          href="https://github.com/ocastorena/reddit-lite"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 transition-colors"
        >
          <GitHubIcon className="w-4 h-4 fill-current" />
          GitHub
        </a>
      </footer>
    </>
  );
}

export default App;
