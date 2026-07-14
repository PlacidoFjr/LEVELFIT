import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotImplementedException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { randomUUID } from "node:crypto";
import { asUtcDate } from "../../common/date";
import { hashContext, hashToken, randomToken } from "../../common/crypto";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import type { AuthUser } from "../../common/auth-user";
import type { LoginDto, RegisterDto, ResetPasswordDto } from "./auth.dto";

type RequestContext = { ip?: string; userAgent?: string };

@Injectable()
export class AuthService {
  private readonly tokenSecret: string;
  private readonly refreshDays: number;
  private readonly isProduction: boolean;

  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService, private readonly config: ConfigService) {
    this.tokenSecret = config.getOrThrow("TOKEN_HASH_SECRET");
    this.refreshDays = config.get<number>("REFRESH_TOKEN_TTL_DAYS", 30);
    this.isProduction = config.get("NODE_ENV") === "production";
  }

  async register(dto: RegisterDto) {
    if (!dto.termsAccepted) throw new BadRequestException({ code: "TERMS_REQUIRED", message: "O aceite dos termos é obrigatório." });
    const exists = await this.prisma.user.findFirst({ where: { email: dto.email, deletedAt: null }, select: { id: true } });
    if (exists) throw new ConflictException({ code: "EMAIL_UNAVAILABLE", message: "Não foi possível usar este e-mail." });

    const now = new Date();
    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id, memoryCost: 19456, timeCost: 3, parallelism: 1 });
    const verificationToken = randomToken();
    const verificationHash = hashToken(verificationToken, this.tokenSecret);
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const startsOn = asUtcDate(now);

    const user = await this.prisma.$transaction(async (tx) => tx.user.create({
      data: {
        email: dto.email,
        passwordHash,
        status: "pending_email",
        termsAcceptedAt: now,
        sensitiveDataConsentAt: dto.sensitiveDataConsent ? now : null,
        profile: { create: { displayName: dto.displayName.trim(), gender: dto.gender, timezone: dto.timezone } },
        preferences: { create: {} },
        notificationPreference: { create: { timezone: dto.timezone, waterRemindersEnabled: false, nutritionRemindersEnabled: false, workoutRemindersEnabled: false, streakRemindersEnabled: false, weeklySummaryEnabled: false } },
        hydrationGoals: { create: { dailyGoalMl: 2000, startsOn } },
        level: { create: {} },
        streaks: { create: [{ type: "daily" }, { type: "workout" }, { type: "water" }, { type: "nutrition" }] },
        emailVerificationTokens: { create: { tokenHash: verificationHash, expiresAt } },
      },
      select: { id: true, email: true, emailVerifiedAt: true, createdAt: true },
    }));

    return { user: { ...user, emailVerified: false }, verificationRequired: true, ...(!this.isProduction ? { devVerificationToken: verificationToken } : {}) };
  }

  async login(dto: LoginDto, context: RequestContext) {
    const user = await this.prisma.user.findFirst({ where: { email: dto.email, deletedAt: null }, select: { id: true, email: true, passwordHash: true, status: true, emailVerifiedAt: true, profile: { select: { displayName: true } } } });
    const valid = user?.passwordHash ? await argon2.verify(user.passwordHash, dto.password) : false;
    if (!user || !valid) {
      if (user) await this.prisma.userSecurityEvent.create({ data: { userId: user.id, type: "login_failed", ipHash: hashContext(context.ip, this.tokenSecret), userAgentHash: hashContext(context.userAgent, this.tokenSecret) } });
      throw new UnauthorizedException({ code: "INVALID_CREDENTIALS", message: "E-mail ou senha invalidos." });
    }
    if (user.status === "suspended") throw new ForbiddenException({ code: "ACCOUNT_SUSPENDED", message: "Conta temporariamente indisponivel." });
    if (!user.emailVerifiedAt) throw new ForbiddenException({ code: "EMAIL_VERIFICATION_REQUIRED", message: "Confirme seu e-mail antes de entrar." });

    const issued = await this.createSession(user.id, dto.deviceName, context);
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await this.prisma.userSecurityEvent.create({ data: { userId: user.id, type: "login_success", ipHash: hashContext(context.ip, this.tokenSecret), userAgentHash: hashContext(context.userAgent, this.tokenSecret) } });
    return { ...issued, user: { id: user.id, email: user.email, displayName: user.profile?.displayName } };
  }

  private async createSession(userId: string, deviceName: string | undefined, context: RequestContext) {
    const refreshToken = randomToken();
    const familyId = randomUUID();
    const expiresAt = new Date(Date.now() + this.refreshDays * 24 * 60 * 60 * 1000);
    const session = await this.prisma.session.create({ data: { userId, deviceName, ipHash: hashContext(context.ip, this.tokenSecret), userAgentHash: hashContext(context.userAgent, this.tokenSecret), refreshTokens: { create: { userId, tokenHash: hashToken(refreshToken, this.tokenSecret), familyId, expiresAt } } }, select: { id: true } });
    return this.tokenResponse(userId, session.id, refreshToken);
  }

  private async tokenResponse(userId: string, sessionId: string, refreshToken: string) {
    const accessToken = await this.jwt.signAsync({ sub: userId, sid: sessionId });
    return { accessToken, expiresIn: this.config.get<number>("ACCESS_TOKEN_TTL_SECONDS", 600), refreshToken, csrfToken: randomToken(24) };
  }

  async refresh(rawToken: string | undefined) {
    if (!rawToken) throw new UnauthorizedException({ code: "INVALID_REFRESH_TOKEN", message: "Sessão expirada." });
    const tokenHash = hashToken(rawToken, this.tokenSecret);
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash }, include: { session: true, user: true } });
    if (!stored || stored.expiresAt <= new Date() || stored.revokedAt || stored.session.revokedAt || stored.user.deletedAt || stored.user.status !== "active") throw new UnauthorizedException({ code: "INVALID_REFRESH_TOKEN", message: "Sessão expirada." });
    if (stored.rotatedAt) return this.revokeReusedToken(stored.userId, stored.sessionId, stored.familyId);

    const nextRaw = randomToken();
    const nextHash = hashToken(nextRaw, this.tokenSecret);
    const expiresAt = new Date(Date.now() + this.refreshDays * 24 * 60 * 60 * 1000);
    const claimed = await this.prisma.$transaction(async (tx) => {
      const result = await tx.refreshToken.updateMany({
        where: { id: stored.id, rotatedAt: null, revokedAt: null },
        data: { rotatedAt: new Date() },
      });
      if (result.count !== 1) return false;
      await tx.refreshToken.create({ data: { userId: stored.userId, sessionId: stored.sessionId, familyId: stored.familyId, tokenHash: nextHash, expiresAt } });
      await tx.session.update({ where: { id: stored.sessionId }, data: { lastSeenAt: new Date() } });
      return true;
    });
    if (!claimed) return this.revokeReusedToken(stored.userId, stored.sessionId, stored.familyId);
    return this.tokenResponse(stored.userId, stored.sessionId, nextRaw);
  }

  private async revokeReusedToken(userId: string, sessionId: string, familyId: string): Promise<never> {
    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.refreshToken.updateMany({ where: { familyId }, data: { revokedAt: now } }),
      this.prisma.session.updateMany({ where: { id: sessionId, revokedAt: null }, data: { revokedAt: now } }),
      this.prisma.userSecurityEvent.create({ data: { userId, type: "suspicious_login", metadata: { reason: "refresh_token_reuse" } } }),
    ]);
    throw new UnauthorizedException({ code: "TOKEN_REUSE_DETECTED", message: "Sessão encerrada por segurança." });
  }

  async logout(auth: AuthUser, allDevices: boolean) {
    const now = new Date();
    if (allDevices) {
      await this.prisma.$transaction([
        this.prisma.session.updateMany({ where: { userId: auth.userId, revokedAt: null }, data: { revokedAt: now } }),
        this.prisma.refreshToken.updateMany({ where: { userId: auth.userId, revokedAt: null }, data: { revokedAt: now } }),
        this.prisma.userSecurityEvent.create({ data: { userId: auth.userId, type: "sessions_revoked" } }),
      ]);
    } else {
      await this.prisma.$transaction([
        this.prisma.session.updateMany({ where: { id: auth.sessionId, userId: auth.userId }, data: { revokedAt: now } }),
        this.prisma.refreshToken.updateMany({ where: { sessionId: auth.sessionId, revokedAt: null }, data: { revokedAt: now } }),
      ]);
    }
  }

  async verifyEmail(token: string) {
    const tokenHash = hashToken(token, this.tokenSecret);
    const stored = await this.prisma.emailVerificationToken.findUnique({ where: { tokenHash } });
    if (!stored || stored.usedAt || stored.expiresAt <= new Date()) throw new BadRequestException({ code: "INVALID_OR_EXPIRED_TOKEN", message: "Token invalido ou expirado." });
    await this.prisma.$transaction([
      this.prisma.emailVerificationToken.updateMany({ where: { userId: stored.userId, usedAt: null }, data: { usedAt: new Date() } }),
      this.prisma.user.update({ where: { id: stored.userId }, data: { emailVerifiedAt: new Date(), status: "active" } }),
    ]);
    return { emailVerified: true };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findFirst({ where: { email, deletedAt: null }, select: { id: true } });
    let devResetToken: string | undefined;
    if (user) {
      const token = randomToken();
      devResetToken = token;
      await this.prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash: hashToken(token, this.tokenSecret), expiresAt: new Date(Date.now() + 30 * 60 * 1000) } });
    }
    return { accepted: true, ...(!this.isProduction && devResetToken ? { devResetToken } : {}) };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = hashToken(dto.token, this.tokenSecret);
    const stored = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash } });
    if (!stored || stored.usedAt || stored.expiresAt <= new Date()) throw new BadRequestException({ code: "INVALID_OR_EXPIRED_TOKEN", message: "Token invalido ou expirado." });
    const passwordHash = await argon2.hash(dto.newPassword, { type: argon2.argon2id, memoryCost: 19456, timeCost: 3, parallelism: 1 });
    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.passwordResetToken.updateMany({ where: { userId: stored.userId, usedAt: null }, data: { usedAt: now } }),
      this.prisma.user.update({ where: { id: stored.userId }, data: { passwordHash } }),
      this.prisma.session.updateMany({ where: { userId: stored.userId, revokedAt: null }, data: { revokedAt: now } }),
      this.prisma.refreshToken.updateMany({ where: { userId: stored.userId, revokedAt: null }, data: { revokedAt: now } }),
      this.prisma.userSecurityEvent.create({ data: { userId: stored.userId, type: "password_changed" } }),
    ]);
  }

  mfaNotEnabled(): never { throw new NotImplementedException({ code: "FEATURE_NOT_ENABLED", message: "MFA será ativado em uma próxima fase." }); }
}
