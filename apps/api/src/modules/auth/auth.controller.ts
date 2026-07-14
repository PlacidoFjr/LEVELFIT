import { Body, Controller, ForbiddenException, Headers, HttpCode, Ip, Post, Req, Res, UseGuards } from "@nestjs/common";
import { Throttle, minutes } from "@nestjs/throttler";
import type { Request, Response } from "express";
import { CurrentUser } from "../../common/current-user.decorator";
import type { AuthUser } from "../../common/auth-user";
import { AuthService } from "./auth.service";
import { EmailDto, LoginDto, LogoutDto, RegisterDto, ResetPasswordDto, TokenDto } from "./auth.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";

const refreshCookie = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" as const, priority: "high" as const, path: "/v1/auth", maxAge: 30 * 24 * 60 * 60 * 1000 };
const csrfCookie = { httpOnly: false, secure: process.env.NODE_ENV === "production", sameSite: "strict" as const, priority: "high" as const, path: "/v1/auth", maxAge: 30 * 24 * 60 * 60 * 1000 };

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("register")
  @Throttle({ default: { limit: 5, ttl: minutes(60) } })
  register(@Body() dto: RegisterDto) { return this.auth.register(dto); }

  @Post("login")
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: minutes(15) } })
  async login(@Body() dto: LoginDto, @Ip() ip: string, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const result = await this.auth.login(dto, { ip, userAgent: request.header("user-agent") });
    response.cookie("lf_refresh", result.refreshToken, refreshCookie);
    response.cookie("lf_csrf", result.csrfToken, csrfCookie);
    return { accessToken: result.accessToken, expiresIn: result.expiresIn, csrfToken: result.csrfToken, user: result.user };
  }

  @Post("refresh")
  @HttpCode(200)
  async refresh(@Req() request: Request, @Headers("x-csrf-token") csrfHeader: string | undefined, @Res({ passthrough: true }) response: Response) {
    if (!csrfHeader || csrfHeader !== request.cookies?.lf_csrf) throw new ForbiddenException({ code: "CSRF_VALIDATION_FAILED", message: "Validacao CSRF falhou." });
    const result = await this.auth.refresh(request.cookies?.lf_refresh);
    response.cookie("lf_refresh", result.refreshToken, refreshCookie);
    response.cookie("lf_csrf", result.csrfToken, csrfCookie);
    return { accessToken: result.accessToken, expiresIn: result.expiresIn, csrfToken: result.csrfToken };
  }

  @Post("logout")
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: AuthUser, @Body() dto: LogoutDto, @Res({ passthrough: true }) response: Response) {
    await this.auth.logout(user, dto.allDevices ?? false);
    response.clearCookie("lf_refresh", { path: "/v1/auth" });
    response.clearCookie("lf_csrf", { path: "/v1/auth" });
  }

  @Post("verify-email")
  @HttpCode(200)
  verifyEmail(@Body() dto: TokenDto) { return this.auth.verifyEmail(dto.token); }

  @Post("forgot-password")
  @HttpCode(202)
  @Throttle({ default: { limit: 3, ttl: minutes(60) } })
  forgotPassword(@Body() dto: EmailDto) { return this.auth.forgotPassword(dto.email); }

  @Post("reset-password")
  @HttpCode(204)
  async resetPassword(@Body() dto: ResetPasswordDto) { await this.auth.resetPassword(dto); }

  @Post("enable-2fa")
  @UseGuards(JwtAuthGuard)
  enableMfa() { return this.auth.mfaNotEnabled(); }

  @Post("disable-2fa")
  @UseGuards(JwtAuthGuard)
  disableMfa() { return this.auth.mfaNotEnabled(); }
}
