import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { SunIcon, MoonIcon, ExclamationCircleIcon, ChartBarIcon, ClipboardIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import type { Exercise, WorkoutDay, Set } from '../types';
import { PRESET_EXERCISES } from '../types';
import CalendarSection from '../components/Dashboard/CalendarSection';
import ExerciseList from '../components/Dashboard/ExerciseList';
import ExerciseForm from '../components/Dashboard/ExerciseForm';
import BodyWeightForm from '../components/Dashboard/BodyWeightForm';
import WeightConverter from '../components/Dashboard/WeightConverter';
import ProgressSection from '../components/Dashboard/ProgressSection';

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

  const handleSetChange = (index: number, field: 'reps' | 'weight', value: string) => {
    const newSets = [...exerciseSets];
    if (field === 'reps') {
      newSets[index][field] = Math.floor(Number(value));
    } else {
      newSets[index][field] = value === '' ? 0 : parseFloat(value);
    }
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

  // Animaciones fade simples
  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.15 } },
    exit: { opacity: 0, transition: { duration: 0.15 } }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
      {/* Modern Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-lg backdrop-blur-lg bg-opacity-90 dark:bg-opacity-90 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <motion.h4 
                className="text-2xl font-bold text-gray-900 dark:text-white"
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
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-red-700 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
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
                  className="w-full p-2 text-center text-red-700 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg"
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
        <div className="md:hidden mb-6 sticky top-16 z-40 bg-white dark:bg-gray-800 py-2">
          <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
            <button
              onClick={() => setActiveTab('workout')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'workout'
                ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-lg'
                : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <ClipboardIcon className="h-5 w-5" />
                <span>Workout</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === 'progress'
                ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-lg'
                : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <ChartBarIcon className="h-5 w-5" />
                <span>Progress</span>
              </div>
            </button>
          </div>
        </div>

        {/* Desktop Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            {/* Calendar Section */}
            <CalendarSection selectedDate={selectedDate} setSelectedDate={setSelectedDate} darkMode={darkMode} />
            {/* Exercise List */}
            <ExerciseList
              exercises={exercises}
              loading={loading}
              handleEditExercise={handleEditExercise}
              handleDeleteExercise={handleDeleteExercise}
              selectedDate={selectedDate}
            />
          </motion.div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Exercise Form */}
            <ExerciseForm
              isCustomExercise={isCustomExercise}
              setIsCustomExercise={setIsCustomExercise}
              exerciseSets={exerciseSets}
              handleAddSet={handleAddSet}
              handleRemoveSet={handleRemoveSet}
              handleSetChange={handleSetChange}
              handleAddExercise={handleAddExercise}
              handleUpdateExercise={handleUpdateExercise}
              handleCancelEdit={handleCancelEdit}
              isSubmitting={isSubmitting}
              editingExercise={editingExercise}
              PRESET_EXERCISES={PRESET_EXERCISES}
            />
            {/* Body Weight Form */}
            <BodyWeightForm
              bodyWeight={bodyWeight}
              handleUpdateBodyWeight={handleUpdateBodyWeight}
              isSubmitting={isSubmitting}
            />
            {/* Weight Converter */}
            <WeightConverter />
            {/* Progress Section */}
            <ProgressSection
              workoutHistory={workoutHistory}
              darkMode={darkMode}
            />
          </div>
        </div>
      </main>
    </div>
  );
}