import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-8">
            FitTrack
          </h1>
          <p className="text-xl text-white mb-12">
            Track your fitness journey, monitor your progress, and achieve your goals
          </p>
          <div className="space-x-4">
            <Link
              to="/login"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 