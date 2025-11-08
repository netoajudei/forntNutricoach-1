
export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  age: number;
  height: number;
  initialWeight: number;
  goalWeight: number;
  objective: string;
}

export interface Meal {
  id: string;
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  items: { name: string; quantity: string }[];
}

export interface DailyDietSummary {
  calories: { consumed: number; goal: number };
  protein: { consumed: number; goal: number };
  carbs: { consumed: number; goal: number };
  fats: { consumed: number; goal: number };
}

export interface WeeklyDietDay {
  day: string;
  meals: Meal[];
}

export interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  observation?: string;
}

export interface TodaysWorkout {
  isRestDay: boolean;
  name?: string;
  focus?: string;
  exercises?: Exercise[];
}

export interface WeeklyWorkoutDay {
  day: string;
  name: string;
  focus: string;
}

export interface WeightHistoryEntry {
  date: string;
  weight: number;
}

export interface ProgressSummary {
  weight: { current: number; change: number };
  training: { completed: number; total: number };
  diet: { adherence: number };
  goal: { progress: number };
}

export interface WorkoutAnalytics {
  frequency: { month: string; value: number }[];
  loads: { exercise: string; value: number }[];
  volume: { month: string; value: number }[];
}
