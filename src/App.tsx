import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Athlete Pages
import AthleteDashboard from "./pages/athlete/Dashboard";
import AthleteProfile from "./pages/athlete/Profile";
import AthleteChecklist from "./pages/athlete/Checklist";
import AthleteColleges from "./pages/athlete/Colleges";
import AthleteOffers from "./pages/athlete/Offers";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminAuth from "./pages/admin/Auth";
import PlayersList from "./pages/admin/PlayersList";
import PlayerDetail from "./pages/admin/PlayerDetail";
import ArchivedPlayers from "./pages/admin/ArchivedPlayers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin/auth" element={<AdminAuth />} />

            {/* Athlete Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="athlete">
                  <AthleteDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/profile"
              element={
                <ProtectedRoute requiredRole="athlete">
                  <AthleteProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/checklist"
              element={
                <ProtectedRoute requiredRole="athlete">
                  <AthleteChecklist />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/colleges"
              element={
                <ProtectedRoute requiredRole="athlete">
                  <AthleteColleges />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/offers"
              element={
                <ProtectedRoute requiredRole="athlete">
                  <AthleteOffers />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/players"
              element={
                <ProtectedRoute requiredRole="admin">
                  <PlayersList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/players/:id"
              element={
                <ProtectedRoute requiredRole="admin">
                  <PlayerDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/archived"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ArchivedPlayers />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
