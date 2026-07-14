import { Type } from "class-transformer";
import { IsDateString, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class CreateBodyMeasurementDto {
  @IsOptional() @IsDateString() measuredAt?: string;
  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(20) @Max(500) weightKg?: number;
  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(20) @Max(300) waistCm?: number;
  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(20) @Max(300) hipCm?: number;
  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(20) @Max(300) chestCm?: number;
  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(10) @Max(150) armCm?: number;
  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(20) @Max(200) thighCm?: number;
  @IsOptional() @IsString() @MaxLength(500) notes?: string;
}

export class CreateProgressPhotoDto {
  @IsString() @MaxLength(80) contentType: string;
  @IsInt() @Min(1) @Max(10_000_000) sizeBytes: number;
  @IsOptional() @IsDateString() takenAt?: string;
  @IsOptional() @IsString() @MaxLength(60) pose?: string;
}
