import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { ShieldAlert, LogIn, ArrowRight } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'staff' | 'admin';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole
}) => {
  const { user, role, isStaff, isAdmin, quickSwitch } = useAuth();

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
            <LogIn className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Authentication Required</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              This area is restricted to {requiredRole || 'authorized'} team members. Please log in or select a demo role below.
            </p>
          </div>

          {/* Quick Demo Switcher */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 space-y-2 text-left">
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Quick Demo Access</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => quickSwitch('staff')}
                className="px-3 py-2 rounded-xl text-xs font-bold text-cyan-600 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 hover:opacity-90 flex items-center justify-between"
              >
                <span>Enter as Staff</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => quickSwitch('admin')}
                className="px-3 py-2 rounded-xl text-xs font-bold text-violet-600 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 hover:opacity-90 flex items-center justify-between"
              >
                <span>Enter as Admin</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-95"
          >
            <span>Go to Login Page</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  if (requiredRole === 'admin' && !isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Admin Access Only</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Your current account ({user.name}, role: <strong className="uppercase">{role}</strong>) does not have Admin privileges.
            </p>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => quickSwitch('admin')}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-violet-600 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 hover:opacity-90"
            >
              Switch to Admin Role
            </button>

            <Link
              to="/staff"
              className="inline-block text-xs font-semibold text-zinc-500 hover:underline"
            >
              ← Go to Staff Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (requiredRole === 'staff' && !isStaff && !isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Staff Access Only</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              This section is reserved for Staff members to review attendee applications and manage events.
            </p>
          </div>

          <button
            type="button"
            onClick={() => quickSwitch('staff')}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-cyan-600 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 hover:opacity-90"
          >
            Switch to Staff Role
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
