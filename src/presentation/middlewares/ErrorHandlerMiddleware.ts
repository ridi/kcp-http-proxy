import { DatabaseConnectionError } from '@root/errors/DatabaseConnectionError';
import { InvalidRequestError } from '@root/errors/InvalidRequestError';
import { KcpConnectionError } from '@root/errors/KcpConnectionError';
import { PayPlusError } from '@root/errors/PayPlusError';
import * as status from 'http-status';
import { ExpressErrorMiddlewareInterface, HttpError, Middleware } from 'routing-controllers';

@Middleware({ type: 'after' })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
    public error(error: any, request: any, response: any, next: (err?: any) => any): void {
        switch (error.constructor) {            
            case InvalidRequestError: {
                response
                    .status(status.BAD_REQUEST)
                    .json({ message: error.message });
                break;
            }
            case PayPlusError: {
                response
                    .status(status.INTERNAL_SERVER_ERROR)
                    .json({
                        code: (error as PayPlusError).code,
                        message: error.message,
                    });
                break;
            }
            case HttpError: {
                const httpCode: number = (error as HttpError).httpCode || status.INTERNAL_SERVER_ERROR;
                let message = error.message;
                if (error.message.startsWith('Command failed')) {
                    message = 'KCP Error';
                }
                response
                    .status(httpCode)
                    .json({ message });
                break;
            }
            case DatabaseConnectionError: {
                response
                    .status(status.SERVICE_UNAVAILABLE)
                    .json({ message: 'Database Connection Error' });
                break;
            }
            case KcpConnectionError: {
                response
                    .status(status.SERVICE_UNAVAILABLE)
                    .json({ message: 'KCP Connection Error' });
                break;
            }
            default: {
                let message = 'Internal Server Error';
                if (error.message.startsWith('Command failed')) {
                    message = 'KCP Error';
                }
                response
                    .status(status.INTERNAL_SERVER_ERROR)
                    .json({ message });
                break;
            }
        }

        next();
    }
}