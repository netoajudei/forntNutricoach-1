
import type { UserProfile, DailyDietSummary, Meal, WeeklyDietDay, WeeklyWorkoutDay, WeightHistoryEntry, ProgressSummary, WorkoutAnalytics, Exercise, OnboardingData, MedidasCorporais } from './types';

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
    { name: "Supino Reto", sets: "4", reps: "8-12", rest: "60s" },
    { name: "Desenvolvimento com Halteres", sets: "4", reps: "10-12", rest: "60s" },
    { name: "Tríceps Pulley", sets: "3", reps: "12-15", rest: "45s", observation: "Focar na contração máxima." },
    { name: "Elevação Lateral", sets: "3", reps: "15", rest: "45s" },
];

const treinoB: Exercise[] = [
    { name: "Remada Curvada", sets: "4", reps: "8-12", rest: "60s" },
    { name: "Puxada Frontal", sets: "4", reps: "10-12", rest: "60s" },
    { name: "Rosca Direta", sets: "3", reps: "12-15", rest: "45s" },
    { name: "Prancha Abdominal", sets: "3", reps: "60s", rest: "45s" },
];

const treinoC: Exercise[] = [
    { name: "Agachamento Livre", sets: "4", reps: "8-12", rest: "90s", observation: "Manter a postura correta." },
    { name: "Leg Press 45", sets: "4", reps: "10-15", rest: "75s" },
    { name: "Cadeira Extensora", sets: "3", reps: "15-20", rest: "60s" },
    { name: "Panturrilha em Pé", sets: "5", reps: "20", rest: "45s" },
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
    alimentosFavoritos: 'Frango, batata doce, brócolis',
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