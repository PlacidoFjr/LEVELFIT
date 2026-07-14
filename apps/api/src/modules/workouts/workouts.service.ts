import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import { GamificationService } from "../gamification/gamification.service";
import type { CreateWorkoutDto, StartWorkoutSessionDto, UpdateWorkoutSessionDto } from "./workouts.dto";

@Injectable()
export class WorkoutsService {
  constructor(private readonly prisma: PrismaService, private readonly game: GamificationService) {}

  async list(userId: string) {
    const data = await this.prisma.workout.findMany({ where: { deletedAt: null, OR: [{ isPublic: true }, { createdByUserId: userId }] }, include: { exercises: { include: { exercise: true }, orderBy: { sortOrder: "asc" } } }, orderBy: { createdAt: "desc" }, take: 50 });
    return { data, page: { nextCursor: null, hasMore: false } };
  }

  async today(userId: string) {
    const inProgress = await this.prisma.workoutSession.findFirst({ where: { userId, status: { in: ["planned", "in_progress"] }, deletedAt: null }, include: { workout: { include: { exercises: { include: { exercise: true }, orderBy: { sortOrder: "asc" } } } } }, orderBy: { startedAt: "desc" } });
    if (inProgress) return inProgress;
    return this.prisma.workout.findFirst({ where: { isPublic: true, deletedAt: null }, include: { exercises: { include: { exercise: true }, orderBy: { sortOrder: "asc" } } }, orderBy: { estimatedMinutes: "asc" } });
  }

  async create(userId: string, dto: CreateWorkoutDto) {
    return this.prisma.workout.create({ data: { title: dto.title.trim(), description: dto.description, category: dto.category, difficulty: dto.difficulty, estimatedMinutes: dto.estimatedMinutes, createdByUserId: userId, exercises: { create: dto.exercises.map((exercise) => ({ exerciseId: exercise.exerciseId, sortOrder: exercise.sortOrder, targetSets: exercise.targetSets, targetReps: exercise.targetReps, targetSeconds: exercise.targetSeconds })) } }, include: { exercises: { include: { exercise: true }, orderBy: { sortOrder: "asc" } } } });
  }

  async startSession(userId: string, dto: StartWorkoutSessionDto) {
    const workout = await this.prisma.workout.findFirst({ where: { id: dto.workoutId, deletedAt: null, OR: [{ isPublic: true }, { createdByUserId: userId }] }, include: { exercises: true } });
    if (!workout) throw new NotFoundException({ code: "WORKOUT_NOT_FOUND", message: "Treino não encontrado." });
    const active = await this.prisma.workoutSession.findFirst({ where: { userId, status: "in_progress", deletedAt: null }, select: { id: true } });
    if (active) throw new ConflictException({ code: "SESSION_ALREADY_STARTED", message: "Já existe um treino em andamento." });
    return this.prisma.workoutSession.create({ data: { userId, workoutId: workout.id, startedAt: dto.startedAt ? new Date(dto.startedAt) : new Date(), status: "in_progress", exercises: { create: workout.exercises.map((item) => ({ exerciseId: item.exerciseId })) } }, include: { workout: true, exercises: { include: { exercise: true } } } });
  }

  async updateSession(userId: string, sessionId: string, dto: UpdateWorkoutSessionDto) {
    const session = await this.prisma.workoutSession.findFirst({ where: { id: sessionId, userId, deletedAt: null }, include: { exercises: true } });
    if (!session) throw new NotFoundException({ code: "SESSION_NOT_FOUND", message: "Sessão não encontrada." });
    const allowed: Record<string, string[]> = { planned: ["in_progress", "cancelled"], in_progress: ["completed", "skipped", "cancelled", "in_progress"], completed: ["completed"], skipped: ["skipped"], cancelled: ["cancelled"] };
    if (!allowed[session.status].includes(dto.status)) throw new ConflictException({ code: "INVALID_STATUS_TRANSITION", message: "Transicao de status inválida." });

    return this.prisma.$transaction(async (tx) => {
      if (dto.exercises?.length) {
        for (const exercise of dto.exercises) await tx.workoutSessionExercise.updateMany({ where: { sessionId, exerciseId: exercise.exerciseId }, data: { setsCompleted: exercise.setsCompleted, repsCompleted: exercise.repsCompleted, durationSeconds: exercise.durationSeconds, status: "completed" } });
      }
      let xpAwarded = session.xpAwarded;
      if (dto.status === "completed" && session.status !== "completed") {
        const award = await this.game.awardXp(userId, 60, "workout_completed", `workout_session:${sessionId}:completed`, "workout_session", sessionId, tx);
        xpAwarded += award.awarded;
        await tx.streak.upsert({ where: { userId_type: { userId, type: "workout" } }, create: { userId, type: "workout", currentCount: 1, bestCount: 1, lastCountedDate: new Date() }, update: { currentCount: { increment: 1 }, lastCountedDate: new Date(), status: "active" } });
      }
      return tx.workoutSession.update({ where: { id: sessionId }, data: { status: dto.status, completedAt: dto.status === "completed" ? (dto.completedAt ? new Date(dto.completedAt) : new Date()) : undefined, perceivedEffort: dto.perceivedEffort, notes: dto.notes, xpAwarded }, include: { workout: true, exercises: { include: { exercise: true } } } });
    });
  }
}
