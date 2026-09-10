import React from 'react';

interface TechnologyBadgeProps {
  name: string;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export const TechnologyBadge: React.FC<TechnologyBadgeProps> = ({
  name,
  onClick,
  selected = false,
  className = ''
}) => {
  const isInteractive = Boolean(onClick);

  return (
    <span
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={isInteractive ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick!() : undefined}
      className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-md border transition-all duration-150 select-none ${
        selected
          ? 'bg-violet-600 text-white border-violet-500 shadow-sm shadow-violet-500/25'
          : 'bg-zinc-100 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700/60 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 hover:text-zinc-900 dark:hover:text-white'
      } ${isInteractive ? 'cursor-pointer' : ''} ${className}`}
    >
      #{name}
    </span>
  );
};
