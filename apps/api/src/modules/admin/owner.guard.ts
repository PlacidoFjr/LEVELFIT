import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";
import type { AuthUser } from "../../common/auth-user";
import { isOwnerEmail } from "../../common/access-profile";
import { PrismaService } from "../../infrastructure/prisma/prisma.service";

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private readonly config: ConfigService, private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const userEmail = request.user?.email?.toLowerCase();

    if (isOwnerEmail(this.config, userEmail)) return true;
    if (request.user?.userId) {
      const role = await this.prisma.userRoleAssignment.findFirst({
        where: { userId: request.user.userId, role: "OWNER", revokedAt: null },
        select: { id: true },
      });
      if (role) return true;
    }

    throw new ForbiddenException({ code: "OWNER_ACCESS_REQUIRED", message: "Acesso restrito ao dono do produto." });
  }
}
