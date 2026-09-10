import React from 'react';
import { differenceInDays, differenceInHours, isAfter, isBefore, parseISO, isToday, isTomorrow } from 'date-fns';
import { Clock, Radio, CheckCircle2 } from 'lucide-react';

interface CountdownProps {
  startDate: string;
  endDate: string;
  className?: string;
  compact?: boolean;
}

export const Countdown: React.FC<CountdownProps> = ({
  startDate,
  endDate,
  className = '',
  compact = false
}) => {
  const now = new Date();
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  // Status calculation
  let label = '';
  let status: 'upcoming' | 'live' | 'ended' = 'upcoming';
  let badgeColor = '';

  if (isBefore(end, now)) {
    label = 'Event ended';
    status = 'ended';
    badgeColor = 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700/60';
  } else if (isAfter(now, start) && isBefore(now, end)) {
    label = 'Live now';
    status = 'live';
    badgeColor = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
  } else if (isToday(start)) {
    label = 'Starts today';
    status = 'upcoming';
    badgeColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
  } else if (isTomorrow(start)) {
    label = 'Starts tomorrow';
    status = 'upcoming';
    badgeColor = 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30';
  } else {
    const days = differenceInDays(start, now);
    if (days <= 2) {
      label = `Starts in 2 days`;
    } else {
      label = `Starts in ${days} days`;
    }
    status = 'upcoming';
    badgeColor = 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30';
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badgeColor} transition-colors ${className}`}
    >
      {status === 'live' ? (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span>
      ) : status === 'ended' ? (
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
      ) : (
        <Clock className="w-3.5 h-3.5 shrink-0 text-current opacity-80" />
      )}
      <span className="whitespace-nowrap">{label}</span>
    </div>
  );
};
