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
  intercept(_: ExecutionContext, next: CallHandler): Observable<Response<T>> {
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

        return throwError(() => ({
          success: false,
          message,
        }));
      }),
    );
  }
}
