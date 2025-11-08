
import { 
  mockUser, mockDailyDietSummary, mockDailyMeals, mockWeeklyDietPlan,
  mockWeeklyWorkoutProgram, mockWeightHistory,
  mockProgressSummary, mockWorkoutAnalytics,
  mockOnboardingData
} from './mocks';
import type { 
  UserProfile, DailyDietSummary, Meal, WeeklyDietDay, 
  WeeklyWorkoutDay, WeightHistoryEntry, ProgressSummary, WorkoutAnalytics, OnboardingData
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
};

export const workoutService = {
  getWeeklyProgram: (): Promise<WeeklyWorkoutDay[]> => simulateApiCall(mockWeeklyWorkoutProgram),
  getWorkoutAnalytics: (): Promise<WorkoutAnalytics> => simulateApiCall(mockWorkoutAnalytics),
};

export const progressService = {
  getWeightHistory: (): Promise<WeightHistoryEntry[]> => simulateApiCall(mockWeightHistory),
  getProgressSummary: (): Promise<ProgressSummary> => simulateApiCall(mockProgressSummary),
};