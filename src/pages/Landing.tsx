import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChartBarIcon, ScaleIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

export default function Landing() {
  const features = [
    {
      name: 'Track Your Progress',
      description: 'Monitor your workouts and see your improvement over time with detailed charts and analytics.',
      icon: ChartBarIcon,
    },
    {
      name: 'Weight Management',
      description: 'Keep track of your body weight and use our built-in weight converter for easy calculations.',
      icon: ScaleIcon,
    },
    {
      name: 'Exercise Library',
      description: 'Access a comprehensive list of exercises and track your performance for each one.',
      icon: ClipboardDocumentCheckIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Fit<span className="text-green-600 dark:text-green-400">Track</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            Your personal fitness companion. Track your workouts, monitor progress, and achieve your fitness goals with our comprehensive tracking tools.
          </p>

          <div className="flex justify-center space-x-4 mb-16">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/login"
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Get Started
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/register"
                className="bg-white text-green-600 border-2 border-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors shadow-lg hover:shadow-xl"
              >
                Create Account
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {features.map((feature) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col items-center text-center">
                  <feature.icon className="h-12 w-12 text-green-600 dark:text-green-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 