import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthProvider from './contexts/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WorkoutActivePage from './pages/WorkoutActivePage';
import WorkoutSummaryPage from './pages/WorkoutSummaryPage';
import HistoryPage from './pages/HistoryPage';
import StatsPage from './pages/StatsPage';
import ProfilePage from './pages/ProfilePage';
import FoodPage from './pages/FoodPage';
import SleepPage from './pages/SleepPage';


import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Workout flow (protected, full-screen, no AppLayout) */}
            <Route
              path="/workout/active"
              element={
                <ProtectedRoute>
                  <WorkoutActivePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workout/summary"
              element={
                <ProtectedRoute>
                  <WorkoutSummaryPage />
                </ProtectedRoute>
              }
            />

            {/* Dashboard (protected, with AppLayout) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="food" element={<FoodPage />} />
              <Route path="sleep" element={<SleepPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="stats" element={<StatsPage />} />
              <Route path="profile" element={<ProfilePage />} />

            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
