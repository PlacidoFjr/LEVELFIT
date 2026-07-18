import { ArrayMaxSize, IsArray, IsOptional, IsString, MaxLength } from "class-validator";

export class AcceptProfessionalInviteDto {
  @IsString()
  @MaxLength(32)
  code!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  permissions?: string[];
}

export class UpdateProfessionalPermissionsDto {
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  permissions!: string[];
}
