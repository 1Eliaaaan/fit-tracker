import type { SessionWithDetails, UserProfile, SessionMetrics } from '../types';

const OPENAI_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

interface GenerateSummaryInput {
  session: SessionWithDetails;
  profile: UserProfile | null;
  previousBests: Record<string, { reps: number; weight_kg: number } | null>;
  anonKey: string;
  accessToken: string;
}

interface GenerateSummaryResponse {
  summary_text: string;
  metrics: SessionMetrics;
  embedding: number[];
}

export async function generateWorkoutSummary(
  input: GenerateSummaryInput
): Promise<GenerateSummaryResponse> {
  const { session, profile, previousBests, anonKey, accessToken } = input;

  const res = await fetch(`${OPENAI_BASE_URL}/generate-workout-summary`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      apikey: anonKey,
    },
    body: JSON.stringify({ session, profile, previousBests }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI summary failed: ${err}`);
  }

  return res.json();
}
