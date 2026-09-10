import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Sparkles, RefreshCw } from 'lucide-react';
import { eventApi } from '../services/api.ts';
import { IEvent, FilterState } from '../types.ts';
import { EventCard } from '../components/EventCard.tsx';
import { FilterPanel } from '../components/FilterPanel.tsx';
import { SearchBar } from '../components/SearchBar.tsx';
import { Pagination } from '../components/Pagination.tsx';
import { EventCardSkeleton } from '../components/Skeleton.tsx';
import { EmptyState } from '../components/EmptyState.tsx';
import { ErrorState } from '../components/ErrorState.tsx';

export const EventsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial filter values from URL search params
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('search') || '',
    type: searchParams.get('type') || 'all',
    technology: searchParams.get('technology') || 'all',
    locationType: searchParams.get('locationType') || 'all',
    accessType: searchParams.get('accessType') || 'all',
    dateRange: (searchParams.get('dateRange') as any) || 'all',
    sortBy: (searchParams.get('sortBy') as any) || 'date-asc',
    page: parseInt(searchParams.get('page') || '1', 10),
    limit: 9
  });

  const [events, setEvents] = useState<IEvent[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync state to URL params
  const updateUrlParams = useCallback((newFilters: FilterState) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.type && newFilters.type !== 'all') params.set('type', newFilters.type);
    if (newFilters.technology && newFilters.technology !== 'all') params.set('technology', newFilters.technology);
    if (newFilters.locationType && newFilters.locationType !== 'all') params.set('locationType', newFilters.locationType);
    if (newFilters.dateRange && newFilters.dateRange !== 'all') params.set('dateRange', newFilters.dateRange);
    if (newFilters.sortBy && newFilters.sortBy !== 'date-asc') params.set('sortBy', newFilters.sortBy);
    if (newFilters.page > 1) params.set('page', String(newFilters.page));

    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  // Fetch events based on current filters
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Calculate date filters
      let from: string | undefined;
      let to: string | undefined;
      const now = new Date();

      if (filters.dateRange === 'today') {
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));
        from = startOfDay.toISOString();
        to = endOfDay.toISOString();
      } else if (filters.dateRange === 'this-week') {
        const oneWeekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        from = new Date().toISOString();
        to = oneWeekAhead.toISOString();
      } else if (filters.dateRange === 'this-month') {
        const oneMonthAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        from = new Date().toISOString();
        to = oneMonthAhead.toISOString();
      } else if (filters.dateRange === 'upcoming') {
        from = new Date().toISOString();
      }

      const res = await eventApi.getEvents({
        search: filters.search,
        type: filters.type,
        technology: filters.technology,
        locationType: filters.locationType,
        from,
        to,
        page: filters.page,
        limit: filters.limit,
        sortBy: filters.sortBy,
        status: 'approved'
      });

      setEvents(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err: any) {
      console.error('Failed to load events:', err);
      setError(err.message || 'Error fetching events');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEvents();
    updateUrlParams(filters);
  }, [fetchEvents, filters, updateUrlParams]);

  // Handlers
  const handleFilterChange = (updated: Partial<FilterState>) => {
    setFilters(prev => ({
      ...prev,
      ...updated,
      page: updated.page !== undefined ? updated.page : 1
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      technology: 'all',
      locationType: 'all',
      accessType: 'all',
      dateRange: 'all',
      sortBy: 'date-asc',
      page: 1,
      limit: 9
    });
  };

  // Active filter tags for quick removal
  const activeTags = [];
  if (filters.search) activeTags.push({ key: 'search', label: `Keyword: "${filters.search}"`, clear: () => handleFilterChange({ search: '' }) });
  if (filters.type && filters.type !== 'all') activeTags.push({ key: 'type', label: `Type: ${filters.type}`, clear: () => handleFilterChange({ type: 'all' }) });
  if (filters.technology && filters.technology !== 'all') activeTags.push({ key: 'tech', label: `#${filters.technology}`, clear: () => handleFilterChange({ technology: 'all' }) });
  if (filters.locationType && filters.locationType !== 'all') activeTags.push({ key: 'loc', label: `Format: ${filters.locationType}`, clear: () => handleFilterChange({ locationType: 'all' }) });
  if (filters.dateRange && filters.dateRange !== 'all') activeTags.push({ key: 'date', label: `Date: ${filters.dateRange}`, clear: () => handleFilterChange({ dateRange: 'all' }) });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full min-h-screen">
      {/* Top Header & Search Bar */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Explore Tech Events
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Find and filter upcoming hackathons, meetups, workshops, and conferences worldwide.
            </p>
          </div>

          <div className="w-full md:w-96">
            <SearchBar
              initialValue={filters.search}
              onSearchSubmit={q => handleFilterChange({ search: q, page: 1 })}
              placeholder="Search by title, tech, city..."
            />
          </div>
        </div>

        {/* Sub-bar: Mobile filter toggle, sort dropdown, and active tags */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-2xl bg-zinc-100/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            {/* Mobile Filter Button */}
            <button
              id="mobile-open-filters-btn"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 shadow-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-violet-500" />
              <span>Filters</span>
              {activeTags.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {activeTags.length}
                </span>
              )}
            </button>

            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Showing <strong className="text-zinc-900 dark:text-zinc-100">{pagination.total}</strong> {pagination.total === 1 ? 'event' : 'events'}
            </span>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
            <label htmlFor="sort-select" className="text-xs text-zinc-500 dark:text-zinc-400">
              Sort by:
            </label>
            <select
              id="sort-select"
              value={filters.sortBy}
              onChange={e => handleFilterChange({ sortBy: e.target.value as any, page: 1 })}
              className="text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="date-asc">Date: Upcoming first</option>
              <option value="date-desc">Date: Furthest first</option>
              <option value="popular">Popularity / Attendees</option>
              <option value="trending">Trending Status</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-2">
            <span className="text-xs text-zinc-400 font-medium">Active filters:</span>
            {activeTags.map(tag => (
              <span
                key={tag.key}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-violet-500/10 text-violet-700 dark:text-cyan-300 border border-violet-500/20"
              >
                <span>{tag.label}</span>
                <button
                  onClick={tag.clear}
                  className="hover:text-rose-500 transition-colors p-0.5"
                  aria-label={`Remove filter ${tag.label}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              onClick={handleResetFilters}
              className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline font-medium ml-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Main Content Layout: Sidebar + Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Filter Sidebar (Desktop & Mobile Drawer) */}
        <FilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
          isMobileOpen={isMobileFilterOpen}
          onMobileClose={() => setIsMobileFilterOpen(false)}
          totalResults={pagination.total}
        />

        {/* Events Grid Area */}
        <main id="events-grid-main" className="flex-1 w-full">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={fetchEvents} />
          ) : events.length === 0 ? (
            <EmptyState
              title="No events match your criteria"
              description="We couldn't find any events matching your selected filters. Try broadening your keywords or removing some filters."
              onClearFilters={handleResetFilters}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {events.map(event => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-10">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={page => handleFilterChange({ page })}
                />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};
