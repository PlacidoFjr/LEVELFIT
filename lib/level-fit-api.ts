"use client";

import { apiRequest, getAuthenticatedUser } from "@/lib/auth-client";
import { firebaseIdToken, signInFirebaseWithEmail } from "@/lib/firebase-client";

let ownerStepUpToken: string | null = null;
let ownerStepUpExpiresAt = 0;

function ownerStepUpHeaders() {
  if (!ownerStepUpToken || Date.now() >= ownerStepUpExpiresAt) return undefined;
  return { "X-LevelFit-Step-Up": ownerStepUpToken };
}

export function hasFreshOwnerStepUp() {
  return Boolean(ownerStepUpToken && Date.now() < ownerStepUpExpiresAt);
}

export async function confirmOwnerStepUp(password: string) {
  const user = getAuthenticatedUser();
  let firebaseToken: string | undefined;
  if (user?.email) {
    try {
      const firebaseUser = await signInFirebaseWithEmail(user.email, password);
      firebaseToken = await firebaseIdToken(firebaseUser);
    } catch {
      firebaseToken = undefined;
    }
  }

  const result = await apiRequest<{ stepUpToken: string; expiresIn: number }>("/auth/step-up", {
    method: "POST",
    body: JSON.stringify(firebaseToken ? { firebaseIdToken: firebaseToken } : { password }),
  });
  ownerStepUpToken = result.stepUpToken;
  ownerStepUpExpiresAt = Date.now() + Math.max(30, result.expiresIn - 15) * 1000;
  return result;
}

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
  proteinG?: string | number | null;
  carbsG?: string | number | null;
  fatG?: string | number | null;
  meal?: { id: string; name: string } | null;
  items?: FoodLogItem[];
};

export type Food = {
  id: string;
  tacoCode?: number | null;
  name: string;
  searchName: string;
  category: string;
  kcalPer100g?: number | null;
  proteinGPer100g?: string | number | null;
  carbsGPer100g?: string | number | null;
  fatGPer100g?: string | number | null;
  fiberGPer100g?: string | number | null;
  source: string;
};

export type FoodLogItem = {
  id: string;
  foodLogId: string;
  foodId?: string | null;
  nameSnapshot: string;
  quantityG: string | number;
  calories?: number | null;
  proteinG?: string | number | null;
  carbsG?: string | number | null;
  fatG?: string | number | null;
  fiberG?: string | number | null;
  food?: Food | null;
};

export type NutritionToday = {
  data: FoodLog[];
  checklistCompleted: number;
};

export type NutritionGoal = {
  id: string;
  dailyCalories?: number | null;
  proteinG?: string | number | null;
  carbsG?: string | number | null;
  fatG?: string | number | null;
  checklistGoalCount: number;
  startsOn: string;
  endsOn?: string | null;
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
  professionalMessagesEnabled: boolean;
  nutritionProMessagesEnabled: boolean;
  runProMessagesEnabled: boolean;
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

export type PushSubscriptionInput = {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
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

export type XpEvent = {
  id: string;
  amount: number;
  reason: string;
  sourceRefType?: string | null;
  sourceRefId?: string | null;
  createdAt: string;
};

export type XpSummary = {
  level: {
    level: number;
    totalXp: number;
    currentLevelXp: number;
    nextLevelXp: number;
  } | null;
  events: XpEvent[];
  page: { nextCursor: string | null; hasMore: boolean };
};

export type ProfessionalKind = "nutrition" | "run";

export type ProfessionalConnection = {
  id: string;
  kind: ProfessionalKind;
  professionalKey: string;
  professionalName: string;
  professionalRole: string;
  status: "active" | "revoked";
  permissions: string[];
  planTitle: string;
  nextEventLabel?: string | null;
  notes?: string | null;
  acceptedAt: string;
  revokedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProfessionalInvitePreview = {
  kind: ProfessionalKind;
  professionalName: string;
  professionalRole: string;
  headline: string;
  planTitle: string;
  defaultPermissions: string[];
};

export type AdminOverview = {
  stats: Array<{ label: string; value: string; detail: string; tone: "lime" | "cyan" | "green" | "gold" | "violet" | "coral" }>;
  products: Array<{
    id: string;
    title: string;
    description: string;
    status: string;
    users: number;
    activeToday: number;
    route: string;
  }>;
  checklist: Array<{ title: string; detail: string; done: boolean }>;
  meta: { generatedAt: string; source: "api" };
};

export type ProfessionalMessageRecipient = {
  connectionId: string;
  userId: string;
  displayName: string;
  email: string;
  kind: ProfessionalKind;
  permissions: string[];
  planTitle: string;
  acceptedAt: string;
};

export type ProfessionalMessageCategory = "reminder" | "checkin" | "plan_update" | "encouragement" | "appointment" | "free";

export type ProfessionalMessageHistoryItem = {
  id: string;
  notificationId?: string | null;
  kind: ProfessionalKind;
  category: ProfessionalMessageCategory | string;
  title: string;
  body: string;
  actionUrl?: string | null;
  targetUserId?: string | null;
  targetName: string;
  targetEmail?: string | null;
  createdAt: string;
};

export type AdminRoleName = "OWNER" | "NUTRITIONIST" | "RUN_COACH";

export type AdminRoleAssignment = {
  id: string;
  email: string;
  displayName: string;
  role: AdminRoleName;
  source: string;
  createdAt: string | null;
  revokedAt?: string | null;
  assignedBy: string;
  canRevoke: boolean;
  product: "owner" | "nutri" | "run";
  label: string;
};

export type AdminUserRow = {
  id: string;
  email: string;
  displayName: string;
  status: string;
  createdAt: string;
  lastLoginAt?: string | null;
  roles: AdminRoleName[];
  activity: { professionalConnections: number; workoutSessions: number; foodLogs: number };
};

export type AdminProductRow = AdminOverview["products"][number];

export type AdminProfessionalRow = AdminRoleAssignment & {
  connectedClients: number;
  professionalName: string;
  professionalRole: string;
};

export type AdminProfessionalInvite = {
  id: string;
  code: string | null;
  codePreview: string;
  kind: ProfessionalKind;
  professionalKey: string;
  professionalName: string;
  professionalRole: string;
  headline: string;
  planTitle: string;
  defaultPermissions: string[];
  isActive: boolean;
  expiresAt?: string | null;
  createdAt: string;
};

export type AdminSecurityEvent = {
  id: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  createdAt: string;
  actorEmail?: string | null;
  actorName?: string | null;
  targetEmail?: string | null;
  targetName?: string | null;
  metadata: Record<string, unknown>;
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

function notifyXpUpdate(amount?: number) {
  if (typeof window === "undefined" || !amount || amount <= 0) return;
  window.dispatchEvent(new CustomEvent("levelfit:xp-updated", { detail: { amount } }));
}

export function listMissions() {
  return apiRequest<UserMission[]>("/missions/today");
}

export async function completeMission(id: string) {
  const result = await apiRequest<{ mission: UserMission; xpAwarded: number }>(`/missions/${id}/complete`, { method: "PATCH" });
  notifyXpUpdate(result.xpAwarded);
  return result;
}

export function listWorkouts() {
  return apiRequest<{ data: Workout[] }>("/workouts");
}

export function getTodayWorkout() {
  return apiRequest<TodayWorkout>("/workouts/today");
}

export function listWorkoutSessions() {
  return apiRequest<Paginated<WorkoutSession>>("/workout-sessions");
}

export function startWorkoutSession(workoutId: string) {
  return apiRequest<WorkoutSession>("/workout-sessions", {
    method: "POST",
    body: JSON.stringify({ workoutId }),
  });
}

export async function finishWorkoutSession(sessionId: string, exercises: WorkoutSessionExercise[], perceivedEffort?: number) {
  const result = await apiRequest<WorkoutSession>(`/workout-sessions/${sessionId}`, {
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
  notifyXpUpdate(result.xpAwarded);
  return result;
}

export function getHydrationToday() {
  return apiRequest<HydrationToday>("/hydration/today");
}

export async function addWaterLog(amountMl: number) {
  const result = await apiRequest<{ log: { id: string; amountMl: number; loggedAt: string }; consumedMl: number; goalMl: number; xpAwarded: number }>("/water-logs", {
    method: "POST",
    body: JSON.stringify({ amountMl }),
  });
  notifyXpUpdate(result.xpAwarded);
  return result;
}

export function updateHydrationGoal(dailyGoalMl: number) {
  return apiRequest<HydrationToday>("/hydration/goals", {
    method: "PATCH",
    body: JSON.stringify({ dailyGoalMl }),
  });
}

export function getNutritionToday() {
  return apiRequest<NutritionToday>("/food-logs/today");
}

export function getNutritionGoal() {
  return apiRequest<NutritionGoal | null>("/nutrition/goals");
}

export function searchFoods(q: string, limit = 20) {
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  params.set("limit", String(limit));
  return apiRequest<Food[]>(`/foods?${params.toString()}`);
}

export function updateNutritionGoal(input: {
  dailyCalories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  checklistGoalCount?: number;
}) {
  return apiRequest<NutritionGoal>("/nutrition/goals", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function addFoodLog(input: {
  description?: string;
  mealId?: string;
  hasProtein?: boolean;
  hasFruitOrVegetable?: boolean;
  avoidedSkippingMeal?: boolean;
  mindfulChoice?: boolean;
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  items?: Array<{
    foodId?: string;
    name?: string;
    quantityG: number;
    calories?: number;
    proteinG?: number;
    carbsG?: number;
    fatG?: number;
    fiberG?: number;
  }>;
}) {
  const result = await apiRequest<{ log: FoodLog; checklistCompleted: number; xpAwarded: number }>("/food-logs", {
    method: "POST",
    body: JSON.stringify(input),
  });
  notifyXpUpdate(result.xpAwarded);
  return result;
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

export function createProgressPhotoMetadata(input: {
  contentType: string;
  sizeBytes: number;
  pose?: string;
  takenAt?: string;
}) {
  return apiRequest<{ photo: { id: string; storageKey: string; contentType: string; sizeBytes: number }; upload: { required: boolean; url: string | null; note?: string } }>("/progress-photos", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listAchievements() {
  return apiRequest<{ data: Achievement[] }>("/achievements");
}

export function getXpSummary() {
  return apiRequest<XpSummary>("/xp");
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

export function subscribePush(input: PushSubscriptionInput) {
  return apiRequest<{ id: string; createdAt: string; revokedAt?: string | null }>("/push/subscribe", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function unsubscribePush(endpoint: string) {
  return apiRequest<{ revoked: boolean }>("/push/unsubscribe", {
    method: "DELETE",
    body: JSON.stringify({ endpoint }),
  });
}

export function updateMe(input: {
  displayName?: string;
  gender?: "male_cis" | "female_cis" | "male_trans" | "female_trans" | null;
  birthDate?: string;
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

export function listProfessionalConnections() {
  return apiRequest<{ data: ProfessionalConnection[] }>("/professional-connections");
}

export function previewProfessionalInvite(code: string) {
  const params = new URLSearchParams({ code });
  return apiRequest<ProfessionalInvitePreview>(`/professional-connections/invite?${params.toString()}`);
}

export function acceptProfessionalInvite(code: string, permissions: string[]) {
  return apiRequest<{ connection: ProfessionalConnection }>("/professional-connections/accept", {
    method: "POST",
    body: JSON.stringify({ code, permissions }),
  });
}

export function updateProfessionalPermissions(id: string, permissions: string[]) {
  return apiRequest<{ connection: ProfessionalConnection }>(`/professional-connections/${id}/permissions`, {
    method: "PATCH",
    body: JSON.stringify({ permissions }),
  });
}

export function revokeProfessionalConnection(id: string) {
  return apiRequest<{ id: string; status: "revoked" }>(`/professional-connections/${id}`, { method: "DELETE" });
}

export function listProfessionalMessageRecipients(kind: ProfessionalKind) {
  const params = new URLSearchParams({ kind });
  return apiRequest<{ data: ProfessionalMessageRecipient[] }>(`/professional-connections/pro/recipients?${params.toString()}`);
}

export function listProfessionalMessageHistory(kind: ProfessionalKind) {
  const params = new URLSearchParams({ kind });
  return apiRequest<{ data: ProfessionalMessageHistoryItem[] }>(`/professional-connections/pro/messages?${params.toString()}`);
}

export function sendProfessionalMessage(input: {
  kind: ProfessionalKind;
  targetUserId: string;
  category: ProfessionalMessageCategory;
  title: string;
  body: string;
  actionUrl?: string;
}) {
  return apiRequest<{ notification: NotificationItem }>("/professional-connections/pro/messages", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getAdminOverview() {
  return apiRequest<AdminOverview>("/admin/overview");
}

export function getAdminProducts() {
  return apiRequest<{ data: AdminProductRow[]; meta: AdminOverview["meta"] }>("/admin/products");
}

export function getAdminUsers() {
  return apiRequest<{ data: AdminUserRow[] }>("/admin/users");
}

export function getAdminProfessionals() {
  return apiRequest<{ data: AdminProfessionalRow[] }>("/admin/professionals");
}

export function getAdminProfessionalInvites() {
  return apiRequest<{ data: AdminProfessionalInvite[] }>("/admin/professional-invites");
}

export function createAdminProfessionalInvite(input: {
  kind: ProfessionalKind;
  professionalKey: string;
  professionalName: string;
  professionalRole: string;
  headline: string;
  planTitle: string;
  defaultPermissions?: string[];
  expiresAt?: string;
}) {
  return apiRequest<{ invite: AdminProfessionalInvite }>("/admin/professional-invites", {
    method: "POST",
    headers: ownerStepUpHeaders(),
    body: JSON.stringify(input),
  });
}

export function revokeAdminProfessionalInvite(id: string) {
  return apiRequest<{ invite: AdminProfessionalInvite }>(`/admin/professional-invites/${id}`, {
    method: "DELETE",
    headers: ownerStepUpHeaders(),
  });
}

export function getAdminRoles() {
  return apiRequest<{ availableRoles: Array<{ role: AdminRoleName; label: string; product: string }>; data: AdminRoleAssignment[] }>("/admin/roles");
}

export function grantAdminRole(input: { email: string; role: AdminRoleName }) {
  return apiRequest<{ assignment: unknown }>("/admin/roles", {
    method: "POST",
    headers: ownerStepUpHeaders(),
    body: JSON.stringify(input),
  });
}

export function revokeAdminRole(id: string) {
  return apiRequest<{ id: string; revokedAt: string | null }>(`/admin/roles/${id}`, { method: "DELETE", headers: ownerStepUpHeaders() });
}

export function getAdminSettings() {
  return apiRequest<{
    ownerEmailsConfigured: number;
    nutritionistEmailsConfigured: number;
    runCoachEmailsConfigured: number;
    ownerDbRolesEnabled: boolean;
    ownerRoleGrantsEnabled: boolean;
    nodeEnv: string;
    webOrigin: string | null;
  }>("/admin/settings");
}

export function getAdminSecurityEvents() {
  return apiRequest<{ data: AdminSecurityEvent[] }>("/admin/security-events");
}
