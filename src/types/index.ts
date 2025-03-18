export interface User {
  id: string;
  email: string;
}

export interface Set {
  id?: string;
  reps: number;
  weight: number;
}

export interface Exercise {
  id: string;
  user_id: string;
  name: string;
  sets: Set[];
  date: string;
  created_at: string;
}

export interface BodyWeight {
  id: string;
  user_id: string;
  weight: number;
  date: string;
  created_at: string;
}

export interface WorkoutDay {
  date: string;
  exercises: Exercise[];
  bodyWeight?: BodyWeight;
}

export const PRESET_EXERCISES = [
  "Press Inclinado con Mancuernas",
  "Press plano en maquina",
  "Peck deck",
  "Elevaciones laterales en polea",
  "Elevaciones Laterales sentado con mancuerna",
  "Pajaros con mancuerna",
  "Press Frances",
  "Extension de Triceps en Polea Alta",
  "Dominadas",
  "Remo en polea",
  "Jalon al Pecho",
  "Pull Over en Polea",
  "Press Inclinado en maquina",
  "Press plano con mancuerna",
  "Cruces en polea",
  "Elevaciones laterales con mancuerna",
  "Extension de Triceps en Polea Baja",
  "Extension de Triceps en Polea Alta unilateral",
  "Sentadilla",
  "Sentadilla Hack en Maquina",
  "Bulgaras",
  "Extension de Cuadriceps",
  "Curl Femoral",
  "Aduptores",
  "Pantorrilla",
  "Abdominales con rueda",
  "Plancha Abdominal",
  "Encogimiento Abdominal",
]; 