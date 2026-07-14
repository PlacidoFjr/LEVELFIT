import { IsDateString, IsInt, IsOptional, Max, Min } from "class-validator";

export class CreateWaterLogDto {
  @IsInt() @Min(25) @Max(2000) amountMl: number;
  @IsOptional() @IsDateString() loggedAt?: string;
}
