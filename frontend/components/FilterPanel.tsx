import React from 'react';
import { Filter, X, RotateCcw, Check, Calendar, Globe, MapPin, Layers } from 'lucide-react';
import { FilterState } from '../types.ts';

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onReset: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  totalResults?: number;
}

const EVENT_TYPES = [
  { id: 'all', label: 'All Types' },
  { id: 'hackathon', label: 'Hackathons' },
  { id: 'meetup', label: 'Meetups' },
  { id: 'conference', label: 'Conferences' },
  { id: 'workshop', label: 'Workshops' },
  { id: 'webinar', label: 'Webinars' },
  { id: 'competition', label: 'Competitions' },
];

const POPULAR_TECHS = [
  'React',
  'TypeScript',
  'Python',
  'AI',
  'Node.js',
  'Rust',
  'Go',
  'Kubernetes',
  'GraphQL',
  'Next.js'
];

const LOCATION_OPTIONS = [
  { id: 'all', label: 'Any Location' },
  { id: 'online', label: 'Online' },
  { id: 'in-person', label: 'In-Person' },
  { id: 'hybrid', label: 'Hybrid' }
];

const DATE_OPTIONS = [
  { id: 'all', label: 'Any Date' },
  { id: 'today', label: 'Today' },
  { id: 'this-week', label: 'This Week' },
  { id: 'this-month', label: 'This Month' },
  { id: 'upcoming', label: 'Upcoming Only' }
];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onReset,
  isMobileOpen = false,
  onMobileClose,
  totalResults
}) => {
  const hasActiveFilters =
    Boolean(filters.search) ||
    (filters.type && filters.type !== 'all') ||
    (filters.technology && filters.technology !== 'all') ||
    (filters.locationType && filters.locationType !== 'all') ||
    (filters.dateRange && filters.dateRange !== 'all');

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-violet-500" />
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            Filters
          </h3>
          {totalResults !== undefined && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold">
              {totalResults}
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            id="filters-reset-btn"
            onClick={onReset}
            className="text-xs font-semibold text-violet-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Filter 1: Event Type */}
      <div>
        <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2.5">
          Event Type
        </label>
        <div className="flex flex-wrap gap-1.5">
          {EVENT_TYPES.map(type => {
            const active = (filters.type || 'all') === type.id;
            return (
              <button
                key={type.id}
                id={`filter-type-${type.id}`}
                onClick={() => onFilterChange({ type: type.id, page: 1 })}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all select-none ${
                  active
                    ? 'bg-violet-600 text-white border-violet-600 font-semibold shadow-sm shadow-violet-600/20'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter 2: Technology */}
      <div>
        <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2.5">
          Technology
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            id="filter-tech-all"
            onClick={() => onFilterChange({ technology: 'all', page: 1 })}
            className={`text-xs px-3 py-1 rounded-lg border transition-all ${
              !filters.technology || filters.technology === 'all'
                ? 'bg-cyan-600 text-white border-cyan-600 font-semibold shadow-sm'
                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            All Tech
          </button>
          {POPULAR_TECHS.map(tech => {
            const active = filters.technology?.toLowerCase() === tech.toLowerCase();
            return (
              <button
                key={tech}
                id={`filter-tech-${tech.toLowerCase()}`}
                onClick={() =>
                  onFilterChange({
                    technology: active ? 'all' : tech,
                    page: 1
                  })
                }
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                  active
                    ? 'bg-cyan-600 text-white border-cyan-600 font-semibold shadow-sm'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <span>#{tech}</span>
                {active && <Check className="w-3 h-3" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter 3: Location / Format */}
      <div>
        <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2.5">
          Location & Format
        </label>
        <div className="grid grid-cols-2 gap-2">
          {LOCATION_OPTIONS.map(loc => {
            const active = (filters.locationType || 'all') === loc.id;
            return (
              <button
                key={loc.id}
                id={`filter-loc-${loc.id}`}
                onClick={() => onFilterChange({ locationType: loc.id, page: 1 })}
                className={`text-xs py-2 px-3 rounded-xl border text-center transition-all ${
                  active
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-sm'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {loc.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter 4: Date Range */}
      <div>
        <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2.5">
          Date
        </label>
        <div className="space-y-1.5">
          {DATE_OPTIONS.map(dateOpt => {
            const active = (filters.dateRange || 'all') === dateOpt.id;
            return (
              <button
                key={dateOpt.id}
                id={`filter-date-${dateOpt.id}`}
                onClick={() => onFilterChange({ dateRange: dateOpt.id as any, page: 1 })}
                className={`w-full text-left text-xs px-3 py-2 rounded-xl border flex items-center justify-between transition-all ${
                  active
                    ? 'bg-violet-500/10 border-violet-500/40 text-violet-700 dark:text-violet-300 font-semibold'
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span>{dateOpt.label}</span>
                {active && <Check className="w-3.5 h-3.5 text-violet-500" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar Layout */}
      <aside
        id="desktop-filter-sidebar"
        className="hidden lg:block w-72 shrink-0 sticky top-24 self-start bg-white/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 backdrop-blur-md rounded-2xl p-5 shadow-xs"
      >
        {content}
      </aside>

      {/* Mobile Animated Bottom Drawer / Modal */}
      {isMobileOpen && (
        <div
          id="mobile-filter-drawer-backdrop"
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn"
          onClick={onMobileClose}
        >
          <div
            id="mobile-filter-drawer"
            className="w-full max-w-md bg-white dark:bg-zinc-900 h-full p-6 overflow-y-auto flex flex-col justify-between shadow-2xl animate-slideLeft"
            onClick={e => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-violet-500" />
                  <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Filter Events
                  </span>
                </div>
                <button
                  id="mobile-filter-close"
                  onClick={onMobileClose}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {content}
            </div>

            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 mt-6 flex gap-3">
              <button
                id="mobile-filter-reset-bottom"
                onClick={() => {
                  onReset();
                  if (onMobileClose) onMobileClose();
                }}
                className="flex-1 py-3 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
              >
                Clear All
              </button>
              <button
                id="mobile-filter-apply-bottom"
                onClick={onMobileClose}
                className="flex-1 py-3 text-xs font-semibold rounded-xl bg-violet-600 text-white shadow-md shadow-violet-600/30"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
