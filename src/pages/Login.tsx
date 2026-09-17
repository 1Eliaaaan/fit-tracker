import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthProvider';

export default function Login() {
  const { user, loading: authLoading } = useAuth();
  
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!authLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) navigate('/dashboard');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-iron-950 font-body flex flex-col justify-center py-12 px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-lime-400/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative sm:mx-auto sm:w-full sm:max-w-md"
      >
        <Link to="/" className="block text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-iron-50">
            Fit<span className="text-lime-400">Track</span>
          </h1>
        </Link>
        <h2 className="text-center text-xl font-display font-semibold text-iron-200 mb-1">
          Bienvenido de vuelta
        </h2>
        <p className="text-center text-iron-500 text-sm">
          Inicia sesión para continuar
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-iron-900 border border-iron-800 rounded-2xl p-6 sm:p-8">
          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20"
              >
                <ExclamationCircleIcon className="h-4 w-4 text-red-400 flex-shrink-0" />
                <span className="text-sm text-red-300">{error}</span>
              </motion.div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-iron-400 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-iron-800 border border-iron-700 rounded-xl py-2.5 px-4 text-sm text-iron-100 placeholder-iron-500 focus:outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/20 transition-all"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-iron-400 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-iron-800 border border-iron-700 rounded-xl py-2.5 px-4 text-sm text-iron-100 placeholder-iron-500 focus:outline-none focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/20 transition-all"
                placeholder="••••••••"
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-iron-950 font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-lime-400/10"
            >
              {loading ? 'Entrando...' : 'Iniciar Sesión'}
            </motion.button>
          </form>

          <div className="mt-5 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-iron-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-iron-900 px-3 text-iron-500 uppercase tracking-widest">O continuar con</span>
            </div>
          </div>

          <div className="mt-5">
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={async () => {
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: `${window.location.origin}/dashboard`
                  }
                });
                if (error) setError(error.message);
              }}
              className="w-full flex justify-center items-center gap-2 py-2.5 rounded-xl bg-iron-800 hover:bg-iron-700 border border-iron-700 text-iron-100 font-medium text-sm transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </motion.button>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/register"
              className="text-sm text-lime-400 hover:text-lime-300 font-medium transition-colors"
            >
              ¿No tienes cuenta? Regístrate
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}