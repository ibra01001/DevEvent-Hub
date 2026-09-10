import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { EventsPage } from './pages/EventsPage.tsx';
import { EventDetailsPage } from './pages/EventDetailsPage.tsx';
import { SubmitEventPage } from './pages/SubmitEventPage.tsx';
import { OrganizerPage } from './pages/OrganizerPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { StaffDashboardPage } from './pages/StaffDashboardPage.tsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-200 selection:bg-violet-500/20 selection:text-violet-600">
              {/* Sticky Glassmorphism Navbar */}
              <Navbar />

              {/* Main Application Body */}
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/events/:id" element={<EventDetailsPage />} />
                  <Route
                    path="/events/submit"
                    element={
                      <ProtectedRoute requiredRole="staff">
                        <SubmitEventPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/organizer" element={<OrganizerPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route
                    path="/staff"
                    element={
                      <ProtectedRoute requiredRole="staff">
                        <StaffDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>

              {/* Platform Footer */}
              <Footer />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
