
import type { UserProfile, DailyDietSummary, Meal, WeeklyDietDay, WeeklyWorkoutDay, WeightHistoryEntry, ProgressSummary, WorkoutAnalytics, Exercise, OnboardingData, MedidasCorporais, WeeklyMacroSummary, MonthlyMacroSummary, AnnualMacroSummary, DietMetricsSummary, BodyMetricsHistoryEntry, BodyMetricsSummary, WorkoutMetricsSummary, ExerciseLoadHistory, WeeklyCompletionHistory } from './types';

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
  { id: 'm1', name: "Café da Manhã", time: "08:00", calories: 450, protein: 30, carbs: 50, fats: 15, description: "Ovos mexidos com aveia e Banana" },
  { id: 'm2', name: "Almoço", time: "13:00", calories: 700, protein: 50, carbs: 80, fats: 20, description: "Frango grelhado, arroz integral e salada de folhas verdes" },
  { id: 'm3', name: "Lanche da Tarde", time: "16:30", calories: 350, protein: 25, carbs: 40, fats: 10, description: "Iogurte grego com whey e Maçã" },
  { id: 'm4', name: "Jantar", time: "20:00", calories: 600, protein: 45, carbs: 60, fats: 15, description: "Salmão assado, batata doce e brócolis no vapor" },
];

export const mockWeeklyDietPlan: WeeklyDietDay[] = Array(7).fill(0).map((_, i) => ({
  day: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][i],
  meals: mockDailyMeals.map(m => ({ ...m, id: `${m.id}-day${i}` })),
}));

const treinoA: Exercise[] = [
  { name: "Supino Reto", sets: "4", reps: "8-12", rest: "60s", load: "80kg" },
  { name: "Desenvolvimento c/ Halteres", sets: "4", reps: "10-12", rest: "60s", load: "20kg/lado" },
  { name: "Tríceps Pulley", sets: "3", reps: "12-15", rest: "45s", load: "25kg", observation: "Focar na contração máxima." },
  { name: "Elevação Lateral", sets: "3", reps: "15", rest: "45s", load: "8kg/lado" },
];

const treinoB: Exercise[] = [
  { name: "Remada Curvada", sets: "4", reps: "8-12", rest: "60s", load: "70kg" },
  { name: "Puxada Frontal", sets: "4", reps: "10-12", rest: "60s", load: "65kg" },
  { name: "Rosca Direta", sets: "3", reps: "12-15", rest: "45s", load: "14kg/lado" },
  { name: "Prancha Abdominal", sets: "3", reps: "60s", rest: "45s" },
];

const treinoC: Exercise[] = [
  { name: "Agachamento Livre", sets: "4", reps: "8-12", rest: "90s", load: "100kg", observation: "Manter a postura correta." },
  { name: "Leg Press 45", sets: "4", reps: "10-15", rest: "75s", load: "180kg" },
  { name: "Cadeira Extensora", sets: "3", reps: "15-20", rest: "60s", load: "50kg" },
  { name: "Panturrilha em Pé", sets: "5", reps: "20", rest: "45s", load: "90kg" },
];

export const mockWeeklyWorkoutProgram: WeeklyWorkoutDay[] = [
  { day: "Segunda", name: "Treino A", focus: "Peito, Tríceps, Ombros", isRestDay: false, isCompleted: true, exercises: treinoA },
  { day: "Terça", name: "Treino B", focus: "Costas, Bíceps, Abdômen", isRestDay: false, isCompleted: true, exercises: treinoB },
  { day: "Quarta", name: "Descanso", focus: "Recuperação Ativa", isRestDay: true, isCompleted: true, exercises: [] },
  { day: "Quinta", name: "Treino C", focus: "Pernas Completo", isRestDay: false, isCompleted: false, exercises: treinoC },
  { day: "Sexta", name: "Treino A", focus: "Peito, Tríceps, Ombros", isRestDay: false, isCompleted: false, exercises: treinoA },
  { day: "Sábado", name: "Treino B", focus: "Costas, Bíceps, Abdômen", isRestDay: false, isCompleted: false, exercises: treinoB },
  { day: "Domingo", name: "Descanso", focus: "Recuperação", isRestDay: true, isCompleted: false, exercises: [] },
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

export const mockWeeklyMacroSummary: WeeklyMacroSummary[] = [
  { day: 'Seg', calories: 2150, protein: 155, carbs: 240, fats: 65 },
  { day: 'Ter', calories: 2200, protein: 150, carbs: 250, fats: 70 },
  { day: 'Qua', calories: 2050, protein: 145, carbs: 230, fats: 60 },
  { day: 'Qui', calories: 2250, protein: 160, carbs: 255, fats: 72 },
  { day: 'Sex', calories: 2300, protein: 165, carbs: 260, fats: 75 },
  { day: 'Sáb', calories: 2500, protein: 170, carbs: 280, fats: 80 },
  { day: 'Dom', calories: 2400, protein: 160, carbs: 270, fats: 78 },
];

export const mockDietMetricsSummary: DietMetricsSummary = {
  averageAdherence: 92,
  daysOnPlan: 84,
};

export const mockMonthlyMacroSummary: MonthlyMacroSummary[] = [
  { week: 'Semana 1', calories: 15400, protein: 1120, carbs: 1750, fats: 490 },
  { week: 'Semana 2', calories: 15800, protein: 1150, carbs: 1800, fats: 500 },
  { week: 'Semana 3', calories: 15200, protein: 1100, carbs: 1700, fats: 480 },
  { week: 'Semana 4', calories: 16000, protein: 1180, carbs: 1850, fats: 510 },
];

export const mockAnnualMacroSummary: AnnualMacroSummary[] = [
  { month: 'Jan', calories: 62000, protein: 4500, carbs: 7000, fats: 2000 },
  { month: 'Fev', calories: 63000, protein: 4600, carbs: 7200, fats: 2050 },
  { month: 'Mar', calories: 65000, protein: 4700, carbs: 7500, fats: 2100 },
  { month: 'Abr', calories: 64000, protein: 4650, carbs: 7300, fats: 2080 },
  { month: 'Mai', calories: 66000, protein: 4800, carbs: 7600, fats: 2150 },
  { month: 'Jun', calories: 65500, protein: 4750, carbs: 7550, fats: 2120 },
];

export const mockBodyMetricsHistory: BodyMetricsHistoryEntry[] = [
  { date: '01/05', weight: 85.0, fatPercentage: 18.0, neck: 40.0, chest: 105.0, waist: 85.0, hips: 100.0, rightArm: 38.0, leftArm: 37.5, rightThigh: 60.0, leftThigh: 59.5 },
  { date: '15/05', weight: 84.2, fatPercentage: 17.5, neck: 39.8, chest: 105.5, waist: 84.0, hips: 99.5, rightArm: 38.2, leftArm: 37.7, rightThigh: 60.2, leftThigh: 59.7 },
  { date: '01/06', weight: 83.0, fatPercentage: 16.8, neck: 39.5, chest: 106.0, waist: 82.5, hips: 99.0, rightArm: 38.5, leftArm: 38.0, rightThigh: 60.5, leftThigh: 60.0 },
  { date: '15/06', weight: 82.1, fatPercentage: 16.2, neck: 39.3, chest: 106.2, waist: 81.5, hips: 98.5, rightArm: 38.7, leftArm: 38.2, rightThigh: 60.8, leftThigh: 60.3 },
  { date: '01/07', weight: 81.5, fatPercentage: 15.5, neck: 39.0, chest: 106.5, waist: 80.0, hips: 98.0, rightArm: 39.0, leftArm: 38.5, rightThigh: 61.0, leftThigh: 60.5 },
];

export const mockBodyMetricsSummary: BodyMetricsSummary = {
  currentWeight: 81.5,
  fatPercentage: 15.5,
  totalWeightChange: -3.5,
};

export const mockWorkoutMetricsSummary: WorkoutMetricsSummary = {
  workoutsThisMonth: 18,
  totalWorkoutsInMonth: 24,
  adherence: 75
};

export const mockExerciseLoadHistory: ExerciseLoadHistory[] = [
  {
    workoutType: 'A',
    exercises: [
      { name: 'Supino Reto', history: [{ date: 'S1', load: 78 }, { date: 'S2', load: 80 }, { date: 'S3', load: 82 }, { date: 'S4', load: 82.5 }] },
      { name: 'Desenvolvimento c/ Halteres', history: [{ date: 'S1', load: 18 }, { date: 'S2', load: 20 }, { date: 'S3', load: 20 }, { date: 'S4', load: 22 }] },
      { name: 'Tríceps Pulley', history: [{ date: 'S1', load: 22.5 }, { date: 'S2', load: 25 }, { date: 'S3', load: 25 }, { date: 'S4', load: 27.5 }] },
      { name: 'Elevação Lateral', history: [{ date: 'S1', load: 7 }, { date: 'S2', load: 8 }, { date: 'S3', load: 9 }, { date: 'S4', load: 9 }] },
    ]
  },
  {
    workoutType: 'B',
    exercises: [
      { name: 'Remada Curvada', history: [{ date: 'S1', load: 68 }, { date: 'S2', load: 70 }, { date: 'S3', load: 72.5 }, { date: 'S4', load: 75 }] },
      { name: 'Puxada Frontal', history: [{ date: 'S1', load: 62.5 }, { date: 'S2', load: 65 }, { date: 'S3', load: 65 }, { date: 'S4', load: 67.5 }] },
      { name: 'Rosca Direta', history: [{ date: 'S1', load: 12 }, { date: 'S2', load: 14 }, { date: 'S3', load: 15 }, { date: 'S4', load: 15 }] },
    ]
  },
  {
    workoutType: 'C',
    exercises: [
      { name: 'Agachamento Livre', history: [{ date: 'S1', load: 95 }, { date: 'S2', load: 100 }, { date: 'S3', load: 102.5 }, { date: 'S4', load: 105 }] },
      { name: 'Leg Press 45', history: [{ date: 'S1', load: 170 }, { date: 'S2', load: 180 }, { date: 'S3', load: 185 }, { date: 'S4', load: 190 }] },
      { name: 'Cadeira Extensora', history: [{ date: 'S1', load: 45 }, { date: 'S2', load: 50 }, { date: 'S3', load: 52.5 }, { date: 'S4', load: 55 }] },
      { name: 'Panturrilha em Pé', history: [{ date: 'S1', load: 85 }, { date: 'S2', load: 90 }, { date: 'S3', load: 90 }, { date: 'S4', load: 95 }] },
    ]
  }
];

export const mockWeeklyCompletionHistory: WeeklyCompletionHistory[] = [
  { week: 'Semana 1', days: [{ day: 'Seg', completed: true }, { day: 'Ter', completed: true }, { day: 'Qui', completed: true }, { day: 'Sex', completed: true }, { day: 'Sáb', completed: true }] },
  { week: 'Semana 2', days: [{ day: 'Seg', completed: true }, { day: 'Ter', completed: true }, { day: 'Qui', completed: true }, { day: 'Sex', completed: false }, { day: 'Sáb', completed: true }] },
  { week: 'Semana 3', days: [{ day: 'Seg', completed: true }, { day: 'Ter', completed: true }, { day: 'Qui', completed: true }, { day: 'Sex', completed: true }, { day: 'Sáb', completed: true }] },
  { week: 'Semana 4', days: [{ day: 'Seg', completed: true }, { day: 'Ter', completed: true }, { day: 'Qui', completed: false }, { day: 'Sex', completed: false }, { day: 'Sáb', completed: false }] },
];


export const mockMedidasCorporais: MedidasCorporais = {
  data: '2023-10-27',
  peso: '85',
  altura: '175',
  pescoco: '40',
  peito: '105',
  cintura: '85',
  quadril: '100',
  bracoDireito: '38',
  bracoEsquerdo: '37.5',
  coxaDireita: '60',
  coxaEsquerda: '59.5',
  panturrilhaDireita: '42',
  panturrilhaEsquerda: '41.5',
  gordura: '18',
  notas: 'Medidas iniciais do programa.'
};

export const mockOnboardingData: OnboardingData = {
  dadosBasicos: {
    nomeCompleto: 'Alex Silva',
    dataNascimento: '1995-05-15',
    sexo: 'masculino',
  },
  saude: {
    condicoesMedicas: 'Nenhuma',
    medicacoes: 'Nenhuma',
    alergias: 'Nenhuma',
  },
  lesoes: {
    lesoesLimitacoes: 'Leve desconforto no ombro direito ao levantar muito peso.',
  },
  rotina: {
    profissao: 'Desenvolvedor de Software',
    horarioAcordar: '07:00',
    horarioDormir: '23:00',
  },
  preferenciasAlimentares: {
    restricoes: ['Sem Lactose'],
    alimentosNaoGosta: 'Jiló, fígado',
    alimentosDisponiveis: 'Frango, batata doce, brócolis',
    disposicaoCozinhar: 'alta',
    orcamento: 'moderado',
  },
  preferenciasTreino: {
    local: 'academia',
    equipamentos: ['Halteres', 'Barras', 'Máquinas'],
    experiencia: 'intermediario',
    diasPreferenciais: ['Seg', 'Ter', 'Qui', 'Sex'],
    horariosPreferenciais: ['Noite'],
  },
  objetivo: {
    meta: 'recomposicao',
    prazo: '2024-03-31',
    motivacao: 'Me sentir mais saudável e com mais disposição.',
  },
  medidasCorporais: mockMedidasCorporais,
};