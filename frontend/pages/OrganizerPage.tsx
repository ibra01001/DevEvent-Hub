import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Eye,
  RotateCcw,
  Sparkles,
  Search,
  ExternalLink,
  Layers,
  AlertTriangle,
  Plus,
  Database
} from 'lucide-react';
import { organizerApi, eventApi } from '../services/api.ts';
import { IEvent, EventStatus, DbStatusInfo } from '../types.ts';
import { EventTypeBadge, LocationBadge } from '../components/EventBadge.tsx';
import { Modal } from '../components/Modal.tsx';
import { useToast } from '../context/ToastContext.tsx';

export const OrganizerPage: React.FC = () => {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [dbStatus, setDbStatus] = useState<DbStatusInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { success, error: toastError, info } = useToast();

  // Modal states
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const [modalAction, setModalAction] = useState<'review' | 'approve' | 'reject' | 'delete' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchOrganizerEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await organizerApi.getOrganizerEvents();
      setEvents(res.data || []);
      if (res.dbStatus) {
        setDbStatus(res.dbStatus);
      }
    } catch (err: any) {
      console.error('Failed to load organizer events:', err);
      toastError('Dashboard Error', 'Could not load event queue.');
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchOrganizerEvents();
  }, [fetchOrganizerEvents]);

  // KPIs
  const totalCount = events.length;
  const pendingCount = events.filter(e => e.status === 'pending').length;
  const approvedCount = events.filter(e => e.status === 'approved').length;
  const rejectedCount = events.filter(e => e.status === 'rejected').length;
  const totalAttendees = events.reduce((sum, e) => sum + (e.currentParticipants || 0), 0);

  // Filtered list
  const filteredEvents = events.filter(e => {
    if (activeTab !== 'all' && e.status !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        e.organizer.toLowerCase().includes(q) ||
        e.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Action Handlers
  const handleApprove = async () => {
    if (!selectedEvent) return;
    setProcessing(true);
    try {
      await organizerApi.approveEvent(selectedEvent._id);
      success('Event Approved', `"${selectedEvent.title}" is now published and publicly visible.`);
      setModalAction(null);
      setSelectedEvent(null);
      fetchOrganizerEvents();
    } catch (err: any) {
      toastError('Approval Failed', err.message || 'Error updating status');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedEvent) return;
    setProcessing(true);
    try {
      await organizerApi.rejectEvent(selectedEvent._id, rejectionReason);
      info('Event Rejected', `"${selectedEvent.title}" has been moved to rejected status.`);
      setModalAction(null);
      setSelectedEvent(null);
      setRejectionReason('');
      fetchOrganizerEvents();
    } catch (err: any) {
      toastError('Rejection Failed', err.message || 'Error rejecting event');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    setProcessing(true);
    try {
      await organizerApi.deleteEvent(selectedEvent._id);
      success('Event Deleted', `"${selectedEvent.title}" was removed from the database.`);
      setModalAction(null);
      setSelectedEvent(null);
      fetchOrganizerEvents();
    } catch (err: any) {
      toastError('Deletion Failed', err.message || 'Error deleting event');
    } finally {
      setProcessing(false);
    }
  };

  const statusBadge = (status: EventStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="w-3 h-3" />
            <span>Approved</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            <span>Pending Review</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            <span>Rejected</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 min-h-screen">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-violet-600 dark:text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Curator & Organizer Dashboard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Event Management Queue
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Review event proposals, manage listings, and audit developer community submissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/events/submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-600/25 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Submission</span>
          </Link>
        </div>
      </div>

      {/* Storage Engine Status Banner */}
      {dbStatus && (
        <div className="mb-6 p-4 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className={`p-2 rounded-xl ${dbStatus.connected ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-violet-500/10 text-violet-600 dark:text-cyan-400'}`}>
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {dbStatus.connected ? 'Storage Engine: MongoDB Atlas' : 'Storage Engine: In-Memory Datastore'}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                  dbStatus.connected
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-violet-500/10 text-violet-600 dark:text-cyan-400 border border-violet-500/30'
                }`}>
                  {dbStatus.connected ? 'Atlas Connected' : 'High Performance'}
                </span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 mt-0.5 text-xs leading-relaxed">
                {dbStatus.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Submissions</span>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-1">{totalCount}</p>
        </div>

        <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Needs Review</span>
            {pendingCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {pendingCount}
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Approved & Live</span>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {approvedCount}
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5 dark:bg-rose-500/10">
          <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">Rejected</span>
          <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
            {rejectedCount}
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 col-span-2 md:col-span-1">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Global Attendees</span>
          <p className="text-2xl font-extrabold text-violet-600 dark:text-cyan-400 mt-1">
            {totalAttendees.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 self-start sm:self-auto">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(tab => (
            <button
              key={tab}
              id={`organizer-tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search submissions..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Events Table / Card List */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-zinc-400">Loading events queue...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              No events found in this category
            </p>
            <p className="text-xs text-zinc-500">
              Try switching tabs or resetting the demo seed data.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Event Details</th>
                  <th className="py-3 px-4">Format</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Organizer</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {filteredEvents.map(event => {
                  const eventDate = parseISO(event.startDate);
                  return (
                    <tr
                      key={event._id}
                      className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-3">
                          <img
                            src={event.coverImage}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <EventTypeBadge type={event.type} size="sm" />
                              {event.featured && (
                                <span className="text-[10px] bg-violet-500/10 text-violet-600 px-1.5 py-0.5 rounded font-bold">
                                  Featured
                                </span>
                              )}
                            </div>
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                              {event.title}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <LocationBadge locationType={event.locationType} location={event.location} />
                      </td>

                      <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400">
                        {format(eventDate, 'MMM d, yyyy')}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[140px]">
                          {event.organizer}
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-[140px]">
                          {event.organizerEmail}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">{statusBadge(event.status)}</td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Review Detail Modal */}
                          <button
                            onClick={() => {
                              setSelectedEvent(event);
                              setModalAction('review');
                            }}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Review full proposal"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Approve Action */}
                          {event.status !== 'approved' && (
                            <button
                              onClick={() => {
                                setSelectedEvent(event);
                                setModalAction('approve');
                              }}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-500/10 transition-colors"
                              title="Approve event"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Reject Action */}
                          {event.status !== 'rejected' && (
                            <button
                              onClick={() => {
                                setSelectedEvent(event);
                                setModalAction('reject');
                              }}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                              title="Reject event"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete Action */}
                          <button
                            onClick={() => {
                              setSelectedEvent(event);
                              setModalAction('delete');
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors"
                            title="Delete event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CONFIRMATION & REVIEW MODALS */}

      {/* 1. Review Details Modal */}
      <Modal
        isOpen={modalAction === 'review'}
        onClose={() => setModalAction(null)}
        title={selectedEvent?.title || 'Event Details'}
        description={`Submitted by ${selectedEvent?.organizer} (${selectedEvent?.organizerEmail})`}
        maxWidth="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <Link
              to={`/events/${selectedEvent?.slug || selectedEvent?._id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-cyan-400 hover:underline"
            >
              <span>View public event page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <div className="flex items-center gap-2">
              {selectedEvent?.status !== 'approved' && (
                <button
                  onClick={() => setModalAction('approve')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Approve
                </button>
              )}
              {selectedEvent?.status !== 'rejected' && (
                <button
                  onClick={() => setModalAction('reject')}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700"
                >
                  Reject
                </button>
              )}
            </div>
          </div>
        }
      >
        {selectedEvent && (
          <div className="space-y-4 text-xs">
            <img
              src={selectedEvent.coverImage}
              alt=""
              className="w-full h-44 object-cover rounded-xl border border-zinc-200 dark:border-zinc-800"
            />
            <div>
              <span className="font-bold text-zinc-400 uppercase text-[10px] block mb-1">
                Description
              </span>
              <p className="text-zinc-800 dark:text-zinc-200 leading-relaxed text-xs">
                {selectedEvent.longDescription || selectedEvent.description}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div>
                <span className="font-bold text-zinc-400 uppercase text-[10px] block">Location</span>
                <p className="text-zinc-800 dark:text-zinc-200 mt-0.5">
                  {selectedEvent.locationType} - {selectedEvent.location}
                </p>
              </div>
              <div>
                <span className="font-bold text-zinc-400 uppercase text-[10px] block">Capacity</span>
                <p className="text-zinc-800 dark:text-zinc-200 mt-0.5">
                  {selectedEvent.participantsLimit || 'Unlimited'}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 2. Approve Confirmation Modal */}
      <Modal
        isOpen={modalAction === 'approve'}
        onClose={() => setModalAction(null)}
        title="Approve & Publish Event"
        description="This will publish the event to the public discover directory and search index."
        footer={
          <>
            <button
              onClick={() => setModalAction(null)}
              className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              id="confirm-approve-btn"
              onClick={handleApprove}
              disabled={processing}
              className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              {processing ? 'Publishing...' : 'Yes, Approve & Publish'}
            </button>
          </>
        }
      >
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Are you sure you want to approve <strong>{selectedEvent?.title}</strong>? An automated confirmation will be sent to <strong>{selectedEvent?.organizerEmail}</strong>.
        </p>
      </Modal>

      {/* 3. Reject Confirmation Modal */}
      <Modal
        isOpen={modalAction === 'reject'}
        onClose={() => setModalAction(null)}
        title="Reject Submission"
        description="Mark this event submission as rejected."
        footer={
          <>
            <button
              onClick={() => setModalAction(null)}
              className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              id="confirm-reject-btn"
              onClick={handleReject}
              disabled={processing}
              className="px-4 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
            >
              {processing ? 'Rejecting...' : 'Reject Event'}
            </button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-zinc-600 dark:text-zinc-400">
            Provide an optional reason for rejecting <strong>{selectedEvent?.title}</strong>:
          </p>
          <textarea
            rows={3}
            value={rejectionReason}
            onChange={e => setRejectionReason(e.target.value)}
            placeholder="e.g. Missing valid registration link or duplicate listing."
            className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xs"
          />
        </div>
      </Modal>

      {/* 4. Delete Confirmation Modal */}
      <Modal
        isOpen={modalAction === 'delete'}
        onClose={() => setModalAction(null)}
        title="Delete Event"
        description="Permanently delete this event from the database."
        footer={
          <>
            <button
              onClick={() => setModalAction(null)}
              className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              id="confirm-delete-btn"
              onClick={handleDelete}
              disabled={processing}
              className="px-4 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
            >
              {processing ? 'Deleting...' : 'Delete Permanently'}
            </button>
          </>
        }
      >
        <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p>
            Warning: This action cannot be undone. <strong>{selectedEvent?.title}</strong> will be permanently deleted from the database.
          </p>
        </div>
      </Modal>
    </div>
  );
};
