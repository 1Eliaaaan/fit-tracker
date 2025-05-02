import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Bar } from 'recharts';
import { motion } from 'framer-motion';
import type { WorkoutDay } from '../../types';

const chartColors = ['#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'];

function formatChartData(workoutHistory: WorkoutDay[]) {
  const weightData = workoutHistory
    .filter((day) => day.bodyWeight)
    .map((day) => ({
      date: new Date(day.date).toLocaleDateString(),
      weight: day.bodyWeight?.weight,
    }));

  const volumeData = workoutHistory.map((day) => ({
    date: new Date(day.date).toLocaleDateString(),
    totalVolume: day.exercises.reduce(
      (sum, ex) => sum + ex.sets.reduce((sum, set) => sum + set.reps * set.weight, 0),
      0
    ),
    exercises: day.exercises.length,
  }));

  const exerciseFrequency = (() => {
    const counts = new Map();
    workoutHistory.forEach(day => {
      day.exercises.forEach(exercise => {
        counts.set(
          exercise.name,
          (counts.get(exercise.name) || 0) + 1
        );
      });
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({
        name,
        value,
      }));
  })();

  return { weightData, volumeData, exerciseFrequency };
}

interface ProgressSectionProps {
  workoutHistory: WorkoutDay[];
  darkMode: boolean;
}

export default function ProgressSection({ workoutHistory, darkMode }: ProgressSectionProps) {
  const { weightData, volumeData, exerciseFrequency } = formatChartData(workoutHistory);

  return (
    <div className="space-y-8">
      {/* Body Weight Progress Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 p-6"
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 flex items-center">
          <span className="inline-block w-3 h-3 rounded-full bg-green-400 mr-2"></span>
          Body Weight Progress
        </h3>
        <div className="h-[200px] sm:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weightData} margin={{ top: 5, right: 5, left: 5, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis
                dataKey="date"
                stroke={darkMode ? '#9CA3AF' : '#4B5563'}
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke={darkMode ? '#9CA3AF' : '#4B5563'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                  border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                  borderRadius: '0.5rem',
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
      {/* Volume Progress Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 p-6"
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 flex items-center">
          <span className="inline-block w-3 h-3 rounded-full bg-blue-400 mr-2"></span>
          Training Volume Progress
        </h3>
        <div className="h-[200px] sm:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={volumeData} margin={{ top: 5, right: 5, left: 5, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis
                dataKey="date"
                stroke={darkMode ? '#9CA3AF' : '#4B5563'}
                angle={-45}
                textAnchor="end"
                height={60}
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke={darkMode ? '#9CA3AF' : '#4B5563'} />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                  border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                  borderRadius: '0.5rem',
                }}
              />
              <Legend />
              <Bar dataKey="exercises" fill="#3B82F6" name="Number of Exercises" />
              <Line
                type="monotone"
                dataKey="totalVolume"
                stroke="#10B981"
                name="Total Volume"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
      {/* Exercise Frequency Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 p-6"
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 flex items-center">
          <span className="inline-block w-3 h-3 rounded-full bg-purple-400 mr-2"></span>
          Most Frequent Exercises
        </h3>
        <div className="h-[200px] sm:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={exerciseFrequency}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {exerciseFrequency.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                  border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                  borderRadius: '0.5rem',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
} 