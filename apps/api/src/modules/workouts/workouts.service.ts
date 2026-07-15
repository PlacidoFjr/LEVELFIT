import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { GamificationService } from "../gamification/gamification.service";
import type { CreateWorkoutDto, StartWorkoutSessionDto, UpdateWorkoutSessionDto } from "./workouts.dto";

const workoutWithExercises = {
  exercises: { include: { exercise: true }, orderBy: { sortOrder: "asc" as const } },
};

const sessionInclude = {
  workout: { include: workoutWithExercises },
  exercises: { include: { exercise: true }, orderBy: { createdAt: "asc" as const } },
};

@Injectable()
export class WorkoutsService {
  constructor(private readonly prisma: PrismaService, private readonly game: GamificationService) {}

  async list(userId: string) {
    const data = await this.prisma.workout.findMany({
      where: { deletedAt: null, OR: [{ isPublic: true }, { createdByUserId: userId }] },
      include: workoutWithExercises,
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return { data, page: { nextCursor: null, hasMore: false } };
  }

  async today(userId: string) {
    const inProgress = await this.prisma.workoutSession.findFirst({
      where: { userId, status: { in: ["planned", "in_progress"] }, deletedAt: null },
      include: sessionInclude,
      orderBy: { startedAt: "desc" },
    });

    if (inProgress?.exercises.length) return inProgress;
    if (inProgress) {
      await this.prisma.workoutSession.update({ where: { id: inProgress.id }, data: { status: "cancelled" } });
    }

    return this.prisma.workout.findFirst({
      where: { isPublic: true, deletedAt: null, exercises: { some: {} } },
      include: workoutWithExercises,
      orderBy: { estimatedMinutes: "asc" },
    });
  }

  async sessions(userId: string) {
    const data = await this.prisma.workoutSession.findMany({
      where: { userId, deletedAt: null },
      include: sessionInclude,
      orderBy: { startedAt: "desc" },
      take: 20,
    });

    return { data, page: { nextCursor: null, hasMore: false } };
  }

  async create(userId: string, dto: CreateWorkoutDto) {
    return this.prisma.workout.create({
      data: {
        title: dto.title.trim(),
        description: dto.description,
        category: dto.category,
        difficulty: dto.difficulty,
        estimatedMinutes: dto.estimatedMinutes,
        createdByUserId: userId,
        exercises: {
          create: dto.exercises.map((exercise) => ({
            exerciseId: exercise.exerciseId,
            sortOrder: exercise.sortOrder,
            targetSets: exercise.targetSets,
            targetReps: exercise.targetReps,
            targetSeconds: exercise.targetSeconds,
          })),
        },
      },
      include: workoutWithExercises,
    });
  }

  async startSession(userId: string, dto: StartWorkoutSessionDto) {
    const workout = await this.prisma.workout.findFirst({
      where: { id: dto.workoutId, deletedAt: null, OR: [{ isPublic: true }, { createdByUserId: userId }] },
      include: { exercises: true },
    });
    if (!workout) throw new NotFoundException({ code: "WORKOUT_NOT_FOUND", message: "Treino não encontrado." });
    if (!workout.exercises.length) throw new ConflictException({ code: "WORKOUT_HAS_NO_EXERCISES", message: "Este treino ainda não tem exercícios cadastrados." });

    const active = await this.prisma.workoutSession.findFirst({ where: { userId, status: "in_progress", deletedAt: null }, select: { id: true } });
    if (active) throw new ConflictException({ code: "SESSION_ALREADY_STARTED", message: "Já existe um treino em andamento." });

    return this.prisma.workoutSession.create({
      data: {
        userId,
        workoutId: workout.id,
        startedAt: dto.startedAt ? new Date(dto.startedAt) : new Date(),
        status: "in_progress",
        exercises: { create: workout.exercises.map((item) => ({ exerciseId: item.exerciseId })) },
      },
      include: sessionInclude,
    });
  }

  async updateSession(userId: string, sessionId: string, dto: UpdateWorkoutSessionDto) {
    const session = await this.prisma.workoutSession.findFirst({ where: { id: sessionId, userId, deletedAt: null }, include: { exercises: true } });
    if (!session) throw new NotFoundException({ code: "SESSION_NOT_FOUND", message: "Sessão não encontrada." });
    if (dto.status === "completed" && !session.exercises.length) throw new ConflictException({ code: "SESSION_HAS_NO_EXERCISES", message: "Esta sessão não tem exercícios para salvar." });

    const allowed: Record<string, string[]> = { planned: ["in_progress", "cancelled"], in_progress: ["completed", "skipped", "cancelled", "in_progress"], completed: ["completed"], skipped: ["skipped"], cancelled: ["cancelled"] };
    if (!allowed[session.status].includes(dto.status)) throw new ConflictException({ code: "INVALID_STATUS_TRANSITION", message: "Transição de status inválida." });

    return this.prisma.$transaction(async (tx) => {
      if (dto.exercises?.length) {
        for (const exercise of dto.exercises) {
          await tx.workoutSessionExercise.updateMany({
            where: { sessionId, exerciseId: exercise.exerciseId },
            data: { setsCompleted: exercise.setsCompleted, repsCompleted: exercise.repsCompleted, durationSeconds: exercise.durationSeconds, status: "completed" },
          });
        }
      }

      let xpAwarded = session.xpAwarded;
      if (dto.status === "completed" && session.status !== "completed") {
        const award = await this.game.awardXp(userId, 60, "workout_completed", `workout_session:${sessionId}:completed`, "workout_session", sessionId, tx);
        xpAwarded += award.awarded;
        await tx.streak.upsert({
          where: { userId_type: { userId, type: "workout" } },
          create: { userId, type: "workout", currentCount: 1, bestCount: 1, lastCountedDate: new Date() },
          update: { currentCount: { increment: 1 }, lastCountedDate: new Date(), status: "active" },
        });
        if (award.awarded > 0) {
          await tx.notification.create({
            data: {
              userId,
              type: "daily_summary",
              title: "Treino salvo",
              body: "Sessão concluída com segurança. O importante foi aparecer e respeitar seu ritmo.",
              actionUrl: "/workouts",
            },
          });
        }
      }

      return tx.workoutSession.update({
        where: { id: sessionId },
        data: { status: dto.status, completedAt: dto.status === "completed" ? (dto.completedAt ? new Date(dto.completedAt) : new Date()) : undefined, perceivedEffort: dto.perceivedEffort, notes: dto.notes, xpAwarded },
        include: sessionInclude,
      });
    });
  }
}
