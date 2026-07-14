import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import type { Request, Response } from "express";

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest<Request & { requestId?: string }>();
    const response = context.getResponse<Response>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = exception instanceof HttpException ? exception.getResponse() : null;
    const objectPayload = typeof payload === "object" && payload !== null ? payload as Record<string, unknown> : {};
    const message = status >= 500
      ? "Nao foi possivel concluir a solicitacao."
      : Array.isArray(objectPayload.message) ? "Verifique os campos informados." : String(objectPayload.message ?? payload ?? "Solicitacao invalida.");
    const code = String(objectPayload.code ?? (status === 400 ? "VALIDATION_ERROR" : HttpStatus[status] ?? "REQUEST_ERROR"));

    response.status(status).json({
      error: {
        code,
        message,
        ...(Array.isArray(objectPayload.message) ? { fields: objectPayload.message } : {}),
        requestId: request.requestId ?? response.getHeader("X-Request-Id"),
      },
    });
  }
}
