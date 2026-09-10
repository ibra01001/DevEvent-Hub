import React from 'react';
import { SearchX, CalendarX, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  onClearFilters?: () => void;
  icon?: 'search' | 'calendar' | 'custom';
  customIcon?: React.ReactNode;
  actionText?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No events found',
  description = "We couldn't find any events matching your current filters. Try changing your search keywords or resetting filters.",
  onClearFilters,
  icon = 'search',
  customIcon,
  actionText = 'Clear all filters'
}) => {
  return (
    <div
      id="empty-state-container"
      className="flex flex-col items-center justify-center text-center p-12 my-8 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 max-w-lg mx-auto"
    >
      <div className="w-14 h-14 rounded-2xl bg-violet-500/10 dark:bg-violet-500/15 border border-violet-500/20 flex items-center justify-center mb-4 text-violet-600 dark:text-violet-400">
        {customIcon ? (
          customIcon
        ) : icon === 'search' ? (
          <SearchX className="w-7 h-7" />
        ) : (
          <CalendarX className="w-7 h-7" />
        )}
      </div>

      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">{title}</h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {onClearFilters && (
        <button
          id="empty-state-clear-btn"
          onClick={onClearFilters}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
