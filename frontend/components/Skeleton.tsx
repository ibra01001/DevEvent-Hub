import React from 'react';

export const EventCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 overflow-hidden flex flex-col h-[400px]">
      {/* Cover Skeleton */}
      <div className="h-44 w-full bg-zinc-200 dark:bg-zinc-800/60 skeleton-shimmer relative" />
      
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-5 w-24 rounded bg-zinc-200 dark:bg-zinc-800/80 skeleton-shimmer" />
            <div className="h-5 w-20 rounded-full bg-zinc-200 dark:bg-zinc-800/80 skeleton-shimmer" />
          </div>
          <div className="h-6 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800/80 skeleton-shimmer" />
          <div className="space-y-1.5 pt-1">
            <div className="h-4 w-full rounded bg-zinc-200/70 dark:bg-zinc-800/50 skeleton-shimmer" />
            <div className="h-4 w-5/6 rounded bg-zinc-200/70 dark:bg-zinc-800/50 skeleton-shimmer" />
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
          <div className="h-4 w-28 rounded bg-zinc-200 dark:bg-zinc-800/80 skeleton-shimmer" />
          <div className="h-8 w-24 rounded-lg bg-zinc-200 dark:bg-zinc-800/80 skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
};

export const FeaturedCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/80 h-96 w-full skeleton-shimmer p-8 flex flex-col justify-end space-y-4" />
  );
};
