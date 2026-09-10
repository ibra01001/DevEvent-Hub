import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Loader2, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { eventApi } from '../services/api.ts';
import { IEvent } from '../types.ts';
import { EventTypeBadge } from './EventBadge.tsx';

interface SearchBarProps {
  initialValue?: string;
  onSearchSubmit?: (query: string) => void;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SearchBar: React.FC<SearchBarProps> = ({
  initialValue = '',
  onSearchSubmit,
  placeholder = 'Search hackathons, meetups, technologies, cities...',
  className = '',
  size = 'md'
}) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<IEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Debounced search for live dropdown suggestions
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await eventApi.searchEvents(query.trim());
        setSuggestions(res.data.slice(0, 5));
        setIsOpen(true);
      } catch (err) {
        console.error('Search suggestion error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    if (onSearchSubmit) {
      onSearchSubmit(query.trim());
    } else {
      navigate(`/events?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelectEvent = (event: IEvent) => {
    setIsOpen(false);
    navigate(`/events/${event.slug || event._id}`);
  };

  const clearQuery = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    if (onSearchSubmit) onSearchSubmit('');
  };

  const sizeClasses = {
    sm: 'h-10 text-xs px-3.5 pl-9',
    md: 'h-12 text-sm px-4 pl-11',
    lg: 'h-14 text-base px-5 pl-12 sm:pl-14'
  }[size];

  const iconSizes = {
    sm: 'w-4 h-4 left-3',
    md: 'w-4 h-4 left-4',
    lg: 'w-5 h-5 left-4 sm:left-5'
  }[size];

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative w-full">
        <Search
          className={`absolute top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none ${iconSizes}`}
        />

        <input
          id="global-search-input"
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className={`w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-all ${sizeClasses} pr-20`}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {isLoading && <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />}
          {query && (
            <button
              id="search-clear-button"
              type="button"
              onClick={clearQuery}
              className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            id="search-submit-button"
            type="submit"
            className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white transition-colors"
          >
            Search
          </button>
        </div>
      </form>

      {/* Instant Dropdown Suggestions */}
      {isOpen && suggestions.length > 0 && (
        <div
          id="search-suggestions-menu"
          className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-zinc-100 dark:divide-zinc-800/80"
        >
          <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-950/40 flex items-center justify-between text-[11px] font-semibold text-zinc-400 tracking-wider uppercase">
            <span>Instant Results</span>
            <span>Press Enter for full list</span>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {suggestions.map(event => (
              <div
                key={event._id}
                onClick={() => handleSelectEvent(event)}
                className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 cursor-pointer transition-colors flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={event.coverImage}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <EventTypeBadge type={event.type} size="sm" />
                      <span className="text-xs text-zinc-400 truncate">{event.location}</span>
                    </div>
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-violet-600 dark:group-hover:text-cyan-400 truncate transition-colors">
                      {event.title}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            ))}
          </div>

          <div
            onClick={handleSubmit}
            className="p-3 text-center text-xs font-semibold text-violet-600 dark:text-cyan-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 cursor-pointer transition-colors flex items-center justify-center gap-1.5"
          >
            <span>See all results for "{query}"</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      )}
    </div>
  );
};
