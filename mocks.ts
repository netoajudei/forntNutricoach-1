
import type { UserProfile, DailyDietSummary, Meal, WeeklyDietDay, TodaysWorkout, WeeklyWorkoutDay, WeightHistoryEntry, ProgressSummary, WorkoutAnalytics } from './types';

export const mockUser: UserProfile = {
  name: "Alex Silva",
  email: "alex.silva@email.com",
  avatarUrl: "https://picsum.photos/seed/alex/200/200",
  age: 28,
  height: 175,
  initialWeight: 85,
  goalWeight: 78,
  objective: "Perda de gordura e ganho de massa muscular",
};

export const mockDailyDietSummary: DailyDietSummary = {
  calories: { consumed: 1800, goal: 2200 },
  protein: { consumed: 120, goal: 150 },
  carbs: { consumed: 200, goal: 250 },
  fats: { consumed: 50, goal: 70 },
};

export const mockDailyMeals: Meal[] = [
  { id: 'm1', name: "Café da Manhã", time: "08:00", calories: 450, protein: 30, carbs: 50, fats: 15, items: [{ name: "Ovos mexidos com aveia", quantity: "3 unidades + 40g" }, { name: "Banana", quantity: "1 unidade" }] },
  { id: 'm2', name: "Almoço", time: "13:00", calories: 700, protein: 50, carbs: 80, fats: 20, items: [{ name: "Frango grelhado", quantity: "150g" }, { name: "Arroz integral", quantity: "100g" }, { name: "Salada de folhas verdes", quantity: "À vontade" }] },
  { id: 'm3', name: "Lanche da Tarde", time: "16:30", calories: 350, protein: 25, carbs: 40, fats: 10, items: [{ name: "Iogurte grego com whey", quantity: "1 pote + 30g" }, { name: "Maçã", quantity: "1 unidade" }] },
  { id: 'm4', name: "Jantar", time: "20:00", calories: 600, protein: 45, carbs: 60, fats: 15, items: [{ name: "Salmão assado", quantity: "150g" }, { name: "Batata doce", quantity: "150g" }, { name: "Brócolis no vapor", quantity: "100g" }] },
];

export const mockWeeklyDietPlan: WeeklyDietDay[] = Array(7).fill(0).map((_, i) => ({
  day: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][i],
  meals: mockDailyMeals.map(m => ({ ...m, id: `${m.id}-day${i}` })),
}));

export const mockTodaysWorkout: TodaysWorkout = {
  isRestDay: false,
  name: "Treino A - Peito, Tríceps e Ombros",
  focus: "Força e Hipertrofia",
  exercises: [
    { name: "Supino Reto", sets: "4", reps: "8-12", rest: "60s" },
    { name: "Desenvolvimento com Halteres", sets: "4", reps: "10-12", rest: "60s" },
    { name: "Tríceps Pulley", sets: "3", reps: "12-15", rest: "45s", observation: "Focar na contração máxima." },
    { name: "Elevação Lateral", sets: "3", reps: "15", rest: "45s" },
  ],
};

export const mockWeeklyWorkoutProgram: WeeklyWorkoutDay[] = [
  { day: "Segunda", name: "Treino A", focus: "Peito, Tríceps, Ombros" },
  { day: "Terça", name: "Treino B", focus: "Costas, Bíceps, Abdômen" },
  { day: "Quarta", name: "Descanso", focus: "Recuperação Ativa" },
  { day: "Quinta", name: "Treino C", focus: "Pernas Completo" },
  { day: "Sexta", name: "Treino A", focus: "Peito, Tríceps, Ombros" },
  { day: "Sábado", name: "Treino B", focus: "Costas, Bíceps, Abdômen" },
  { day: "Domingo", name: "Descanso", focus: "Recuperação" },
];

export const mockWeightHistory: WeightHistoryEntry[] = [
  { date: "01/05", weight: 85.0 },
  { date: "08/05", weight: 84.5 },
  { date: "15/05", weight: 84.2 },
  { date: "22/05", weight: 83.5 },
  { date: "29/05", weight: 83.0 },
  { date: "05/06", weight: 82.8 },
  { date: "12/06", weight: 82.1 },
  { date: "19/06", weight: 81.5 },
];

export const mockProgressSummary: ProgressSummary = {
  weight: { current: 81.5, change: -3.5 },
  training: { completed: 18, total: 24 },
  diet: { adherence: 85 },
  goal: { progress: 50 },
};

export const mockWorkoutAnalytics: WorkoutAnalytics = {
  frequency: [
    { month: "Jan", value: 16 }, { month: "Fev", value: 18 }, { month: "Mar", value: 20 },
    { month: "Abr", value: 17 }, { month: "Mai", value: 21 }, { month: "Jun", value: 18 },
  ],
  loads: [
    { exercise: "Supino", value: 80 }, { exercise: "Agach.", value: 100 }, { exercise: "Lev. Terra", value: 120 },
    { exercise: "Remada", value: 70 }, { exercise: "Desenvolv.", value: 50 },
  ],
  volume: [
    { month: "Jan", value: 32000 }, { month: "Fev", value: 35000 }, { month: "Mar", value: 38000 },
    { month: "Abr", value: 36000 }, { month: "Mai", value: 40000 }, { month: "Jun", value: 39000 },
  ],
};
