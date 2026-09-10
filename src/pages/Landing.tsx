import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChartBarIcon, ScaleIcon, ClipboardDocumentCheckIcon, BoltIcon } from '@heroicons/react/24/outline';

export default function Landing() {
  const features = [
    {
      name: 'Trackea tus Entrenos',
      description: 'Registra ejercicios, series y repeticiones en segundos con nuestro flujo rápido.',
      icon: BoltIcon,
      color: '#84f215',
    },
    {
      name: 'Mide tu Progreso',
      description: 'Visualiza tu volumen, peso corporal y ejercicios favoritos con gráficas detalladas.',
      icon: ChartBarIcon,
      color: '#22d3ee',
    },
    {
      name: 'Peso Corporal',
      description: 'Lleva un registro diario de tu peso y ve la tendencia en el tiempo.',
      icon: ScaleIcon,
      color: '#a78bfa',
    },
    {
      name: 'Librería de Ejercicios',
      description: '60+ ejercicios organizados por grupo muscular con descripción de técnica.',
      icon: ClipboardDocumentCheckIcon,
      color: '#fb923c',
    },
  ];

  return (
    <div className="min-h-screen bg-iron-950 font-body relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-lime-400/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-cyan-400/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-6 py-16 md:py-24">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-400/10 border border-lime-400/20 text-lime-400 text-xs font-semibold mb-8 tracking-wide"
          >
            🏋️ TU COMPAÑERO FITNESS
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight text-iron-50 leading-tight">
            Trackea tu
            <br />
            <span className="bg-gradient-to-r from-lime-400 via-lime-300 to-cyan-400 bg-clip-text text-transparent">
              progreso
            </span>{' '}
            fitness
          </h1>

          <p className="text-lg text-iron-400 mt-6 max-w-xl mx-auto leading-relaxed">
            Registra ejercicios, ve tus estadísticas y mejora cada día.
            Simple, rápido y diseñado para el gym.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3 mt-10">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-iron-950 font-bold text-sm transition-all shadow-xl shadow-lime-400/20"
              >
                Empezar Gratis →
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl border border-iron-700 hover:border-iron-600 text-iron-300 hover:text-iron-100 font-semibold text-sm transition-all"
              >
                Ya tengo cuenta
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
              className="bg-iron-900/60 border border-iron-800 rounded-2xl p-6 hover:border-iron-700 transition-all group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: feature.color + '15' }}
              >
                <feature.icon className="h-5 w-5" style={{ color: feature.color }} />
              </div>
              <h3 className="font-display font-semibold text-iron-100 mb-1.5">{feature.name}</h3>
              <p className="text-sm text-iron-500 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-20">
          <p className="text-xs text-iron-600">
            FitTrack — Hecho con 💪 para el gym
          </p>
        </div>
      </div>
    </div>
  );
}