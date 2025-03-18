import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, PieChart, Pie, Cell, ComposedChart, Bar } from 'recharts';
import { supabase } from '../lib/supabase';
import { SunIcon, MoonIcon, PlusIcon, TrashIcon, ExclamationCircleIcon, PencilIcon, ChartBarIcon, CalendarIcon, ClipboardIcon, ArrowTrendingUpIcon, Bars3Icon, XMarkIcon, CalculatorIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import type { Exercise, BodyWeight, WorkoutDay, Set } from '../types';
import { PRESET_EXERCISES } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [bodyWeight, setBodyWeight] = useState<number | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [isCustomExercise, setIsCustomExercise] = useState(false);
  const [exerciseSets, setExerciseSets] = useState<Set[]>([{ reps: 0, weight: 0 }]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'workout' | 'progress'>('workout');
  const [showExerciseForm, setShowExerciseForm] = useState(false);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    checkAuth();
    fetchWorkoutData();
  }, [selectedDate]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
    }
  };

  const fetchWorkoutData = async () => {
    setError(null);
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("No session found. Please log in again.");
        return;
      }

      const dateStr = selectedDate.toISOString().split('T')[0];

      // Fetch exercises for selected date
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('date', dateStr);

      if (exercisesError) throw exercisesError;
      setExercises(exercisesData || []);

      // Fetch body weight for selected date
      const { data: weightData, error: weightError } = await supabase
        .from('body_weights')
        .select('weight')
        .eq('user_id', session.user.id)
        .eq('date', dateStr)
        .single();

      if (weightError && weightError.code !== 'PGRST116') throw weightError;
      setBodyWeight(weightData?.weight || null);

      // Fetch workout history for charts
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: historyData, error: historyError } = await supabase
        .from('exercises')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (historyError) throw historyError;

      const { data: weightHistory, error: weightHistoryError } = await supabase
        .from('body_weights')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (weightHistoryError) throw weightHistoryError;

      // Organize data by date
      const historyMap = new Map<string, WorkoutDay>();
      
      historyData?.forEach((exercise) => {
        if (!historyMap.has(exercise.date)) {
          historyMap.set(exercise.date, { date: exercise.date, exercises: [] });
        }
        historyMap.get(exercise.date)?.exercises.push(exercise);
      });

      weightHistory?.forEach((weight) => {
        if (!historyMap.has(weight.date)) {
          historyMap.set(weight.date, { date: weight.date, exercises: [] });
        }
        if (historyMap.get(weight.date)) {
          historyMap.get(weight.date)!.bodyWeight = weight;
        }
      });

      setWorkoutHistory(Array.from(historyMap.values()));
    } catch (error) {
      console.error('Error fetching workout data:', error);
      setError('Failed to load workout data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSet = () => {
    setExerciseSets([...exerciseSets, { reps: 0, weight: 0 }]);
  };

  const handleRemoveSet = (index: number) => {
    setExerciseSets(exerciseSets.filter((_, i) => i !== index));
  };

  const handleSetChange = (index: number, field: 'reps' | 'weight', value: number) => {
    const newSets = [...exerciseSets];
    newSets[index][field] = field === 'reps' ? Math.floor(value) : parseFloat(value.toFixed(2));
    setExerciseSets(newSets);
  };

  const handleAddExercise = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("No session found. Please log in again.");
        return;
      }

      // Validate sets
      if (exerciseSets.some(set => set.reps <= 0 || set.weight <= 0)) {
        setError("Please enter valid values for reps and weight (greater than 0).");
        return;
      }

      const newExercise = {
        user_id: session.user.id,
        name: formData.get('name') as string,
        sets: exerciseSets,
        date: selectedDate.toISOString().split('T')[0],
      };

      const { error: insertError } = await supabase.from('exercises').insert(newExercise);
      if (insertError) throw insertError;

      form.reset();
      setExerciseSets([{ reps: 0, weight: 0 }]);
      fetchWorkoutData();
    } catch (error: any) {
      console.error('Error adding exercise:', error);
      setError(error.message || 'Failed to add exercise. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBodyWeight = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("No session found. Please log in again.");
        return;
      }

      const weight = parseFloat(formData.get('weight') as string);
      if (weight <= 0) {
        setError("Please enter a valid weight greater than 0.");
        return;
      }

      const date = selectedDate.toISOString().split('T')[0];

      const { error: upsertError } = await supabase
        .from('body_weights')
        .upsert({
          user_id: session.user.id,
          weight,
          date,
        });

      if (upsertError) throw upsertError;

      form.reset();
      fetchWorkoutData();
    } catch (error: any) {
      console.error('Error updating body weight:', error);
      setError(error.message || 'Failed to update body weight. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setIsCustomExercise(!PRESET_EXERCISES.includes(exercise.name));
    setExerciseSets(exercise.sets);
  };

  const handleCancelEdit = () => {
    setEditingExercise(null);
    setIsCustomExercise(false);
    setExerciseSets([{ reps: 0, weight: 0 }]);
    setError(null);
  };

  const handleUpdateExercise = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingExercise) return;
    
    setError(null);
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("No session found. Please log in again.");
        return;
      }

      // Validate sets
      if (exerciseSets.some(set => set.reps <= 0 || set.weight <= 0)) {
        setError("Please enter valid values for reps and weight (greater than 0).");
        return;
      }

      const updatedExercise = {
        name: formData.get('name') as string,
        sets: exerciseSets,
      };

      const { error: updateError } = await supabase
        .from('exercises')
        .update(updatedExercise)
        .eq('id', editingExercise.id)
        .eq('user_id', session.user.id);

      if (updateError) throw updateError;

      handleCancelEdit();
      fetchWorkoutData();
    } catch (error: any) {
      console.error('Error updating exercise:', error);
      setError(error.message || 'Failed to update exercise. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (!window.confirm('Are you sure you want to delete this exercise?')) return;

    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("No session found. Please log in again.");
        return;
      }

      const { error: deleteError } = await supabase
        .from('exercises')
        .delete()
        .eq('id', exerciseId)
        .eq('user_id', session.user.id);

      if (deleteError) throw deleteError;

      fetchWorkoutData();
    } catch (error: any) {
      console.error('Error deleting exercise:', error);
      setError(error.message || 'Failed to delete exercise. Please try again.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  const slideVariants = {
    hidden: { x: '100%' },
    visible: { 
      x: 0,
      transition: { type: "spring", damping: 25, stiffness: 500 }
    },
    exit: { 
      x: '100%',
      transition: { type: "spring", damping: 25, stiffness: 500 }
    }
  };

  // Add this new function to format the chart data
  const formatChartData = (workoutHistory: WorkoutDay[]) => {
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
  };

  // Add this new function to format exercise-specific data
  const formatExerciseSpecificData = (workoutHistory: WorkoutDay[], exerciseName: string) => {
    return workoutHistory
      .filter(day => day.exercises.some(ex => ex.name === exerciseName))
      .map(day => {
        const exercise = day.exercises.find(ex => ex.name === exerciseName)!;
        return {
          date: new Date(day.date).toLocaleDateString(),
          maxWeight: Math.max(...exercise.sets.map(set => set.weight)),
          totalVolume: exercise.sets.reduce((sum, set) => sum + set.reps * set.weight, 0),
          totalReps: exercise.sets.reduce((sum, set) => sum + set.reps, 0),
          sets: exercise.sets.length
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Add this new component for exercise-specific progress
  const ExerciseSpecificProgress = ({ 
    workoutHistory, 
    darkMode 
  }: { 
    workoutHistory: WorkoutDay[], 
    darkMode: boolean 
  }) => {
    const [selectedExercise, setSelectedExercise] = useState<string>('');
    const exerciseNames = Array.from(new Set(
      workoutHistory.flatMap(day => day.exercises.map(ex => ex.name))
    )).sort();

    const exerciseData = selectedExercise ? formatExerciseSpecificData(workoutHistory, selectedExercise) : [];

    return (
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0 }
        }}
        initial="hidden"
        animate="visible"
        className="rounded-xl bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-700 dark:to-gray-600 p-6"
      >
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="inline-block w-3 h-3 rounded-full bg-blue-400 mr-2"></span>
          Exercise Specific Progress
        </h3>

        <div className="mb-6">
          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
          >
            <option value="">Select an exercise to track</option>
            {exerciseNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {selectedExercise && exerciseData.length > 0 ? (
          <div className="space-y-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={exerciseData} margin={{ top: 5, right: 5, left: 5, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                  <XAxis
                    dataKey="date"
                    stroke={darkMode ? '#9CA3AF' : '#4B5563'}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke={darkMode ? '#9CA3AF' : '#4B5563'}
                    label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke={darkMode ? '#9CA3AF' : '#4B5563'}
                    label={{ value: 'Total Reps', angle: 90, position: 'insideRight' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                      border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                      borderRadius: '0.5rem',
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="maxWeight"
                    stroke="#10B981"
                    name="Max Weight"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="totalReps"
                    fill="#3B82F6"
                    name="Total Reps"
                    opacity={0.8}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Latest Performance</h4>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {exerciseData[exerciseData.length - 1].maxWeight.toFixed(2)} kg
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {exerciseData[exerciseData.length - 1].totalReps} total reps
                </p>
              </div>
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Best Performance</h4>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {Math.max(...exerciseData.map(d => d.maxWeight)).toFixed(2)} kg
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Max weight achieved
                </p>
              </div>
            </div>
          </div>
        ) : selectedExercise ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No history available for this exercise.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Start tracking this exercise to see your progress.
            </p>
          </div>
        ) : null}
      </motion.div>
    );
  };

  // Update the ProgressSection component to include the new ExerciseSpecificProgress
  const ProgressSection = ({ workoutHistory, darkMode }: { workoutHistory: WorkoutDay[], darkMode: boolean }) => {
    const { weightData, volumeData, exerciseFrequency } = formatChartData(workoutHistory);
    const chartColors = ['#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'];

    return (
      <div className="space-y-8">
        {/* Exercise Specific Progress */}
        <ExerciseSpecificProgress workoutHistory={workoutHistory} darkMode={darkMode} />

        {/* Body Weight Progress Card */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          initial="hidden"
          animate="visible"
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
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          initial="hidden"
          animate="visible"
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
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          initial="hidden"
          animate="visible"
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
                  {exerciseFrequency.map((entry, index) => (
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
  };

  // Add this new component for weight conversion
  const WeightConverter = () => {
    const [pounds, setPounds] = useState<string>('');
    const [kilograms, setKilograms] = useState<string>('');

    const handlePoundsChange = (value: string) => {
      setPounds(value);
      if (value === '') {
        setKilograms('');
        return;
      }
      const lbs = parseFloat(value);
      if (!isNaN(lbs)) {
        setKilograms((lbs * 0.45359237).toFixed(2));
      }
    };

    const handleKilogramsChange = (value: string) => {
      setKilograms(value);
      if (value === '') {
        setPounds('');
        return;
      }
      const kg = parseFloat(value);
      if (!isNaN(kg)) {
        setPounds((kg / 0.45359237).toFixed(2));
      }
    };

    return (
      <motion.div
        variants={slideVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 transition-all duration-200 hover:shadow-xl"
      >
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center mb-6">
          <CalculatorIcon className="h-6 w-6 mr-2 text-green-500" />
          Weight Converter
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pounds" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pounds (lbs)
            </label>
            <input
              type="number"
              id="pounds"
              value={pounds}
              onChange={(e) => handlePoundsChange(e.target.value)}
              placeholder="Enter weight in pounds"
              step="0.1"
              min="0"
              className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
            />
          </div>
          <div>
            <label htmlFor="kilograms" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Kilograms (kg)
            </label>
            <input
              type="number"
              id="kilograms"
              value={kilograms}
              onChange={(e) => handleKilogramsChange(e.target.value)}
              placeholder="Enter weight in kilograms"
              step="0.1"
              min="0"
              className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
            />
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
          Conversion rate: 1 lb = 0.45359237 kg
        </p>
      </motion.div>
    );
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
      {/* Modern Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-lg backdrop-blur-lg bg-opacity-90 dark:bg-opacity-90 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <motion.h4 
                className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                FitTrack
              </motion.h4>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <SunIcon className="h-5 w-5 text-yellow-500" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-gray-600" />
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Logout
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-gray-800 shadow-lg"
            >
              <div className="px-4 py-3 space-y-3">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="w-full flex items-center justify-center p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
                >
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full p-2 text-center text-white bg-gradient-to-r from-green-500 to-blue-500 rounded-lg"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-lg p-4"
            >
              <div className="flex items-center">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400 dark:text-red-300 mr-2" />
                <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden mb-6">
          <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
            <button
              onClick={() => setActiveTab('workout')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'workout'
                ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-lg'
                : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Workout
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'progress'
                ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-lg'
                : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Progress
            </button>
          </div>
        </div>

        {/* Desktop Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Calendar and Exercise List Section */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 transition-all duration-200 hover:shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <CalendarIcon className="h-6 w-6 mr-2 text-green-500" />
                  Workout Calendar
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowExerciseForm(true)}
                  className="md:hidden px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg shadow-lg"
                >
                  Add Exercise
                </motion.button>
              </div>
              
              <Calendar
                onChange={(value) => value instanceof Date && setSelectedDate(value)}
                value={selectedDate}
                className={`w-full rounded-lg shadow-md ${darkMode ? 'dark-calendar' : ''}`}
              />
            </motion.div>

            {/* Exercise List with Animations */}
            <AnimatePresence>
              {(showExerciseForm || window.innerWidth >= 768) && (
                <motion.div
                  variants={itemVariants}
                  className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 transition-all duration-200 hover:shadow-xl"
                >
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center mb-6">
                    <ClipboardIcon className="h-6 w-6 mr-2 text-green-500" />
                    Exercises for {selectedDate.toLocaleDateString()}
                  </h2>
                  
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                    </div>
                  ) : exercises.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8"
                    >
                      <p className="text-gray-500 dark:text-gray-400">No exercises recorded for this date.</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Add your first exercise using the form.</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-4"
                    >
                      {exercises.map((exercise) => (
                        <motion.div
                          key={exercise.id}
                          variants={itemVariants}
                          layout
                          className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 group"
                        >
                          <div className="flex justify-between items-start">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-green-500 transition-colors duration-200">
                              {exercise.name}
                            </h3>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleEditExercise(exercise)}
                                className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                title="Edit exercise"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeleteExercise(exercise.id)}
                                className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                title="Delete exercise"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </motion.button>
                            </div>
                          </div>
                          <div className="mt-2 space-y-2">
                            {exercise.sets.map((set, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2"
                              >
                                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 dark:bg-green-800 text-green-500 dark:text-green-300 text-xs font-medium">
                                  {index + 1}
                                </span>
                                <span>{set.reps} reps @ {set.weight.toFixed(2)}kg</span>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Exercise Form */}
            <AnimatePresence>
              {(showExerciseForm || window.innerWidth >= 768) && (
                <motion.div
                  variants={slideVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 transition-all duration-200 hover:shadow-xl"
                >
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center mb-6">
                    <ClipboardIcon className="h-6 w-6 mr-2 text-green-500" />
                    Add Exercise for {selectedDate.toLocaleDateString()}
                  </h2>
                  <form onSubmit={editingExercise ? handleUpdateExercise : handleAddExercise} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Exercise Name
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        {isCustomExercise ? (
                          <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            placeholder="e.g. Cable Tricep Pushdown"
                            className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
                          />
                        ) : (
                          <select
                            name="name"
                            id="name"
                            required
                            className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
                          >
                            <option value="">Select an exercise</option>
                            {PRESET_EXERCISES.map((exercise) => (
                              <option key={exercise} value={exercise}>
                                {exercise}
                              </option>
                            ))}
                          </select>
                        )}
                        <button
                          type="button"
                          onClick={() => setIsCustomExercise(!isCustomExercise)}
                          className="px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                        >
                          {isCustomExercise ? "Use preset" : "Custom"}
                        </button>
                      </div>
                    </div>

                    {/* Sets Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Sets</h4>
                        <button
                          type="button"
                          onClick={handleAddSet}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Add Set
                        </button>
                      </div>
                      
                      {exerciseSets.map((set, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            <span className="text-sm text-gray-500 dark:text-gray-400">#{index + 1}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 flex-grow">
                            <div>
                              <label htmlFor={`reps-${index}`} className="sr-only">
                                Reps
                              </label>
                              <input
                                type="number"
                                id={`reps-${index}`}
                                value={set.reps}
                                onChange={(e) => handleSetChange(index, 'reps', parseInt(e.target.value))}
                                min="0"
                                placeholder="Number of repetitions"
                                className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
                              />
                            </div>
                            <div>
                              <label htmlFor={`weight-${index}`} className="sr-only">
                                Weight (kg)
                              </label>
                              <input
                                type="number"
                                id={`weight-${index}`}
                                value={set.weight}
                                onChange={(e) => handleSetChange(index, 'weight', parseFloat(e.target.value))}
                                step="0.25"
                                min="0"
                                placeholder="Weight in kilograms"
                                className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
                              />
                            </div>
                          </div>
                          {exerciseSets.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSet(index)}
                              className="flex-shrink-0 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Saving...' : editingExercise ? 'Update Exercise' : 'Add Exercise'}
                      </button>
                      {editingExercise && (
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Body Weight Form */}
            <AnimatePresence>
              {(showExerciseForm || window.innerWidth >= 768) && (
                <motion.div
                  variants={slideVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 transition-all duration-200 hover:shadow-xl"
                >
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center mb-6">
                    <ChartBarIcon className="h-6 w-6 mr-2 text-green-500" />
                    Track Body Weight
                  </h2>
                  <form onSubmit={handleUpdateBodyWeight} className="space-y-4">
                    <div>
                      <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Body Weight (kg)
                      </label>
                      <div className="mt-1">
                        <input
                          type="number"
                          name="weight"
                          id="weight"
                          step="0.25"
                          min="0"
                          required
                          defaultValue={bodyWeight || ''}
                          placeholder="Enter your current weight in kg"
                          className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Saving...' : 'Update Body Weight'}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Weight Converter */}
            <AnimatePresence>
              {(showExerciseForm || window.innerWidth >= 768) && (
                <WeightConverter />
              )}
            </AnimatePresence>

            {/* Progress Charts */}
            <AnimatePresence>
              {(activeTab === 'progress' || window.innerWidth >= 768) && (
                <motion.div
                  variants={slideVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 transition-all duration-200 hover:shadow-xl"
                >
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center mb-6">
                    <ArrowTrendingUpIcon className="h-6 w-6 mr-2 text-green-500" />
                    Progress Tracking
                  </h2>
                  
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                    </div>
                  ) : workoutHistory.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8"
                    >
                      <p className="text-gray-500 dark:text-gray-400">No workout history available.</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                        Start tracking your workouts to see progress.
                      </p>
                    </motion.div>
                  ) : (
                    <ProgressSection workoutHistory={workoutHistory} darkMode={darkMode} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}