import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import {
  Calendar,
  MapPin,
  Globe,
  Users,
  ExternalLink,
  Share2,
  Bookmark,
  BookmarkCheck,
  Clock,
  Mail,
  ChevronLeft,
  Trophy,
  CheckCircle,
  Building,
  Sparkles,
  Lock,
  Unlock,
  Phone,
  Hash,
  User,
  X,
  AlertCircle,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { eventApi, applicationApi } from '../services/api.ts';
import { IEvent, IApplication } from '../types.ts';
import { EventTypeBadge, LocationBadge } from '../components/EventBadge.tsx';
import { Countdown } from '../components/Countdown.tsx';
import { TechnologyBadge } from '../components/TechnologyBadge.tsx';
import { EventCard } from '../components/EventCard.tsx';
import { ErrorState } from '../components/ErrorState.tsx';
import { useToast } from '../context/ToastContext.tsx';

export const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<IEvent | null>(null);
  const [relatedEvents, setRelatedEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);
  const { success, info, showToast } = useToast();
  const navigate = useNavigate();

  // Regular User Application / Registration state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [number, setNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationResult, setApplicationResult] = useState<IApplication | null>(null);

  useEffect(() => {
    if (!id) return;

    async function loadEvent() {
      setLoading(true);
      setError(null);
      try {
        const res = await eventApi.getEventById(id!);
        const evt = res.data;
        setEvent(evt);

        // Load bookmark status from local storage
        const savedBookmarks = JSON.parse(localStorage.getItem('devevent-bookmarks') || '[]');
        setIsBookmarked(savedBookmarks.includes(evt._id));

        // Load related events (same type or shared technologies)
        try {
          const relatedRes = await eventApi.getEvents({
            type: evt.type,
            limit: 3,
            status: 'approved'
          });
          setRelatedEvents((relatedRes.data || []).filter(e => e._id !== evt._id).slice(0, 3));
        } catch {
          // ignore related failure
        }
      } catch (err: any) {
        console.error('Failed to load event:', err);
        setError(err.message || 'Event not found');
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
    window.scrollTo(0, 0);
  }, [id]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      success('Link copied to clipboard!', 'Share this event with your friends and teammates.');
    } else {
      info('Event URL', window.location.href);
    }
  };

  const handleToggleBookmark = () => {
    if (!event) return;
    const savedBookmarks = JSON.parse(localStorage.getItem('devevent-bookmarks') || '[]');
    let updated: string[];

    if (isBookmarked) {
      updated = savedBookmarks.filter((b: string) => b !== event._id);
      setIsBookmarked(false);
      info('Removed from bookmarks');
    } else {
      updated = [...savedBookmarks, event._id];
      setIsBookmarked(true);
      success('Saved to bookmarks!', 'Find your saved events anytime.');
    }
    localStorage.setItem('devevent-bookmarks', JSON.stringify(updated));
  };

  const handleRegister = () => {
    setShowApplyModal(true);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    if (!fullName.trim() || !email.trim() || !phone.trim() || !number.trim()) {
      showToast('Please fill out all required fields: full name, email, phone, and number.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await applicationApi.submitApplication({
        eventId: event._id,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        number: number.trim(),
        notes: notes.trim() || undefined
      });

      setApplicationResult(res.data);
      if (res.isCloseDoors) {
        success('Application Submitted!', 'Your application is now pending review by our Staff team.');
      } else {
        setHasRegistered(true);
        setEvent(prev => prev ? { ...prev, currentParticipants: (prev.currentParticipants || 0) + 1 } : prev);
        success('Registration Confirmed!', 'Your instant entry ticket has been confirmed.');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to submit application', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="h-96 w-full bg-zinc-200 dark:bg-zinc-800 rounded-3xl" />
        <div className="h-8 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="h-20 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-md mx-auto py-20 px-4">
        <ErrorState
          title="Event Not Found"
          message={error || 'The event you are looking for does not exist or has been removed.'}
          onRetry={() => navigate('/events')}
        />
        <div className="text-center mt-4">
          <Link
            to="/events"
            className="text-xs font-semibold text-violet-600 dark:text-cyan-400 hover:underline"
          >
            ← Back to all events
          </Link>
        </div>
      </div>
    );
  }

  const startDate = parseISO(event.startDate);
  const endDate = parseISO(event.endDate);
  const formattedDate = format(startDate, 'EEEE, MMMM d, yyyy');
  const formattedStartTime = format(startDate, 'h:mm a');
  const formattedEndTime = format(endDate, 'h:mm a');

  const registrationLink = event.onlineUrl || event.website || '#';

  return (
    <div className="min-h-screen pb-20">
      {/* Top Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Explore</span>
        </Link>
      </div>

      {/* Hero Header Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="relative rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 shadow-2xl">
          {/* Background image & gradient masks */}
          <div className="absolute inset-0 z-0">
            <img
              src={event.coverImage}
              alt={event.title}
              className="w-full h-full object-cover opacity-30 blur-xs scale-102"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/50" />
          </div>

          <div className="relative z-10 p-6 sm:p-10 md:p-14">
            {/* Badges Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex flex-wrap items-center gap-3">
                <EventTypeBadge type={event.type} size="md" />
                {event.accessType === 'close-doors' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-950/80 text-purple-300 border border-purple-500/40 backdrop-blur-md">
                    <Lock className="w-3.5 h-3.5 text-purple-400" />
                    <span>Closed Doors • Application Required</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
                    <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Open Doors • Instant Access</span>
                  </span>
                )}
                <Countdown startDate={event.startDate} endDate={event.endDate} />
              </div>

              {/* Action Buttons: Share & Bookmark */}
              <div className="flex items-center gap-2">
                <button
                  id="event-detail-bookmark-btn"
                  onClick={handleToggleBookmark}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all ${
                    isBookmarked
                      ? 'bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-600/30'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                  }`}
                  aria-label="Save to bookmarks"
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="w-4 h-4 text-white" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                  <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
                </button>

                <button
                  id="event-detail-share-btn"
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md transition-colors"
                  aria-label="Share event"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mb-6">
              {event.title}
            </h1>

            {/* Event Key Metadata Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10 text-zinc-300 text-xs sm:text-sm">
              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">{formattedDate}</p>
                  <p className="text-zinc-400 text-xs">
                    {formattedStartTime} - {formattedEndTime}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white capitalize">{event.locationType}</p>
                  <p className="text-zinc-400 text-xs truncate max-w-[200px]">{event.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Users className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">
                    {event.currentParticipants || 0} Registered
                  </p>
                  <p className="text-zinc-400 text-xs">
                    {event.participantsLimit ? `Cap: ${event.participantsLimit}` : 'Open capacity'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Building className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white truncate max-w-[180px]">{event.organizer}</p>
                  <p className="text-zinc-400 text-xs">Verified Organizer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Details Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left 2 Columns: Details, Technologies, Schedule, Organizer */}
          <div className="lg:col-span-2 space-y-10">
            {/* About the Event */}
            <section id="event-about-section" className="space-y-4">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                About this event
              </h2>
              <div className="prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line">
                {event.longDescription || event.description}
              </div>

              {event.prizePool && (
                <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-amber-500 shrink-0" />
                  <div>
                    <span className="font-bold text-xs uppercase tracking-wider block">
                      Prize Pool & Bounties
                    </span>
                    <span className="text-sm font-semibold">{event.prizePool}</span>
                  </div>
                </div>
              )}
            </section>

            {/* Technologies */}
            <section id="event-tech-section" className="space-y-3 pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Technologies & Focus Areas
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                {event.technologies.map(tech => (
                  <Link key={tech} to={`/events?technology=${encodeURIComponent(tech)}`}>
                    <TechnologyBadge
                      name={tech}
                      className="py-1.5 px-3 text-xs hover:border-violet-500"
                    />
                  </Link>
                ))}
              </div>
            </section>

            {/* Schedule Timeline */}
            {event.schedule && event.schedule.length > 0 && (
              <section id="event-schedule-section" className="space-y-4 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-violet-500" />
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    Event Schedule
                  </h2>
                </div>

                <div className="space-y-3 pl-2 border-l-2 border-violet-500/30">
                  {event.schedule.map((item, idx) => (
                    <div key={idx} className="relative pl-6 pb-2">
                      {/* Timeline dot */}
                      <span className="absolute -left-[9px] top-1 w-3 h-3 rounded-full bg-violet-600 border-2 border-white dark:border-zinc-900" />
                      <div className="p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
                            {item.time}
                          </span>
                          {item.speaker && (
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                              Speaker: <strong className="text-zinc-700 dark:text-zinc-200">{item.speaker}</strong>
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Organizer Info */}
            <section id="event-organizer-section" className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-4">
                Hosted by
              </h2>
              <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {event.organizerAvatar ? (
                    <img
                      src={event.organizerAvatar}
                      alt={event.organizer}
                      className="w-12 h-12 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-base">
                      {event.organizer.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {event.organizer}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3" />
                      <span>{event.organizerEmail}</span>
                    </p>
                  </div>
                </div>

                {event.website && (
                  <a
                    href={event.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <span>Website</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Sticky Action & Ticket Card */}
          <div className="space-y-6">
            <div className="sticky top-24 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-6 shadow-xl backdrop-blur-md space-y-6">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                    Access & Registration
                  </span>
                  {event.accessType === 'close-doors' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Closed Doors</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      <Unlock className="w-2.5 h-2.5" />
                      <span>Open Doors</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white">
                    {event.accessType === 'close-doors' ? 'Application Required' : 'Free / Instant'}
                  </span>
                  <Countdown startDate={event.startDate} endDate={event.endDate} />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  {event.accessType === 'close-doors'
                    ? 'Staff evaluates and approves/rejects applications.'
                    : 'Open access for all developers. Instant registration.'}
                </p>
              </div>

              {/* Registration CTA */}
              <div className="space-y-2">
                {hasRegistered ? (
                  <div className="w-full py-3.5 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-center font-semibold text-sm flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Registered Successfully!</span>
                  </div>
                ) : (
                  <button
                    id="event-register-now-btn"
                    onClick={handleRegister}
                    className="w-full py-3.5 px-4 rounded-xl text-sm font-bold bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white shadow-lg shadow-violet-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                  >
                    {event.accessType === 'close-doors' ? (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Apply for Closed Doors Event</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Register for Event (Open Doors)</span>
                      </>
                    )}
                  </button>
                )}

                {/* Direct external link if available */}
                {(event.onlineUrl || event.website) && (
                  <a
                    href={registrationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Visit Official Event Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Perks / Guarantees */}
              <div className="space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Verified technical content and mentors</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Calendar invite (.ics) & session recordings</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Direct Discord & networking lounge access</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Events Section */}
      {relatedEvents.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 mt-12 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Related Events You Might Like
            </h3>
            <Link
              to="/events"
              className="text-xs font-semibold text-violet-600 dark:text-cyan-400 hover:underline"
            >
              Explore more →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedEvents.map(re => (
              <EventCard key={re._id} event={re} />
            ))}
          </div>
        </section>
      )}

      {/* Regular User Registration / Application Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                      event.accessType === 'close-doors'
                        ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                        : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    }`}
                  >
                    {event.accessType === 'close-doors' ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    <span>{event.accessType === 'close-doors' ? 'Closed Doors Application' : 'Open Doors Registration'}</span>
                  </span>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-snug">
                  {applicationResult
                    ? 'Registration Summary'
                    : event.accessType === 'close-doors'
                    ? 'Apply for Closed Doors Event'
                    : 'Register for Event'}
                </h3>
                <p className="text-xs text-zinc-500 line-clamp-1">{event.title}</p>
              </div>

              <button
                onClick={() => {
                  setShowApplyModal(false);
                  setApplicationResult(null);
                }}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Application Outcome View (when submitted) */}
            {applicationResult ? (
              <div className="space-y-4">
                <div
                  className={`p-5 rounded-2xl border text-center space-y-2 ${
                    applicationResult.status === 'confirmed'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-white dark:bg-zinc-800 shadow-sm">
                    {applicationResult.status === 'confirmed' ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <Clock className="w-6 h-6 text-purple-500" />
                    )}
                  </div>

                  <h4 className="font-bold text-base">
                    {applicationResult.status === 'confirmed'
                      ? 'Registration Confirmed!'
                      : 'Application Pending Staff Review'}
                  </h4>

                  <p className="text-xs leading-relaxed max-w-sm mx-auto opacity-90">
                    {applicationResult.status === 'confirmed'
                      ? 'Your instant entry ticket has been confirmed. See your ticket details below.'
                      : 'This is a Closed-Doors event. Our Staff team evaluates applications and will accept or reject submissions before the event.'}
                  </p>
                </div>

                {/* Ticket Details Card */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-zinc-200/60 dark:border-zinc-700/40">
                    <span className="text-zinc-500">Applicant:</span>
                    <span className="font-bold text-zinc-900 dark:text-white">{applicationResult.fullName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-200/60 dark:border-zinc-700/40">
                    <span className="text-zinc-500">Email:</span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">{applicationResult.email}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-200/60 dark:border-zinc-700/40">
                    <span className="text-zinc-500">Phone:</span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">{applicationResult.phone}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-200/60 dark:border-zinc-700/40">
                    <span className="text-zinc-500">Number / ID:</span>
                    <span className="font-mono font-bold text-violet-600 dark:text-cyan-400">
                      #{applicationResult.id || (applicationResult as any)._id?.substring(0, 8) || 'CONFIRMED'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-500">Status:</span>
                    <span className="font-extrabold uppercase text-[10px] px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200">
                      {applicationResult.status}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowApplyModal(false);
                    setApplicationResult(null);
                  }}
                  className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90"
                >
                  Done
                </button>
              </div>
            ) : (
              /* Regular User Registration Form */
              <form onSubmit={handleSubmitApplication} className="space-y-3.5">
                {/* Regular User No-Account Banner */}
                <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/60 flex items-start gap-2.5 text-xs text-cyan-900 dark:text-cyan-200">
                  <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>No account required!</strong> As an attendee, you can explore events and apply directly by providing your details below.
                  </p>
                </div>

                {/* 1. Full Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Jordan Miller"
                      className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>

                {/* 2. Email */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="jordan@developer.io"
                      className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                </div>

                {/* 3. Phone & 4. Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+1 (555) 019-2834"
                        className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      Number (Registration / ID) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="text"
                        required
                        value={number}
                        onChange={e => setNumber(e.target.value)}
                        placeholder="e.g. 1 (Single) or ID #849"
                        className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Optional Notes */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Additional Notes / Experience (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Tell the organizers or staff about your tech stack or expectations..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 shadow-md shadow-violet-600/25 disabled:opacity-50 transition-all flex items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <span>Submitting...</span>
                    ) : event.accessType === 'close-doors' ? (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Submit for Staff Review</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Confirm Instant Registration</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
