import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Globe, Terminal, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      id="main-footer"
      className="border-t border-zinc-200 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 text-xs mt-auto transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-violet-600/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-zinc-900 dark:text-white">
                DevEvent<span className="text-violet-600 dark:text-cyan-400">Hub</span>
              </span>
            </Link>

            <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed max-w-sm">
              Discover. Build. Connect. The modern technology event discovery network for engineers, founders, researchers, and developers worldwide.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-zinc-400 pt-2 font-mono">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>REST API & Engine operational</span>
            </div>
          </div>

          {/* Col 2: Platform */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
              Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/events" className="hover:text-violet-600 dark:hover:text-cyan-400 transition-colors">
                  Discover All Events
                </Link>
              </li>
              <li>
                <Link to="/events?type=hackathon" className="hover:text-violet-600 dark:hover:text-cyan-400 transition-colors">
                  Hackathons
                </Link>
              </li>
              <li>
                <Link to="/events?type=meetup" className="hover:text-violet-600 dark:hover:text-cyan-400 transition-colors">
                  Meetups & Communities
                </Link>
              </li>
              <li>
                <Link to="/events?type=conference" className="hover:text-violet-600 dark:hover:text-cyan-400 transition-colors">
                  Conferences
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Organizers */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
              Organizers
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/login" className="hover:text-violet-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1">
                  <span>Login to submit</span>
                  <ArrowUpRight className="w-3 h-3 text-violet-500" />
                </Link>
              </li>
              <li>
                <Link to="/organizer" className="hover:text-violet-600 dark:hover:text-cyan-400 transition-colors">
                  Organizer Dashboard
                </Link>
              </li>
              <li>
                <span className="text-zinc-400 cursor-not-allowed">
                  Sponsorship Directory (Soon)
                </span>
              </li>
              <li>
                <span className="text-zinc-400 cursor-not-allowed">
                  Venue Partnerships
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Resources */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
              Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#about" className="hover:text-violet-600 dark:hover:text-cyan-400 transition-colors">
                  About DevEvent Hub
                </a>
              </li>
              <li>
                <a href="#guidelines" className="hover:text-violet-600 dark:hover:text-cyan-400 transition-colors">
                  Community Guidelines
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-violet-600 dark:hover:text-cyan-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-violet-600 dark:hover:text-cyan-400 transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 dark:text-zinc-500 text-[11px]">
          <div>
            © 2026 DevEvent Hub. All rights reserved. Designed for builders.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-zinc-400">
              <Terminal className="w-3.5 h-3.5" />
              <span>React 19 + Express + MongoDB Atlas</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
