import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    // if(status===409) return response.sendStatus(status)

    const responseBodyForLikestatus: any = exception.getResponse();
 
    if (status === 400 && !request.headers) return response.sendStatus(401)
      if (
        status === 400 &&
        responseBodyForLikestatus.message[0].field === 'likeStatus'
      ) {
        return response.status(status).json({
          errorsMessages: [
            {
              message: 'wrong likestatus',
              field: 'likeStatus',
            },
          ],
        });
      }

    if (status === 400) {
      let errorResponse = {
        errors: [],
      };
      const responseBody: any = exception.getResponse();
      if (responseBody.message === 'Validation failed (uuid is expected)') {
        errorResponse.errors.push({
          message: 'Validation failed (uuid is expected)',
          field: 'code',
        });
      }else if (responseBody.message === 'Bad Request') {
        errorResponse.errors.push({
          message: 'Bad Request',
          field: 'any',
        });
      } else {
        responseBody.message.forEach((m) => {
          let isFieldExists = errorResponse.errors.find(
            (mes) => mes.field === m.field,
          );
          if (!isFieldExists) errorResponse.errors.push(m);
        });
      }

      response.status(status).json(errorResponse);
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
