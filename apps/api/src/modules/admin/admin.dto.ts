import { ArrayMaxSize, IsArray, IsDateString, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class GrantRoleDto {
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @IsIn(["OWNER", "NUTRITIONIST", "RUN_COACH"])
  role!: "OWNER" | "NUTRITIONIST" | "RUN_COACH";
}

export class UpdateUserStatusDto {
  @IsIn(["active", "suspended"])
  status!: "active" | "suspended";
}

export class CreateProfessionalInviteDto {
  @IsIn(["nutrition", "run"])
  kind!: "nutrition" | "run";

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  professionalKey!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  professionalName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  professionalRole!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  headline!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  planTitle!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  defaultPermissions?: string[];

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
