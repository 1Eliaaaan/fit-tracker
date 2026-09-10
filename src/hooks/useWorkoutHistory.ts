import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthProvider';
import { fetchSessionHistory } from '../services/workout.service';

export function useWorkoutHistory(limit = 50) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['workout-history', user?.id, limit],
    queryFn: () => fetchSessionHistory(user!.id, limit),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const refetch = () => queryClient.invalidateQueries({ queryKey: ['workout-history', user?.id] });

  return {
    sessions: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch,
  };
}
