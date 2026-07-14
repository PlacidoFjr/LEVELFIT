import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import type { Observable } from "rxjs";

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request & { requestId?: string }>();
    const response = context.switchToHttp().getResponse<Response>();
    const incoming = request.header("X-Request-Id");
    request.requestId = incoming && incoming.length <= 100 ? incoming : randomUUID();
    response.setHeader("X-Request-Id", request.requestId);
    response.setHeader("Cache-Control", "no-store");
    return next.handle();
  }
}
