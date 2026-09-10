import React from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Calendar, ArrowUpRight, Users, Lock, Unlock } from 'lucide-react';
import { IEvent } from '../types.ts';
import { EventTypeBadge, LocationBadge } from './EventBadge.tsx';
import { Countdown } from './Countdown.tsx';
import { TechnologyBadge } from './TechnologyBadge.tsx';

interface EventCardProps {
  event: IEvent;
  priority?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const eventDate = parseISO(event.startDate);
  const formattedDate = format(eventDate, 'MMM d, yyyy');

  const visibleTechs = event.technologies.slice(0, 3);
  const extraTechs = event.technologies.length - visibleTechs.length;

  return (
    <article
      id={`event-card-${event._id || event.slug}`}
      className="group relative flex flex-col rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl hover:shadow-violet-500/10 hover:border-zinc-300 dark:hover:border-zinc-700 h-full"
    >
      {/* Card Header Media */}
      <div className="relative h-44 w-full overflow-hidden bg-zinc-900">
        <img
          src={event.coverImage}
          alt={event.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          <div className="flex items-center gap-1.5">
            <EventTypeBadge type={event.type} size="sm" />
            {event.accessType === 'close-doors' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-black/70 text-purple-300 border border-purple-500/50 backdrop-blur-xs">
                <Lock className="w-2.5 h-2.5" />
                <span>Closed</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-black/70 text-emerald-300 border border-emerald-500/50 backdrop-blur-xs">
                <Unlock className="w-2.5 h-2.5" />
                <span>Open</span>
              </span>
            )}
          </div>
          <Countdown startDate={event.startDate} endDate={event.endDate} />
        </div>

        {/* Bottom image overlay meta */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-zinc-300 z-10">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{formattedDate}</span>
          </span>
          {event.currentParticipants !== undefined && event.currentParticipants > 0 && (
            <span className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-xs text-[11px] text-zinc-200">
              <Users className="w-3 h-3 text-violet-400" />
              <span>{event.currentParticipants} joined</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          {/* Location Line */}
          <div className="mb-2">
            <LocationBadge locationType={event.locationType} location={event.location} />
          </div>

          {/* Title */}
          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 group-hover:text-violet-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug mb-2">
            <Link to={`/events/${event.slug || event._id}`} className="focus:outline-none focus:underline">
              {event.title}
            </Link>
          </h3>

          {/* Truncated Description */}
          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Card Footer: Tech tags + CTA */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/70 flex items-center justify-between gap-2">
          {/* Technology Badges */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-hidden">
            {visibleTechs.map(t => (
              <TechnologyBadge key={t} name={t} className="text-[10px] py-0.5 px-2" />
            ))}
            {extraTechs > 0 && (
              <span className="text-[10px] font-medium text-zinc-400 px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/50">
                +{extraTechs}
              </span>
            )}
          </div>

          {/* Action Link */}
          <Link
            to={`/events/${event.slug || event._id}`}
            id={`event-cta-${event._id || event.slug}`}
            className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 group-hover:bg-violet-600 group-hover:text-white dark:group-hover:bg-cyan-500 dark:group-hover:text-zinc-950 transition-all duration-200"
            aria-label={`View details for ${event.title}`}
          >
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
};
