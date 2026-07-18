import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";
import type { AuthUser } from "../../common/auth-user";

function splitEmails(value?: string) {
  return (value ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
}

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const userEmail = request.user?.email?.toLowerCase();
    const owners = splitEmails(this.config.get<string>("OWNER_EMAILS"));
    const isProduction = this.config.get<string>("NODE_ENV") === "production";

    if (!owners.length && !isProduction) return true;
    if (userEmail && owners.includes(userEmail)) return true;

    throw new ForbiddenException({ code: "OWNER_ACCESS_REQUIRED", message: "Acesso restrito ao dono do produto." });
  }
}
