import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";
import type { AuthUser } from "../../common/auth-user";

type JwtPayload = { sub: string; sid: string };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>("JWT_ACCESS_SECRET"),
      issuer: config.get<string>("JWT_ISSUER"),
      audience: config.get<string>("JWT_AUDIENCE"),
      ignoreExpiration: false,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const session = await this.prisma.session.findFirst({
      where: { id: payload.sid, userId: payload.sub, revokedAt: null, user: { deletedAt: null, status: "active" } },
      select: { id: true, userId: true },
    });
    if (!session) throw new UnauthorizedException({ code: "SESSION_REVOKED", message: "Sessão inválida ou encerrada." });
    return { userId: session.userId, sessionId: session.id };
  }
}
