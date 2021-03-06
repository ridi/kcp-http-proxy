import { PAY_PLUS_STATUS } from '@root/common/constants';
import { DatabaseConnectionError } from '@root/errors/DatabaseConnectionError';
import { InvalidRequestError } from '@root/errors/InvalidRequestError';
import { PayPlusError } from '@root/errors/PayPlusError';
import { ErrorResponse } from '@root/presentation/models/ErrorResponse';
import * as httpStatus from 'http-status';
import { ExpressErrorMiddlewareInterface, HttpError, Middleware } from 'routing-controllers';

@Middleware({ type: 'after' })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
  public error(error: any, request: any, response: any, next: (err?: any) => any): void {
    switch (error.constructor) {
      case InvalidRequestError: {
        response
          .status(httpStatus.BAD_REQUEST)
          .json(new ErrorResponse('INVALID_REQUEST', error.message));
        break;
      }
      case PayPlusError: {
        const code = (error as PayPlusError).code;
        const status = (code === PAY_PLUS_STATUS.ALREADY_CANCELED) ? httpStatus.CONFLICT : httpStatus.INTERNAL_SERVER_ERROR;
        response
          .status(status)
          .json(new ErrorResponse(code, error.message));
        break;
      }
      case DatabaseConnectionError: {
        response
          .status(httpStatus.SERVICE_UNAVAILABLE)
          .json(new ErrorResponse('DATABASE_CONNECTION_ERROR', 'Database Connection Error'));
        break;
      }
      case HttpError: {
        const status: number = (error as HttpError).httpCode || httpStatus.INTERNAL_SERVER_ERROR;
        response
          .status(status)
          .json(new ErrorResponse(httpStatus[status], error.message));
        break;
      }
      default: {
        const message = error.message.startsWith('Command failed') ? 'KCP Error' : error.message;
        response
          .status(httpStatus.INTERNAL_SERVER_ERROR)
          .json(new ErrorResponse(httpStatus['500_NAME'], message));
        break;
      }
    }

    next();
  }
}
