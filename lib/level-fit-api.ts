"use client";

import { apiRequest } from "@/lib/auth-client";

export type Paginated<T> = {
  data: T[];
  page?: { nextCursor: string | null; hasMore: boolean };
};

export type Exercise = {
  id: string;
  name: string;
  muscleGroup: string;
  equipment?: string | null;
  instructions?: string | null;
  safetyNotes?: string | null;
};

export type WorkoutExercise = {
  id: string;
  exerciseId: string;
  sortOrder: number;
  targetSets?: number | null;
  targetReps?: number | null;
  targetSeconds?: number | null;
  exercise: Exercise;
};

export type Workout = {
  id: string;
  title: string;
  description?: string | null;
  difficulty: "easy" | "medium" | "hard";
  estimatedMinutes: number;
  category: "strength" | "cardio" | "mobility" | "full_body" | "recovery";
  isPublic?: boolean;
  exercises: WorkoutExercise[];
};

export type WorkoutSessionExercise = {
  id: string;
  exerciseId: string;
  setsCompleted: number;
  repsCompleted?: number | null;
  durationSeconds?: number | null;
  status: "pending" | "completed" | "skipped";
  exercise: Exercise;
};

export type WorkoutSession = {
  id: string;
  workoutId: string;
  startedAt: string;
  completedAt?: string | null;
  status: "planned" | "in_progress" | "completed" | "skipped" | "cancelled";
  perceivedEffort?: number | null;
  notes?: string | null;
  xpAwarded: number;
  workout: Workout;
  exercises: WorkoutSessionExercise[];
};

export type TodayWorkout = Workout | WorkoutSession | null;

export type UserMission = {
  id: string;
  missionDate: string;
  status: "pending" | "completed" | "missed" | "skipped";
  completedAt?: string | null;
  xpAwarded: number;
  dailyMission: {
    id: string;
    key: string;
    title: string;
    description: string;
    type: "workout" | "water" | "nutrition" | "habit" | "progress" | "recovery";
    xpReward: number;
  };
};

export type HydrationToday = {
  goalMl: number;
  consumedMl: number;
  percentage: number;
  logs: Array<{ id: string; amountMl: number; loggedAt: string }>;
};

export type FoodLog = {
  id: string;
  mealId?: string | null;
  loggedAt: string;
  description?: string | null;
  hasProtein?: boolean | null;
  hasFruitOrVegetable?: boolean | null;
  avoidedSkippingMeal?: boolean | null;
  mindfulChoice?: boolean | null;
  calories?: number | null;
  meal?: { id: string; name: string } | null;
};

export type NutritionToday = {
  data: FoodLog[];
  checklistCompleted: number;
};

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string;
  actionUrl?: string | null;
  readAt?: string | null;
  createdAt: string;
};

export type NotificationPreferences = {
  emailEnabled: boolean;
  pushEnabled: boolean;
  waterRemindersEnabled: boolean;
  workoutRemindersEnabled: boolean;
  nutritionRemindersEnabled: boolean;
  streakRemindersEnabled: boolean;
  weeklySummaryEnabled: boolean;
  preferredWorkoutTime?: string | null;
  waterReminderIntervalMinutes: number;
  streakRiskTime?: string | null;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
  silentDays: number[];
  timezone: string;
};

export type SecurityEvent = {
  id: string;
  type: string;
  createdAt: string;
  metadata?: Record<string, unknown> | null;
};

export type BodyMeasurement = {
  id: string;
  measuredAt: string;
  weightKg?: string | number | null;
  waistCm?: string | number | null;
  hipCm?: string | number | null;
  chestCm?: string | number | null;
  armCm?: string | number | null;
  thighCm?: string | number | null;
  notes?: string | null;
};

export type Achievement = {
  id: string;
  key: string;
  name: string;
  description: string;
  category: string;
  rarity: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string | null;
};

export type RankingEntry = {
  rank: number;
  userId: string;
  displayName: string;
  level: number;
  totalXp: number;
  streak: number;
};

export function isWorkoutSession(value: TodayWorkout): value is WorkoutSession {
  return Boolean(value && "workout" in value && "status" in value);
}

export function getWorkoutFromToday(value: TodayWorkout): Workout | null {
  if (!value) return null;
  return isWorkoutSession(value) ? value.workout : value;
}

export function formatExerciseTarget(exercise: WorkoutExercise | WorkoutSessionExercise) {
  const target = "targetSets" in exercise ? exercise : null;
  const session = "setsCompleted" in exercise ? exercise : null;
  if (target?.targetSets && target?.targetReps) return `${target.targetSets} x ${target.targetReps}`;
  if (target?.targetSets && target?.targetSeconds) return `${target.targetSets} x ${Math.round(target.targetSeconds / 60)} min`;
  if (target?.targetSeconds) return `${Math.round(target.targetSeconds / 60)} min`;
  if (session?.durationSeconds) return `${Math.round(session.durationSeconds / 60)} min`;
  return "No seu ritmo";
}

export function timeValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) return date.toISOString().slice(11, 16);
  return value.slice(0, 5);
}

export function listMissions() {
  return apiRequest<UserMission[]>("/missions/today");
}

export function completeMission(id: string) {
  return apiRequest<{ mission: UserMission; xpAwarded: number }>(`/missions/${id}/complete`, { method: "PATCH" });
}

export function listWorkouts() {
  return apiRequest<{ data: Workout[] }>("/workouts");
}

export function getTodayWorkout() {
  return apiRequest<TodayWorkout>("/workouts/today");
}

export function startWorkoutSession(workoutId: string) {
  return apiRequest<WorkoutSession>("/workout-sessions", {
    method: "POST",
    body: JSON.stringify({ workoutId }),
  });
}

export function finishWorkoutSession(sessionId: string, exercises: WorkoutSessionExercise[], perceivedEffort?: number) {
  return apiRequest<WorkoutSession>(`/workout-sessions/${sessionId}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: "completed",
      completedAt: new Date().toISOString(),
      perceivedEffort,
      exercises: exercises.map((item) => ({
        exerciseId: item.exerciseId,
        setsCompleted: Math.max(1, item.setsCompleted || 1),
        repsCompleted: item.repsCompleted ?? undefined,
        durationSeconds: item.durationSeconds ?? undefined,
      })),
    }),
  });
}

export function getHydrationToday() {
  return apiRequest<HydrationToday>("/hydration/today");
}

export function addWaterLog(amountMl: number) {
  return apiRequest<{ log: { id: string; amountMl: number; loggedAt: string }; consumedMl: number; goalMl: number; xpAwarded: number }>("/water-logs", {
    method: "POST",
    body: JSON.stringify({ amountMl }),
  });
}

export function getNutritionToday() {
  return apiRequest<NutritionToday>("/food-logs/today");
}

export function addFoodLog(input: {
  description?: string;
  mealId?: string;
  hasProtein?: boolean;
  hasFruitOrVegetable?: boolean;
  avoidedSkippingMeal?: boolean;
  mindfulChoice?: boolean;
}) {
  return apiRequest<{ log: FoodLog; checklistCompleted: number; xpAwarded: number }>("/food-logs", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listMeasurements() {
  return apiRequest<Paginated<BodyMeasurement>>("/body-measurements");
}

export function addMeasurement(input: {
  weightKg?: number;
  waistCm?: number;
  hipCm?: number;
  chestCm?: number;
  armCm?: number;
  thighCm?: number;
  notes?: string;
}) {
  return apiRequest<BodyMeasurement>("/body-measurements", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listAchievements() {
  return apiRequest<{ data: Achievement[] }>("/achievements");
}

export function listRanking() {
  return apiRequest<{ data: RankingEntry[] }>("/ranking");
}

export function listNotifications() {
  return apiRequest<{ items: NotificationItem[]; unreadCount: number }>("/notifications");
}

export function markNotificationRead(id: string) {
  return apiRequest<{ id: string; read: true }>(`/notifications/${id}/read`, { method: "PATCH" });
}

export function markAllNotificationsRead() {
  return apiRequest<{ updated: number }>("/notifications/read-all", { method: "PATCH" });
}

export function getNotificationPreferences() {
  return apiRequest<NotificationPreferences>("/notification-preferences");
}

export function updateNotificationPreferences(input: Partial<NotificationPreferences>) {
  return apiRequest<NotificationPreferences>("/notification-preferences", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function updateMe(input: {
  displayName?: string;
  gender?: "female" | "male" | "non_binary" | null;
  timezone?: string;
  fitnessGoal?: string;
  activityLevel?: string;
  heightCm?: number;
  rankingOptIn?: boolean;
}) {
  return apiRequest("/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function listSecurityEvents() {
  return apiRequest<Paginated<SecurityEvent>>("/me/security-events");
}

export function requestDataExport(includeProgressPhotos: boolean) {
  return apiRequest<{ exportRequestId: string; status: string }>("/me/export-data", {
    method: "POST",
    body: JSON.stringify({ includeProgressPhotos }),
  });
}

export function logoutAllDevices() {
  return apiRequest<void>("/auth/logout", {
    method: "POST",
    body: JSON.stringify({ allDevices: true }),
  }, false);
}
