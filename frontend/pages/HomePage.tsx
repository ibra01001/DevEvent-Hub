import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Trophy,
  Users,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Zap,
  Globe,
  Code2,
  Calendar,
  Layers,
  LogIn
} from 'lucide-react';
import { eventApi } from '../services/api.ts';
import { IEvent, TechnologyItem } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { SearchBar } from '../components/SearchBar.tsx';
import { FeaturedEventCard } from '../components/FeaturedEventCard.tsx';
import { EventCard } from '../components/EventCard.tsx';
import { EventCardSkeleton, FeaturedCardSkeleton } from '../components/Skeleton.tsx';

export const HomePage: React.FC = () => {
  const [featuredEvents, setFeaturedEvents] = useState<IEvent[]>([]);
  const [trendingEvents, setTrendingEvents] = useState<IEvent[]>([]);
  const [technologies, setTechnologies] = useState<TechnologyItem[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, isStaff, isAdmin } = useAuth();
  const canSubmitEvent = isStaff || isAdmin;

  useEffect(() => {
    async function loadHomeData() {
      setLoading(true);
      try {
        const [featRes, trendRes, techRes, upRes] = await Promise.all([
          eventApi.getFeaturedEvents(),
          eventApi.getTrendingEvents(),
          eventApi.getTechnologies(),
          eventApi.getEvents({ limit: 6, status: 'approved', sortBy: 'date-asc' })
        ]);

        setFeaturedEvents(featRes.data || []);
        setTrendingEvents(trendRes.data || []);
        setTechnologies(techRes.data || []);
        setUpcomingEvents(upRes.data || []);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  const stats = [
    { label: 'Verified Tech Events', value: '12,500+' },
    { label: 'Active Organizers', value: '3,400+' },
    { label: 'Covered Technologies', value: '80+' },
    { label: 'Developer Attendees', value: '180,000+' }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section
        id="home-hero-section"
        className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-tech-grid"
      >
        {/* Subtle Ambient Gradient Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-violet-600/15 via-indigo-500/10 to-cyan-400/15 blur-3xl rounded-full pointer-events-none -z-10" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-cyan-300 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-violet-500 dark:text-cyan-400" />
            <span>Discover what's next in tech</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.08] mb-6">
            Find your next <br className="hidden sm:inline" />
            <span className="gradient-text">tech adventure.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Discover hackathons, developer meetups, engineering summits, and hands-on workshops happening across the globe and online.
          </p>

          {/* Large Hero Search Bar */}
          <div className="max-w-2xl mx-auto mb-8 shadow-xl shadow-violet-500/5">
            <SearchBar size="lg" placeholder="Search hackathons, meetups, Python, AI, Delivery..." />
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-14">
            <Link
              to="/events"
              id="hero-explore-btn"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Compass className="w-4 h-4" />
              <span>Explore All Events</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {canSubmitEvent ? (
              <Link
                to="/events/submit"
                id="hero-submit-btn"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Submit Event</span>
              </Link>
            ) : (
              <Link
                to="/login"
                id="hero-login-btn"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <LogIn className="w-4 h-4" />
                <span>Login as Staff</span>
              </Link>
            )}
          </div>

          {/* Statistics Bar */}
          <div
            id="hero-stats-grid"
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-10 border-t border-zinc-200/80 dark:border-zinc-800/80"
          >
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                  {stat.value}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. FEATURED EVENTS SECTION */}
      <section id="featured-events-section" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-violet-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Handpicked & Premier</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Featured Events
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Events worth your attention, curated by the developer community.
            </p>
          </div>

          <Link
            to="/events?featured=true"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-violet-600 dark:text-cyan-400 hover:underline self-start md:self-auto"
          >
            <span>View all featured</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <FeaturedCardSkeleton />
        ) : featuredEvents.length > 0 ? (
          <div className="space-y-6">
            {/* Primary spotlight large card */}
            <FeaturedEventCard event={featuredEvents[0]} />

            {/* Supplementary featured cards if available */}
            {featuredEvents.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                {featuredEvents.slice(1, 4).map(event => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            )}
          </div>
        ) : null}
      </section>

      {/* 3. TRENDING EVENTS SECTION */}
      <section
        id="trending-events-section"
        className="py-16 bg-zinc-50/60 dark:bg-zinc-900/30 border-y border-zinc-200/60 dark:border-zinc-800/60"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>Hot Right Now</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
                Trending This Month
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Highest registration momentum and community excitement.
              </p>
            </div>

            <Link
              to="/events?trending=true"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-violet-600 dark:text-cyan-400 hover:underline"
            >
              <span>Explore trending</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingEvents.slice(0, 6).map(event => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 4. EXPLORE BY TECHNOLOGY */}
      <section id="technologies-section" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-violet-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
              <Code2 className="w-4 h-4" />
              <span>Ecosystems & Toolchains</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Explore by Technology
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Find events centered around your exact technical stack and interests.
            </p>
          </div>

          <Link
            to="/technologies"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-violet-600 dark:text-cyan-400 hover:underline"
          >
            <span>All technologies</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {technologies.map(tech => (
            <div
              key={tech.name}
              id={`tech-card-${tech.name.toLowerCase()}`}
              onClick={() => navigate(`/events?technology=${encodeURIComponent(tech.name)}`)}
              className="group cursor-pointer p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 hover:border-violet-500/50 dark:hover:border-cyan-500/50 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: tech.color || '#7C3AED' }}
                  />
                  <span className="text-[11px] font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md">
                    {tech.category}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-violet-600 dark:group-hover:text-cyan-400 transition-colors">
                  {tech.name}
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                  {tech.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                <span className="font-medium">{tech.count} events</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. UPCOMING EVENTS QUICK EXPLORATION */}
      <section className="py-16 bg-zinc-50/60 dark:bg-zinc-900/30 border-t border-zinc-200/60 dark:border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
                Upcoming on DevEvent Hub
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Mark your calendar for these confirmed events.
              </p>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 transition-colors"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map(evt => (
              <EventCard key={evt._id} event={evt} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION FOR ORGANIZERS */}
      <section className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative rounded-3xl overflow-hidden border border-violet-500/30 bg-gradient-to-br from-violet-950/40 via-zinc-900 to-zinc-950 p-8 sm:p-12 md:p-16 text-center">
          <div className="max-w-2xl mx-auto relative z-10 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Globe className="w-3.5 h-3.5" />
              <span>For Community Organizers & Founders</span>
            </span>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Hosting a hackathon, conference, or tech meetup?
            </h2>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              Get featured in front of 180,000+ enthusiastic developers, designers, and students worldwide. Completely free submission with fast review.
            </p>

            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link
                to="/events/submit"
                id="cta-submit-event-btn"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-xl shadow-violet-600/30 transition-all hover:scale-[1.02]"
              >
                <span>Submit Your Event Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/organizer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 transition-colors"
              >
                <span>Organizer Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
