

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
  description: string;
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
  load?: string;
  observation?: string;
}

export interface WeeklyWorkoutDay {
  day: string;
  name: string;
  focus: string;
  isRestDay: boolean;
  isCompleted: boolean;
  exercises?: Exercise[];
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

export interface WeeklyMacroSummary {
  day: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface MonthlyMacroSummary {
  week: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface AnnualMacroSummary {
  month: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface DietMetricsSummary {
    averageAdherence: number;
    daysOnPlan: number;
}

export interface BodyMetricsHistoryEntry {
  date: string;
  weight: number;
  fatPercentage: number;
  neck: number;
  chest: number;
  waist: number;
  hips: number;
  rightArm: number;
  leftArm: number;
  rightThigh: number;
  leftThigh: number;
}

export interface BodyMetricsSummary {
  currentWeight: number;
  fatPercentage: number;
  totalWeightChange: number;
}

export interface WorkoutMetricsSummary {
    workoutsThisMonth: number;
    totalWorkoutsInMonth: number;
    adherence: number;
}

export interface ExerciseLoadHistory {
    workoutType: string;
    exercises: {
        name: string;
        history: {
            date: string;
            load: number;
        }[];
    }[];
}

export interface WeeklyCompletionHistory {
    week: string;
    days: {
        day: string;
        completed: boolean;
    }[];
}


// --- Onboarding Data Structure ---

export interface MedidasCorporais {
  data: string;
  peso: string;
  altura: string;
  pescoco: string;
  peito: string;
  cintura: string;
  quadril: string;
  bracoDireito: string;
  bracoEsquerdo: string;
  coxaDireita: string;
  coxaEsquerda: string;
  panturrilhaDireita: string;
  panturrilhaEsquerda: string;
  gordura?: string;
  notas?: string;
}

export interface OnboardingData {
  dadosBasicos: {
    nomeCompleto: string;
    dataNascimento: string;
    sexo: string;
  };
  saude: {
    condicoesMedicas: string;
    medicacoes: string;
    alergias: string;
  };
  lesoes: {
    lesoesLimitacoes: string;
  };
  rotina: {
    profissao: string;
    horarioAcordar: string;
    horarioDormir: string;
  };
  preferenciasAlimentares: {
    restricoes: string[];
    alimentosNaoGosta: string;
    alimentosFavoritos: string;
    disposicaoCozinhar: string;
    orcamento: string;
  };
  preferenciasTreino: {
    local: string;
    equipamentos: string[];
    experiencia: string;
    diasPreferenciais: string[];
    horariosPreferenciais: string[];
  };
  objetivo: {
    meta: string;
    prazo: string;
    motivacao: string;
  };
  medidasCorporais: MedidasCorporais;
}