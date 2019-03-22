
import { InvalidRequestError } from '@root/errors/InvalidRequestError';
import { PayPlusError } from '@root/errors/PayPlusError';
import * as Logger from 'bunyan';
import { ExpressErrorMiddlewareInterface, HttpError, Middleware } from 'routing-controllers';
import { Inject } from 'typedi';

@Middleware({ type: 'after' })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
    @Inject('logger')
    logger: Logger;

    error(error: any, request: any, response: any, next: (err?: any) => any): void {
        this.logger.error(error);

        switch (error.constructor) {            
            case InvalidRequestError: {
                response.status(400).json({
                    message: error.message
                });
                break;
            }
            case PayPlusError: {
                response.status(500).json({
                    code: (error as PayPlusError).code,
                    message: error.message
                });
                break;
            }
            case HttpError: {
                const httpCode: number = (error as HttpError).httpCode || 500;
                let message = error.message;
                if (error.message.startsWith('Command failed')) {
                    message = 'KCP Error';
                }
                response.status(httpCode).json({
                    message: message
                });
                break;
            }
            default: {
                let message = 'Internal Server Error';
                if (error.message.startsWith('Command failed')) {
                    message = 'KCP Error';
                }
                response.status(500).json({
                    message: message
                });
                break;
            }
        }

        next();
    }
}