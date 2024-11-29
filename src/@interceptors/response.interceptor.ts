import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface Response<T> {
  success: boolean;
  data?: T;
  message?: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
      })),

      catchError((err) => {
        const isHttpException = err instanceof HttpException;
        const message = isHttpException
          ? (err.getResponse() as string | { message: string }).toString()
          : 'Internal server error';

        const statusCode = isHttpException ? err.getStatus() : 500;

        const type = context.getType();

        if (type === 'http') {
          return throwError(() => ({
            success: false,
            message,
            statusCode,
          }));
        } else if (type === 'ws') {
          const socket = context.switchToWs().getClient();
          socket.emit('error', { message, statusCode });

          return throwError(() => ({
            success: false,
            message: 'WebSocket error occurred',
          }));
        }

        return throwError(() => ({
          success: false,
          message: 'Unexpected error occurred',
        }));
      }),
    );
  }
}
