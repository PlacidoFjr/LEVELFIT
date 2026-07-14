import { Type } from "class-transformer";
import { IsBoolean, IsDateString, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from "class-validator";

export class CreateFoodLogDto {
  @IsOptional() @IsUUID() mealId?: string;
  @IsOptional() @IsDateString() loggedAt?: string;
  @IsOptional() @IsString() @MaxLength(500) description?: string;
  @IsOptional() @IsBoolean() hasProtein?: boolean;
  @IsOptional() @IsBoolean() hasFruitOrVegetable?: boolean;
  @IsOptional() @IsBoolean() avoidedSkippingMeal?: boolean;
  @IsOptional() @IsBoolean() mindfulChoice?: boolean;
  @IsOptional() @IsInt() @Min(0) @Max(10000) calories?: number;
  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(1000) proteinG?: number;
  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(2000) carbsG?: number;
  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(1000) fatG?: number;
}
