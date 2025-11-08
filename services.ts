
import { 
  mockUser, mockDailyDietSummary, mockDailyMeals, mockWeeklyDietPlan,
  mockTodaysWorkout, mockWeeklyWorkoutProgram, mockWeightHistory,
  mockProgressSummary, mockWorkoutAnalytics 
} from './mocks';
import type { 
  UserProfile, DailyDietSummary, Meal, WeeklyDietDay, TodaysWorkout, 
  WeeklyWorkoutDay, WeightHistoryEntry, ProgressSummary, WorkoutAnalytics 
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
};

export const dietService = {
  getDailySummary: (): Promise<DailyDietSummary> => simulateApiCall(mockDailyDietSummary),
  getDailyMeals: (): Promise<Meal[]> => simulateApiCall(mockDailyMeals),
  getWeeklyPlan: (): Promise<WeeklyDietDay[]> => simulateApiCall(mockWeeklyDietPlan),
};

export const workoutService = {
  getTodaysWorkout: (): Promise<TodaysWorkout> => simulateApiCall(mockTodaysWorkout),
  getWeeklyProgram: (): Promise<WeeklyWorkoutDay[]> => simulateApiCall(mockWeeklyWorkoutProgram),
  getWorkoutAnalytics: (): Promise<WorkoutAnalytics> => simulateApiCall(mockWorkoutAnalytics),
};

export const progressService = {
  getWeightHistory: (): Promise<WeightHistoryEntry[]> => simulateApiCall(mockWeightHistory),
  getProgressSummary: (): Promise<ProgressSummary> => simulateApiCall(mockProgressSummary),
};
