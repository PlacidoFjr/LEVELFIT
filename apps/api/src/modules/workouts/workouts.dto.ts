import { SessionStatus, WorkoutCategory, WorkoutDifficulty } from "@prisma/client";
import { Type } from "class-transformer";
import { ArrayMaxSize, IsArray, IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength, ValidateNested } from "class-validator";

export class WorkoutExerciseDto {
  @IsUUID() exerciseId: string;
  @IsInt() @Min(0) @Max(100) sortOrder: number;
  @IsOptional() @IsInt() @Min(1) @Max(20) targetSets?: number;
  @IsOptional() @IsInt() @Min(1) @Max(200) targetReps?: number;
  @IsOptional() @IsInt() @Min(5) @Max(3600) targetSeconds?: number;
}

export class CreateWorkoutDto {
  @IsString() @MinLength(2) @MaxLength(120) title: string;
  @IsOptional() @IsString() @MaxLength(1000) description?: string;
  @IsEnum(WorkoutCategory) category: WorkoutCategory;
  @IsEnum(WorkoutDifficulty) difficulty: WorkoutDifficulty;
  @IsInt() @Min(5) @Max(240) estimatedMinutes: number;
  @IsArray() @ArrayMaxSize(50) @ValidateNested({ each: true }) @Type(() => WorkoutExerciseDto) exercises: WorkoutExerciseDto[];
}

export class StartWorkoutSessionDto {
  @IsUUID() workoutId: string;
  @IsOptional() @IsDateString() startedAt?: string;
}

export class SessionExerciseUpdateDto {
  @IsUUID() exerciseId: string;
  @IsOptional() @IsInt() @Min(0) @Max(50) setsCompleted?: number;
  @IsOptional() @IsInt() @Min(0) @Max(1000) repsCompleted?: number;
  @IsOptional() @IsInt() @Min(0) @Max(7200) durationSeconds?: number;
}

export class UpdateWorkoutSessionDto {
  @IsEnum(SessionStatus) status: SessionStatus;
  @IsOptional() @IsDateString() completedAt?: string;
  @IsOptional() @IsInt() @Min(1) @Max(10) perceivedEffort?: number;
  @IsOptional() @IsString() @MaxLength(1000) notes?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(50) @ValidateNested({ each: true }) @Type(() => SessionExerciseUpdateDto) exercises?: SessionExerciseUpdateDto[];
}
