import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  PlusCircle,
  Filter,
  Lock,
  Unlock,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Mail,
  Phone,
  Hash,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { applicationApi, eventApi } from '../services/api.ts';
import { IApplication, IEvent, ApplicationStats } from '../types.ts';

export const StaffDashboardPage: React.FC = () => {
  const { user, isStaff, isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'applications' | 'events'>('applications');
  const [applications, setApplications] = useState<IApplication[]>([]);
  const [events, setEvents] = useState<IEvent[]>([]);
  const [stats, setStats] = useState<ApplicationStats>({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    confirmed: 0,
    closeDoorsTotal: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Load data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [appRes, evtRes] = await Promise.all([
        applicationApi.getApplications({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchQuery.trim() || undefined,
          eventId: eventFilter !== 'all' ? eventFilter : undefined
        }),
        eventApi.getEvents({ limit: 50 })
      ]);

      setApplications(appRes.data || []);
      if (appRes.stats) setStats(appRes.stats);
      setEvents(evtRes.data || []);
    } catch (err: any) {
      console.error('Staff dashboard fetch error:', err);
      showToast(err.message || 'Failed to load staff data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, eventFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  // Staff review application (Accept / Reject)
  const handleReview = async (appId: string, decision: 'accepted' | 'rejected') => {
    setProcessingId(appId);
    try {
      const reviewerName = user ? `${user.name} (Staff)` : 'Staff Member';
      const res = await applicationApi.reviewApplication(appId, decision, reviewerName, 'staff');
      showToast(res.message, decision === 'accepted' ? 'success' : 'info');

      // Update local state smoothly
      setApplications(prev =>
        prev.map(app => (app._id === appId ? { ...app, status: decision, reviewedBy: reviewerName } : app))
      );

      // Update stats
      setStats(prev => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        accepted: decision === 'accepted' ? prev.accepted + 1 : prev.accepted,
        rejected: decision === 'rejected' ? prev.rejected + 1 : prev.rejected
      }));
    } catch (err: any) {
      showToast(err.message || 'Failed to update application', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-violet-900/40 via-indigo-900/30 to-zinc-900 border border-violet-800/40 dark:border-violet-700/30 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-500/30">
            <Users className="w-3.5 h-3.5 text-violet-400" />
            Staff Portal • Applications & Event Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Staff Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
            Manage submissions for <span className="text-violet-300 font-semibold">Closed-Doors events</span>, evaluate attendee applications, and publish new tech events and hackathons.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Link
            to="/events/submit"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Event Post</span>
          </Link>
          <button
            onClick={fetchData}
            title="Refresh data"
            className="p-2.5 rounded-xl border border-zinc-700 bg-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Pending Review</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
            {stats.pending}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">Applications awaiting staff decision</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Accepted</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            {stats.accepted}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">Candidates approved for close-doors</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Rejected</span>
            <span className="p-1.5 rounded-lg bg-red-500/10 text-red-500">
              <XCircle className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-red-600 dark:text-red-400 mt-2">
            {stats.rejected}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">Applications turned down</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Events</span>
            <span className="p-1.5 rounded-lg bg-violet-500/10 text-violet-500">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white mt-2">
            {events.length}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">Platform tech events and hackathons</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('applications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'applications'
              ? 'bg-violet-600 text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Close-Doors Applications ({applications.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'events'
              ? 'bg-violet-600 text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Event Directory ({events.length})</span>
        </button>
      </div>

      {/* Tab Content: Applications */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search candidate name, email, phone, number..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </form>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl text-xs">
                {(['all', 'pending', 'accepted', 'rejected'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg capitalize font-semibold text-[11px] transition-all ${
                      statusFilter === s
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Event dropdown */}
              <select
                value={eventFilter}
                onChange={e => setEventFilter(e.target.value)}
                aria-label="Filter by Event"
                className="px-3 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none"
              >
                <option value="all">All Events</option>
                {events.map(e => (
                  <option key={e._id || e.slug} value={e._id || e.slug}>
                    {e.title.length > 35 ? e.title.substring(0, 35) + '...' : e.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Applications List */}
          {isLoading ? (
            <div className="p-12 text-center text-zinc-400">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs">Loading applicant records...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <Users className="w-10 h-10 text-zinc-400 mx-auto" />
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">No applications match your filter</h3>
              <p className="text-xs text-zinc-500">
                {statusFilter !== 'all' ? `No ${statusFilter} applications found.` : 'Try clearing your search filters.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map(app => {
                const isPending = app.status === 'pending';
                const isAccepted = app.status === 'accepted';
                const isRejected = app.status === 'rejected';

                return (
                  <div
                    key={app._id || app.id}
                    className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-sm font-bold text-zinc-900 dark:text-white">
                          {app.fullName}
                        </span>

                        {/* Status badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                            isPending
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                              : isAccepted
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                              : 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800'
                          }`}
                        >
                          {isPending && <Clock className="w-3 h-3" />}
                          {isAccepted && <CheckCircle2 className="w-3 h-3" />}
                          {isRejected && <XCircle className="w-3 h-3" />}
                          <span>{app.status}</span>
                        </span>

                        {/* Event badge */}
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 px-2 py-0.5 rounded-lg border border-violet-200 dark:border-violet-800/40">
                          <Lock className="w-3 h-3" />
                          <span>{app.eventTitle}</span>
                        </span>
                      </div>

                      {/* Contact and Form info */}
                      <div className="flex items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-zinc-400" />
                          <a href={`mailto:${app.email}`} className="hover:underline text-zinc-700 dark:text-zinc-300">
                            {app.email}
                          </a>
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{app.phone}</span>
                        </span>
                        {app.notes && (
                          <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 italic">
                            <span>{app.notes}</span>
                          </span>
                        )}
                      </div>

                      {app.reviewedBy && (
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                          Reviewed by {app.reviewedBy} on {app.reviewedAt ? new Date(app.reviewedAt).toLocaleDateString() : 'recently'}
                        </p>
                      )}
                    </div>

                    {/* Actions: Staff can Accept or Reject */}
                    <div className="flex items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-zinc-100 dark:border-zinc-800">
                      {isPending ? (
                        <>
                          <button
                            onClick={() => handleReview(app._id || (app as any).id, 'accepted')}
                            disabled={processingId === (app._id || (app as any).id)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/25 transition-colors disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Accept</span>
                          </button>
                          <button
                            onClick={() => handleReview(app._id || (app as any).id, 'rejected')}
                            disabled={processingId === (app._id || (app as any).id)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-400 font-medium">Decision finalized</span>
                          {/* Allow re-evaluation if needed */}
                          <button
                            onClick={() => handleReview(app._id || (app as any).id, isAccepted ? 'rejected' : 'accepted')}
                            disabled={processingId === (app._id || (app as any).id)}
                            className="text-xs text-violet-600 dark:text-violet-400 hover:underline px-2 py-1"
                          >
                            Change to {isAccepted ? 'Reject' : 'Accept'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Events */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900 dark:text-white">Active Event Catalog</h2>
            <Link
              to="/events/submit"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Event</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map(event => {
              const isCloseDoors = event.accessType === 'close-doors';
              return (
                <div
                  key={event._id || event.slug}
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        isCloseDoors
                          ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                          : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      }`}
                    >
                      {isCloseDoors ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      <span>{isCloseDoors ? 'Closed Doors' : 'Open Doors'}</span>
                    </span>

                    <span className="text-[11px] font-medium text-zinc-500 capitalize">
                      {event.type}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white line-clamp-1">
                    {event.title}
                  </h3>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
                    <span>
                      {event.currentParticipants || 0} / {event.participantsLimit || '∞'} attendees
                    </span>
                    <Link
                      to={`/events/${event.slug || event._id}`}
                      className="text-violet-600 dark:text-cyan-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
