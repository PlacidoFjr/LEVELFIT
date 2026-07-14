import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsTimeZone,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";

const clockPattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export class UpdateNotificationPreferencesDto {
  @IsOptional() @IsBoolean() emailEnabled?: boolean;
  @IsOptional() @IsBoolean() pushEnabled?: boolean;
  @IsOptional() @IsBoolean() waterRemindersEnabled?: boolean;
  @IsOptional() @IsBoolean() workoutRemindersEnabled?: boolean;
  @IsOptional() @IsBoolean() nutritionRemindersEnabled?: boolean;
  @IsOptional() @IsBoolean() streakRemindersEnabled?: boolean;
  @IsOptional() @IsBoolean() weeklySummaryEnabled?: boolean;
  @IsOptional() @Matches(clockPattern) preferredWorkoutTime?: string;
  @IsOptional() @IsInt() @Min(30) @Max(480) waterReminderIntervalMinutes?: number;
  @IsOptional() @Matches(clockPattern) streakRiskTime?: string;
  @IsOptional() @Matches(clockPattern) quietHoursStart?: string;
  @IsOptional() @Matches(clockPattern) quietHoursEnd?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(7) @IsInt({ each: true }) @Min(0, { each: true }) @Max(6, { each: true }) silentDays?: number[];
  @IsOptional() @IsTimeZone() timezone?: string;
}

class PushKeysDto {
  @IsString() @MaxLength(512) p256dh!: string;
  @IsString() @MaxLength(512) auth!: string;
}

export class SubscribePushDto {
  @IsUrl({ require_protocol: true, protocols: ["https"] }) @MaxLength(2048) endpoint!: string;
  @ValidateNested() @Type(() => PushKeysDto) keys!: PushKeysDto;
}

export class UnsubscribePushDto {
  @IsString() @MaxLength(2048) endpoint!: string;
}

export class TestEmailPreferencesDto {
  @IsIn(["workout_reminder", "streak_at_risk", "weekly_summary", "achievement_unlocked", "mission_pending"])
  templateKey!: string;
}
