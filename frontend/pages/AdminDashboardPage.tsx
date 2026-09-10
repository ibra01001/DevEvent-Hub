import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Users,
  ShieldAlert,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Trash2,
  Power,
  Mail,
  Building,
  Key,
  Info,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';
import { authApi, applicationApi, eventApi } from '../services/api.ts';
import { IUser, AdminStats, IApplication } from '../types.ts';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'staff' | 'applications' | 'system'>('staff');
  const [users, setUsers] = useState<IUser[]>([]);
  const [applications, setApplications] = useState<IApplication[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalEvents: 0,
    openDoorsCount: 0,
    closeDoorsCount: 0,
    totalParticipants: 0,
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
    totalStaff: 0,
    activeStaff: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New staff form state
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffDept, setNewStaffDept] = useState('Technical Events & Hackathons');
  const [isCreatingStaff, setIsCreatingStaff] = useState(false);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, statsRes, appRes] = await Promise.all([
        authApi.getUsers(),
        authApi.getAdminStats(),
        applicationApi.getApplications()
      ]);

      setUsers(usersRes.data || []);
      if (statsRes.data) setStats(statsRes.data);
      setApplications(appRes.data || []);
    } catch (err: any) {
      console.error('Admin data fetch error:', err);
      showToast(err.message || 'Failed to load administrator data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim() || !newStaffPassword) {
      showToast('Please fill out all required fields.', 'warning');
      return;
    }

    setIsCreatingStaff(true);
    try {
      // STRICT REQUIREMENT: Admin can only create staff. Role is hardcoded to staff.
      const res = await authApi.createStaff({
        name: newStaffName.trim(),
        email: newStaffEmail.trim(),
        password: newStaffPassword,
        department: newStaffDept.trim()
      });

      showToast(res.message, 'success');
      setShowCreateModal(false);
      setNewStaffName('');
      setNewStaffEmail('');
      setNewStaffPassword('');
      fetchAdminData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create staff account.', 'error');
    } finally {
      setIsCreatingStaff(false);
    }
  };

  const handleToggleStatus = async (staffId: string) => {
    try {
      const res = await authApi.toggleStaffStatus(staffId);
      showToast(res.message, 'info');
      setUsers(prev =>
        prev.map(u => (u.id === staffId || u._id === staffId ? { ...u, status: res.data.status } : u))
      );
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleDeleteStaff = async (staffId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove staff member "${name}"?`)) {
      return;
    }

    try {
      const res = await authApi.deleteStaff(staffId);
      showToast(res.message, 'success');
      setUsers(prev => prev.filter(u => u.id !== staffId && u._id !== staffId));
    } catch (err: any) {
      showToast(err.message || 'Failed to delete staff member', 'error');
    }
  };

  const staffMembers = users.filter(u => u.role === 'staff');
  const adminMembers = users.filter(u => u.role === 'admin');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-zinc-900 via-indigo-950/60 to-cyan-950/40 border border-cyan-800/40 dark:border-cyan-700/30 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            Super Administrator Control Plane
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Platform Governance & Staff Management
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
            Manage staff credentials and platform infrastructure. Under platform governance, <span className="text-cyan-300 font-semibold">Admins provision staff</span>, while <span className="text-violet-300 font-semibold">Staff make applicant decisions</span>.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-950 bg-cyan-400 hover:bg-cyan-300 shadow-md shadow-cyan-400/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New Staff</span>
          </button>
          <button
            onClick={fetchAdminData}
            title="Refresh Admin Data"
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
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Staff Team</span>
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white mt-2">
            {stats.totalStaff}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">{stats.activeStaff} active operations members</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Events</span>
            <span className="p-1.5 rounded-lg bg-violet-500/10 text-violet-500">
              <Building className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-violet-600 dark:text-violet-400 mt-2">
            {stats.totalEvents}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">
            {stats.openDoorsCount} Open Doors • {stats.closeDoorsCount} Closed
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Applications</span>
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Lock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
            {stats.totalApplications}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">{stats.pendingApplications} pending staff decision</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Attendees</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            {stats.totalParticipants.toLocaleString()}
          </p>
          <p className="text-[11px] text-zinc-500 mt-1">Confirmed participants platform-wide</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'staff'
              ? 'bg-cyan-500 text-zinc-950 font-extrabold shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Staff Accounts ({staffMembers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'applications'
              ? 'bg-cyan-500 text-zinc-950 font-extrabold shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Applicant Oversight ({applications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'system'
              ? 'bg-cyan-500 text-zinc-950 font-extrabold shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>System & Database</span>
        </button>
      </div>

      {/* Tab Content: Staff Roster */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">Active Staff Accounts</h2>
              <p className="text-xs text-zinc-500">
                Staff members have authority to post events and accept/reject Close-Doors applications.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-zinc-950 bg-cyan-400 hover:bg-cyan-300 shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Staff</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffMembers.map(staff => {
              const isActive = staff.status === 'active';
              return (
                <div
                  key={staff.id || staff._id}
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-zinc-900 dark:text-white">{staff.name}</h3>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300">
                          {staff.role}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                          : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {staff.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{staff.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{staff.department || 'General Operations'}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleStatus(staff.id || (staff as any)._id)}
                      className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                        isActive
                          ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                          : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{isActive ? 'Suspend' : 'Activate'}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteStaff(staff.id || (staff as any)._id, staff.name)}
                      className="text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Super Admin Roster Note */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-cyan-500" />
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-white">Platform Super Admin</p>
                <p className="text-[11px] text-zinc-500">
                  {adminMembers[0]?.name || 'Alex Rivera'} ({adminMembers[0]?.email || 'admin@devevent.hub'})
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-100 dark:bg-cyan-950/70 text-cyan-800 dark:text-cyan-300 px-2.5 py-1 rounded-lg">
              Super Admin (Protected)
            </span>
          </div>
        </div>
      )}

      {/* Tab Content: Applications Oversight (Audit Only) */}
      {activeTab === 'applications' && (
        <div className="space-y-4">
          {/* Strict Role Separation Notice */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3.5">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <p className="font-bold">Role Separation Policy (Admin Audit View)</p>
              <p className="leading-relaxed">
                As an Administrator, you can view candidate submissions across the platform for audit and compliance, but <strong>you cannot accept or reject applications</strong>. The power to decide on attendee admission is strictly designated to <strong>Staff members</strong>.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {applications.map(app => (
              <div
                key={app._id || app.id}
                className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">{app.fullName}</span>
                    <span className="text-xs text-zinc-500 font-mono">({app.email})</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        app.status === 'pending'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                          : app.status === 'accepted'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                          : 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Applied for: <span className="font-semibold text-violet-600 dark:text-violet-400">{app.eventTitle}</span> • Phone: {app.phone}
                  </p>

                  {app.reviewedBy && (
                    <p className="text-[11px] text-zinc-400">
                      Evaluated by: {app.reviewedBy}
                    </p>
                  )}
                </div>

                {/* Disabled Admin Action Indicator */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                    <Lock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Staff Action Only</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: System & Database */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-500" />
              <span>Storage Architecture</span>
            </h3>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              DevEvent Hub stores all events, applications, and staff records directly in <strong>MongoDB Atlas</strong> using Mongoose. Local seed data and in-memory fallback logic have been removed so the platform uses the live database as the single source of truth.
            </p>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-white">MongoDB Storage</p>
                <p className="text-[11px] text-zinc-500">
                  All data is stored and retrieved from the connected Atlas cluster.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Staff Account */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-500">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                  Add New Staff Member
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            {/* Strict Policy Banner: Admin CANNOT create another admin */}
            <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/60 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-violet-900 dark:text-violet-200 leading-normal">
                <strong>Platform Policy:</strong> Admin cannot create another admin role. Newly created accounts are strictly configured as <strong>Staff</strong>.
              </p>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newStaffName}
                  onChange={e => setNewStaffName(e.target.value)}
                  placeholder="e.g. Rachel Adams"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newStaffEmail}
                  onChange={e => setNewStaffEmail(e.target.value)}
                  placeholder="rachel@devevent.hub"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={newStaffPassword}
                  onChange={e => setNewStaffPassword(e.target.value)}
                  placeholder="Staff login password"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Department / Focus
                </label>
                <input
                  type="text"
                  value={newStaffDept}
                  onChange={e => setNewStaffDept(e.target.value)}
                  placeholder="e.g. Hackathons & Competitions"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Locked Role indicator */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Role (Enforced)
                </label>
                <div className="px-3.5 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 flex items-center justify-between">
                  <span className="font-bold text-violet-600 dark:text-violet-400">Staff Member</span>
                  <span className="text-[10px] text-zinc-400 font-mono">LOCKED</span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingStaff}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-zinc-950 bg-cyan-400 hover:bg-cyan-300 shadow-sm shadow-cyan-400/25 disabled:opacity-50"
                >
                  {isCreatingStaff ? 'Creating Staff...' : 'Create Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
