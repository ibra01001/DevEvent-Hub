import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, Sparkles } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div
      id="not-found-container"
      className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4"
    >
      <div className="w-16 h-16 rounded-2xl bg-violet-500/10 dark:bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-600 dark:text-cyan-400 mb-6">
        <Sparkles className="w-8 h-8" />
      </div>

      <span className="text-xs font-mono tracking-widest text-violet-600 dark:text-cyan-400 uppercase font-bold mb-2">
        Error 404
      </span>

      <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-3">
        Page not found
      </h1>

      <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-md mb-8 leading-relaxed">
        The event, page, or resource you are looking for has been moved or doesn't exist in our directory.
      </p>

      <div className="flex items-center gap-3">
        <Link
          to="/"
          id="not-found-home-btn"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <Link
          to="/events"
          id="not-found-explore-btn"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 transition-colors"
        >
          <Compass className="w-4 h-4" />
          <span>Explore Events</span>
        </Link>
      </div>
    </div>
  );
};
