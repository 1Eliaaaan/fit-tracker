import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
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
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-cyan-400/5 rounded-full blur-[120px] pointer-events-none" />

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
          Crea tu cuenta
        </h2>
        <p className="text-center text-iron-500 text-sm">
          Empieza a trackear tu progreso hoy
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-iron-900 border border-iron-800 rounded-2xl p-6 sm:p-8">
          <form className="space-y-5" onSubmit={handleRegister}>
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
                placeholder="Mínimo 6 caracteres"
              />
              <p className="text-[10px] text-iron-600 mt-1.5">Debe tener al menos 6 caracteres</p>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-iron-950 font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-lime-400/10"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-lime-400 hover:text-lime-300 font-medium transition-colors"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}