import React from 'react';
import { EventType, LocationType } from '../types.ts';
import { Trophy, Users, Building, Laptop, Video, Zap, Globe, MapPin, Radio } from 'lucide-react';

interface EventTypeBadgeProps {
  type: EventType;
  className?: string;
  size?: 'sm' | 'md';
}

export const EventTypeBadge: React.FC<EventTypeBadgeProps> = ({
  type,
  className = '',
  size = 'sm'
}) => {
  const configs: Record<EventType, { label: string; icon: any; style: string }> = {
    hackathon: {
      label: 'HACKATHON',
      icon: Trophy,
      style: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30'
    },
    meetup: {
      label: 'MEETUP',
      icon: Users,
      style: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30'
    },
    conference: {
      label: 'CONFERENCE',
      icon: Building,
      style: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
    },
    workshop: {
      label: 'WORKSHOP',
      icon: Laptop,
      style: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
    },
    webinar: {
      label: 'WEBINAR',
      icon: Video,
      style: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
    },
    competition: {
      label: 'COMPETITION',
      icon: Zap,
      style: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30'
    }
  };

  const config = configs[type] || configs.meetup;
  const Icon = config.icon;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold tracking-wider rounded-md border uppercase ${padding} ${config.style} ${className}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
};

interface LocationBadgeProps {
  locationType: LocationType;
  location?: string;
  className?: string;
}

export const LocationBadge: React.FC<LocationBadgeProps> = ({
  locationType,
  location,
  className = ''
}) => {
  const configs: Record<LocationType, { label: string; icon: any; style: string }> = {
    online: {
      label: 'Online',
      icon: Globe,
      style: 'text-cyan-600 dark:text-cyan-400'
    },
    'in-person': {
      label: location || 'In-Person',
      icon: MapPin,
      style: 'text-zinc-600 dark:text-zinc-300'
    },
    hybrid: {
      label: location ? `Hybrid (${location.split(',')[0]})` : 'Hybrid',
      icon: Radio,
      style: 'text-purple-600 dark:text-purple-400'
    }
  };

  const config = configs[locationType] || configs.online;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${config.style} ${className}`}>
      <Icon className="w-3.5 h-3.5 shrink-0 opacity-85" />
      <span className="truncate max-w-[190px]">{config.label}</span>
    </span>
  );
};
