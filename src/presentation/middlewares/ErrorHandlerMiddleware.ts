import { PAY_PLUS_STATUS } from '@root/common/constants';
import { DatabaseConnectionError } from '@root/errors/DatabaseConnectionError';
import { InvalidRequestError } from '@root/errors/InvalidRequestError';
import { PayPlusError } from '@root/errors/PayPlusError';
import { MessageResponse } from '@root/presentation/models/MessageResponse';
import { PayPlusErrorResponse } from '@root/presentation/models/PayPlusErrorResponse';
import * as httpStatus from 'http-status';
import { ExpressErrorMiddlewareInterface, HttpError, Middleware } from 'routing-controllers';

@Middleware({ type: 'after' })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
    public error(error: any, request: any, response: any, next: (err?: any) => any): void {
        switch (error.constructor) {
            case InvalidRequestError: {
                response
                    .status(httpStatus.BAD_REQUEST)
                    .json(new MessageResponse(error.message));
                break;
            }
            case PayPlusError: {
                const code = (error as PayPlusError).code;
                const status =  (code === PAY_PLUS_STATUS.ALREADY_CANCELED) ? httpStatus.CONFLICT : httpStatus.INTERNAL_SERVER_ERROR;
                response
                    .status(status)
                    .json(new PayPlusErrorResponse(code, error.message));
                break;
            }
            case HttpError: {
                const status: number = (error as HttpError).httpCode || httpStatus.INTERNAL_SERVER_ERROR;
                response
                    .status(status)
                    .json(new MessageResponse(error.message));
                break;
            }
            case DatabaseConnectionError: {
                response
                    .status(httpStatus.SERVICE_UNAVAILABLE)
                    .json(new MessageResponse('Database Connection Error'));
                break;
            }
            default: {
                response
                    .status(httpStatus.INTERNAL_SERVER_ERROR)
                    .json(new MessageResponse(error.message));
                break;
            }
        }

        next();
    }
}
