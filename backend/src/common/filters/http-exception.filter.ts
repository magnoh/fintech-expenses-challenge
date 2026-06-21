import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Erro interno no servidor';

    // Logar o erro
    this.logger.error(
      `HTTP Status: ${status} Error: ${JSON.stringify(message)} Stack: ${exception instanceof Error ? exception.stack : ''}`,
    );

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: typeof message === 'object' && message !== null ? (message as any).error || 'Error' : 'Error',
      message: typeof message === 'object' && message !== null ? (message as any).message || message : message,
    };

    response.status(status).json(errorResponse);
  }
}
