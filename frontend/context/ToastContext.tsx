import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toastOrTitle: Omit<ToastItem, 'id'> | string, message?: string, typeOverride?: ToastType) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((toastOrTitle: Omit<ToastItem, 'id'> | string, message?: string, typeOverride?: ToastType) => {
    const toast = typeof toastOrTitle === 'string'
      ? {
          type: message && ['success', 'error', 'info', 'warning'].includes(message.toLowerCase())
            ? message.toLowerCase() as ToastType
            : (typeOverride ?? 'info'),
          title: toastOrTitle,
          message: message && !['success', 'error', 'info', 'warning'].includes(message.toLowerCase()) ? message : undefined
        }
      : toastOrTitle;

    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    const item: ToastItem = { ...toast, id };
    setToasts(prev => [...prev, item]);

    const duration = toast.duration || 4500;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const success = useCallback((title: string, message?: string) => {
    showToast({ type: 'success', title, message });
  }, [showToast]);

  const error = useCallback((title: string, message?: string) => {
    showToast({ type: 'error', title, message });
  }, [showToast]);

  const info = useCallback((title: string, message?: string) => {
    showToast({ type: 'info', title, message });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, removeToast }}>
      {children}
      {/* Fixed Toast Container */}
      <div
        id="toast-notifications-container"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map(toast => (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
              toast.type === 'success'
                ? 'bg-zinc-900/95 border-emerald-500/40 text-zinc-100 dark:bg-zinc-900/95'
                : toast.type === 'error'
                ? 'bg-zinc-900/95 border-rose-500/40 text-zinc-100 dark:bg-zinc-900/95'
                : 'bg-zinc-900/95 border-cyan-500/40 text-zinc-100 dark:bg-zinc-900/95'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-cyan-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight text-white">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              id={`toast-close-${toast.id}`}
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-zinc-400 hover:text-white transition-colors p-1"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
