import { ActivityLevel, FitnessGoal } from "@prisma/client";
import { IsBoolean, IsEnum, IsIn, IsNumber, IsOptional, IsString, IsTimeZone, Max, MaxLength, Min, MinLength } from "class-validator";

export class UpdateMeDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(80) displayName?: string;
  @IsOptional() @IsIn(["male_cis", "female_cis", "male_trans", "female_trans", null]) gender?: string | null;
  @IsOptional() @IsString() birthDate?: string;
  @IsOptional() @IsTimeZone() timezone?: string;
  @IsOptional() @IsEnum(FitnessGoal) fitnessGoal?: FitnessGoal;
  @IsOptional() @IsEnum(ActivityLevel) activityLevel?: ActivityLevel;
  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(80) @Max(250) heightCm?: number;
  @IsOptional() @IsBoolean() rankingOptIn?: boolean;
}

export class DeleteAccountDto {
  @IsString() @MinLength(1) @MaxLength(128) password: string;
  @IsString() confirmation: string;
  @IsOptional() @IsString() @MaxLength(500) reason?: string;
}

export class ExportDataDto {
  @IsOptional() @IsBoolean() includeProgressPhotos?: boolean;
}
