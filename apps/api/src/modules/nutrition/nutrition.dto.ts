import { Type } from "class-transformer";
import { ArrayMaxSize, IsArray, IsBoolean, IsDateString, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min, ValidateNested } from "class-validator";

export class FoodLogItemDto {
  @IsOptional() @IsUUID() foodId?: string;
  @IsOptional() @IsString() @MaxLength(180) name?: string;
  @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(1) @Max(5000) quantityG!: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(10000) calories?: number;
  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(1000) proteinG?: number;
  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(2000) carbsG?: number;
  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(1000) fatG?: number;
  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(1000) fiberG?: number;
}

export class SearchFoodsDto {
  @IsOptional() @IsString() @MaxLength(80) q?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50) limit?: number;
}

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
  @IsOptional() @IsArray() @ArrayMaxSize(20) @ValidateNested({ each: true }) @Type(() => FoodLogItemDto) items?: FoodLogItemDto[];
}

export class UpdateNutritionGoalDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(800) @Max(10000) dailyCalories?: number;
  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(1000) proteinG?: number;
  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(2000) carbsG?: number;
  @IsOptional() @Type(() => Number) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) @Max(1000) fatG?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(4) checklistGoalCount?: number;
}
