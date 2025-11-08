
import { 
  mockUser, mockDailyDietSummary, mockDailyMeals, mockWeeklyDietPlan,
  mockWeeklyWorkoutProgram, mockWeightHistory,
  mockProgressSummary, mockWorkoutAnalytics,
  mockOnboardingData, mockWeeklyMacroSummary, mockMonthlyMacroSummary, mockAnnualMacroSummary, mockDietMetricsSummary, mockBodyMetricsHistory, mockBodyMetricsSummary,
  mockWorkoutMetricsSummary, mockExerciseLoadHistory, mockWeeklyCompletionHistory
} from './mocks';
import type { 
  UserProfile, DailyDietSummary, Meal, WeeklyDietDay, 
  WeeklyWorkoutDay, WeightHistoryEntry, ProgressSummary, WorkoutAnalytics, OnboardingData, WeeklyMacroSummary, MonthlyMacroSummary, AnnualMacroSummary, DietMetricsSummary, BodyMetricsHistoryEntry, BodyMetricsSummary,
  WorkoutMetricsSummary, ExerciseLoadHistory, WeeklyCompletionHistory
} from './types';

const API_DELAY = 800; // Simulate network latency in milliseconds

const simulateApiCall = <T,>(data: T): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(data);
    }, API_DELAY);
  });
};

export const userService = {
  getProfile: (): Promise<UserProfile> => simulateApiCall(mockUser),
  getOnboardingData: (): Promise<OnboardingData> => simulateApiCall(mockOnboardingData),
};

export const dietService = {
  getDailySummary: (): Promise<DailyDietSummary> => simulateApiCall(mockDailyDietSummary),
  getDailyMeals: (): Promise<Meal[]> => simulateApiCall(mockDailyMeals),
  getWeeklyPlan: (): Promise<WeeklyDietDay[]> => simulateApiCall(mockWeeklyDietPlan),
  getWeeklyMacroSummary: (): Promise<WeeklyMacroSummary[]> => simulateApiCall(mockWeeklyMacroSummary),
  getMonthlyMacroSummary: (): Promise<MonthlyMacroSummary[]> => simulateApiCall(mockMonthlyMacroSummary),
  getAnnualMacroSummary: (): Promise<AnnualMacroSummary[]> => simulateApiCall(mockAnnualMacroSummary),
  getDietMetricsSummary: (): Promise<DietMetricsSummary> => simulateApiCall(mockDietMetricsSummary),
};

export const workoutService = {
  getWeeklyProgram: (): Promise<WeeklyWorkoutDay[]> => simulateApiCall(mockWeeklyWorkoutProgram),
  getWorkoutAnalytics: (): Promise<WorkoutAnalytics> => simulateApiCall(mockWorkoutAnalytics),
  getWorkoutMetricsSummary: (): Promise<WorkoutMetricsSummary> => simulateApiCall(mockWorkoutMetricsSummary),
  getExerciseLoadHistory: (): Promise<ExerciseLoadHistory[]> => simulateApiCall(mockExerciseLoadHistory),
  getWeeklyCompletionHistory: (): Promise<WeeklyCompletionHistory[]> => simulateApiCall(mockWeeklyCompletionHistory),
};

export const progressService = {
  getWeightHistory: (): Promise<WeightHistoryEntry[]> => simulateApiCall(mockWeightHistory),
  getProgressSummary: (): Promise<ProgressSummary> => simulateApiCall(mockProgressSummary),
  getBodyMetricsHistory: (): Promise<BodyMetricsHistoryEntry[]> => simulateApiCall(mockBodyMetricsHistory),
  getBodyMetricsSummary: (): Promise<BodyMetricsSummary> => simulateApiCall(mockBodyMetricsSummary),
};