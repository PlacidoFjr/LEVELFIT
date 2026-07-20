import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import type { AuthUser } from "../../common/auth-user";

type StepUpPayload = {
  sub: string;
  sid: string;
  scope: string;
  typ: string;
};

@Injectable()
export class OwnerStepUpGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const token = request.header("x-levelfit-step-up");
    if (!token) throw new ForbiddenException({ code: "STEP_UP_REQUIRED", message: "Confirme sua senha para executar esta acao critica." });

    try {
      const payload = await this.jwt.verifyAsync<StepUpPayload>(token);
      const valid =
        payload.typ === "step_up" &&
        payload.scope === "owner:critical" &&
        payload.sub === request.user?.userId &&
        payload.sid === request.user?.sessionId;
      if (valid) return true;
    } catch {
      // Normalize token verification errors to the same public response.
    }

    throw new ForbiddenException({ code: "STEP_UP_REQUIRED", message: "Confirmacao de seguranca expirada. Confirme sua senha novamente." });
  }
}
