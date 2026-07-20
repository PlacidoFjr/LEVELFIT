import { ArrayMaxSize, IsArray, IsIn, IsOptional, IsString, IsUUID, Matches, MaxLength } from "class-validator";

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

export class ProfessionalRecipientsQueryDto {
  @IsIn(["nutrition", "run"])
  kind!: "nutrition" | "run";
}

export class SendProfessionalMessageDto {
  @IsIn(["nutrition", "run"])
  kind!: "nutrition" | "run";

  @IsUUID("4")
  targetUserId!: string;

  @IsIn(["reminder", "checkin", "plan_update", "encouragement", "appointment", "free"])
  category!: "reminder" | "checkin" | "plan_update" | "encouragement" | "appointment" | "free";

  @IsString()
  @MaxLength(90)
  title!: string;

  @IsString()
  @MaxLength(500)
  body!: string;

  @IsOptional()
  @Matches(/^\/[A-Za-z0-9/_?=&.-]{0,219}$/)
  @MaxLength(220)
  actionUrl?: string;
}
