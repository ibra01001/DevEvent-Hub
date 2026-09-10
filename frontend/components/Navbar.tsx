import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  PlusCircle,
  ShieldCheck,
  Menu,
  X,
  Search,
  Sparkles,
  LogIn,
  LogOut
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle.tsx';
import { useAuth } from '../context/AuthContext.tsx';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isStaff, isAdmin, logout } = useAuth();
  const canSubmitEvent = isStaff || isAdmin;

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setQuickSearchOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/', icon: Sparkles },
    { name: 'Discover', path: '/events', icon: Compass }
  ];

  const isLinkActive = (linkPath: string) => {
    const currentPath = location.pathname;

    if (linkPath === '/') {
      return currentPath === '/';
    }

    if (linkPath === '/events') {
      if (currentPath === '/events/submit') return false;
      return currentPath.startsWith('/events');
    }

    return currentPath === linkPath;
  };

  const isSubmitActive = location.pathname === '/events/submit';
  const isOrganizerActive = location.pathname.startsWith('/organizer');

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchVal.trim())}`);
      setQuickSearchOpen(false);
      setSearchVal('');
    }
  };

  return (
    <header
      id="main-navbar"
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'glass-nav shadow-sm shadow-black/5'
          : 'bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              id="brand-logo-link"
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-violet-600/25 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-zinc-900 dark:text-white flex items-center gap-1">
                  DevEvent<span className="text-violet-600 dark:text-cyan-400">Hub</span>
                </span>
                <span className="text-[10px] -mt-1 font-mono tracking-widest text-zinc-400 uppercase">
                  Tech Discovery
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Main Navigation">
              {navLinks.map(link => {
                const isActive = isLinkActive(link.path);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    id={`nav-link-${link.name.toLowerCase()}`}
                    className={`relative flex items-center gap-1.5 px-3 py-2 text-xs lg:text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-zinc-900 dark:text-white font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? 'text-violet-600 dark:text-cyan-400'
                          : 'text-zinc-400 dark:text-zinc-500'
                      }`}
                    />
                    <span>{link.name}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-violet-600 to-cyan-400 rounded-full shadow-xs" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Desktop Right Controls */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Quick Search Button */}
            <button
              id="navbar-search-btn"
              onClick={() => setQuickSearchOpen(!quickSearchOpen)}
              className="p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle Quick Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {!user && (
              <Link
                to="/login"
                id="navbar-login-btn"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}

            {user && (
              <button
                type="button"
                onClick={handleLogout}
                id="navbar-logout-btn"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            )}

            {canSubmitEvent && (
              <Link
                to="/events/submit"
                id="navbar-submit-event-btn"
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs transition-all ${
                  isSubmitActive
                    ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white ring-2 ring-violet-500/50 dark:ring-cyan-400/50 shadow-md shadow-violet-600/30 scale-[1.02]'
                    : 'bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-600/25 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span className={isSubmitActive ? 'font-bold text-white' : 'font-semibold'}>Submit Event</span>
              </Link>
            )}

            {/* Organizer Portal */}
            <Link
              to="/organizer"
              id="navbar-organizer-btn"
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition-all ${
                isOrganizerActive
                  ? 'bg-cyan-500/15 dark:bg-cyan-500/20 border border-cyan-500/40 dark:border-cyan-400/40 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${isOrganizerActive ? 'text-cyan-700 dark:text-cyan-400' : 'text-cyan-500'}`} />
              <span className={isOrganizerActive ? 'text-cyan-700 dark:text-cyan-300 font-bold' : 'font-semibold'}>
                Organizer
              </span>
            </Link>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />

            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle Mobile Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Search Slideout Bar for Desktop */}
      {quickSearchOpen && (
        <div
          id="navbar-quicksearch-bar"
          className="hidden md:block border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-900/90 py-3 px-4 backdrop-blur-md animate-fadeIn"
        >
          <form onSubmit={handleQuickSearch} className="max-w-2xl mx-auto flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                autoFocus
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder="Search events, cities, organizers, tags... and press Enter"
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setQuickSearchOpen(false)}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Animated Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl px-4 pt-4 pb-6 space-y-3 animate-fadeIn"
        >
          {/* Mobile Search input */}
          <form onSubmit={handleQuickSearch} className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search hackathons, meetups..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </form>

          {/* Links */}
          <div className="space-y-1">
            {navLinks.map(link => {
              const isActive = isLinkActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'text-zinc-900 dark:text-white font-semibold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-violet-600 dark:text-cyan-400' : 'text-zinc-400 dark:text-zinc-500'
                      }`}
                    />
                    <span className="relative">
                      {link.name}
                      {isActive && (
                        <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-600 to-cyan-400 rounded-full" />
                      )}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
            {!user && (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}

            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            )}

            {canSubmitEvent && (
              <Link
                to="/events/submit"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs transition-all ${
                  isSubmitActive
                    ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white ring-2 ring-violet-500/50 shadow-md shadow-violet-600/30'
                    : 'bg-violet-600 text-white shadow-md shadow-violet-600/30 font-semibold'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span className={isSubmitActive ? 'text-white font-bold' : ''}>Submit Event</span>
              </Link>
            )}

            <Link
              to="/organizer"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs transition-all ${
                isOrganizerActive
                  ? 'bg-cyan-500/15 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/40 dark:border-cyan-400/40 font-bold'
                  : 'border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${isOrganizerActive ? 'text-cyan-700 dark:text-cyan-400' : 'text-cyan-500'}`} />
              <span className={isOrganizerActive ? 'text-cyan-700 dark:text-cyan-300 font-bold' : ''}>
                Organizer Dashboard
              </span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
