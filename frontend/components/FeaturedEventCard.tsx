import React from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Calendar, Users, Trophy, ArrowRight, Sparkles } from 'lucide-react';
import { IEvent } from '../types.ts';
import { EventTypeBadge, LocationBadge } from './EventBadge.tsx';
import { Countdown } from './Countdown.tsx';
import { TechnologyBadge } from './TechnologyBadge.tsx';

interface FeaturedEventCardProps {
  event: IEvent;
}

export const FeaturedEventCard: React.FC<FeaturedEventCardProps> = ({ event }) => {
  const eventDate = parseISO(event.startDate);
  const formattedDate = format(eventDate, 'MMMM d, yyyy');

  return (
    <div
      id={`featured-event-${event._id || event.slug}`}
      className="relative rounded-3xl border border-violet-500/20 dark:border-violet-500/30 overflow-hidden group shadow-2xl bg-zinc-950"
    >
      {/* Background Cover Image with Rich Gradient Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src={event.coverImage}
          alt={event.title}
          className="w-full h-full object-cover opacity-35 group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-zinc-950/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col justify-between min-h-[380px] md:min-h-[420px]">
        {/* Top Header info */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-600/90 text-white shadow-lg shadow-violet-600/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>FEATURED EVENT</span>
            </span>
            <EventTypeBadge type={event.type} size="md" />
          </div>

          <Countdown startDate={event.startDate} endDate={event.endDate} />
        </div>

        {/* Middle Main Content */}
        <div className="my-6 max-w-2xl">
          <div className="flex items-center gap-3 text-sm text-zinc-300 mb-3">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{formattedDate}</span>
            </span>
            <span>•</span>
            <LocationBadge locationType={event.locationType} location={event.location} />
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight group-hover:text-cyan-300 transition-colors">
            <Link to={`/events/${event.slug || event._id}`}>{event.title}</Link>
          </h2>

          <p className="text-sm sm:text-base text-zinc-300 mt-3 line-clamp-3 leading-relaxed">
            {event.description}
          </p>

          {/* Prize Pool or Highlights if present */}
          {event.prizePool && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>{event.prizePool}</span>
            </div>
          )}
        </div>

        {/* Footer info & CTA */}
        <div className="pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {event.technologies.map(t => (
              <TechnologyBadge
                key={t}
                name={t}
                className="bg-white/10 text-white border-white/15 text-xs py-1 px-2.5 hover:bg-white/20"
              />
            ))}
          </div>

          <div className="flex items-center gap-4">
            {event.currentParticipants !== undefined && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400">
                <Users className="w-4 h-4 text-violet-400" />
                <span>{event.currentParticipants} registered</span>
              </div>
            )}

            <Link
              to={`/events/${event.slug || event._id}`}
              id={`featured-explore-btn-${event._id || event.slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-lg shadow-violet-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Explore Event</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
