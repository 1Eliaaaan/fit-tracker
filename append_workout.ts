export async function fetchLastExercisePerformance(
  userId: string,
  exerciseId: string
) {
  const { data, error } = await supabase
    .from('session_exercises')
    .select(
      id,
      workout_sessions!inner ( started_at ),
      exercise_sets ( reps, weight_kg, rest_secs )
    )
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}
