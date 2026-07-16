import { Transform } from "class-transformer";
import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, IsTimeZone, Length, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
  @Transform(({ value }) => typeof value === "string" ? value.trim().toLowerCase() : value)
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsString()
  @MinLength(10)
  @MaxLength(128)
  password: string;

  @IsString()
  @Length(2, 80)
  displayName: string;

  @IsOptional()
  @IsIn(["male_cis", "female_cis", "male_trans", "female_trans"])
  gender?: string;

  @IsBoolean()
  termsAccepted: boolean;

  @IsBoolean()
  sensitiveDataConsent: boolean;

  @IsTimeZone()
  timezone: string;
}

export class LoginDto {
  @Transform(({ value }) => typeof value === "string" ? value.trim().toLowerCase() : value)
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsString()
  @MaxLength(128)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  deviceName?: string;
}

export class FirebaseLoginDto {
  @IsString()
  @MinLength(20)
  idToken: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  deviceName?: string;

  @IsOptional()
  @IsString()
  @Length(2, 80)
  displayName?: string;

  @IsOptional()
  @IsIn(["male_cis", "female_cis", "male_trans", "female_trans"])
  gender?: string;

  @IsOptional()
  @IsTimeZone()
  timezone?: string;

  @IsOptional()
  @IsBoolean()
  termsAccepted?: boolean;

  @IsOptional()
  @IsBoolean()
  sensitiveDataConsent?: boolean;
}

export class EmailDto {
  @Transform(({ value }) => typeof value === "string" ? value.trim().toLowerCase() : value)
  @IsEmail()
  @MaxLength(254)
  email: string;
}

export class TokenDto {
  @IsString()
  @MinLength(32)
  @MaxLength(300)
  token: string;
}

export class ResetPasswordDto extends TokenDto {
  @IsString()
  @MinLength(10)
  @MaxLength(128)
  newPassword: string;
}

export class LogoutDto {
  @IsOptional()
  @IsBoolean()
  allDevices?: boolean;
}
