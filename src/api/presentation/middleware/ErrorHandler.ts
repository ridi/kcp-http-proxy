import * as Logger from "bunyan";
import { ExpressErrorMiddlewareInterface, HttpError, Middleware } from "routing-controllers";
import { Inject } from "typedi";
import { InvalidCommandException } from "/application/exception/InvalidCommandException";
import { PayPlusException } from "/application/exception/PayPlusException";
import { InvalidRequestException } from "/presentation/request/InvalidRequestException";

@Middleware({ type: "after" })
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
    @Inject("logger")
    logger: Logger;

    error(error: any, request: any, response: any, next: (err?: any) => any): void {
        this.logger.error(error);

        switch (error.constructor) {            
            case InvalidRequestException: {
                response.status(400).json({
                    code: "400",
                    message: (error as InvalidRequestException).errors,
                    is_success: false,
                });
                break;
            }
            case InvalidCommandException: {
                response.status(400).json({
                    code: "400",
                    message: error.message,
                    is_success: false
                });
                break;
            }
            case PayPlusException: {
                response.status(500).json({
                    code: (error as PayPlusException).code,
                    message: error.message,
                    is_success: false
                });
                break;
            }
            case HttpError: {
                const httpCode: number = (error as HttpError).httpCode || 500;
                response.status(httpCode).json({
                    code: httpCode.toString(),
                    message: error.message ? (error.message.startsWith("Command failed") ? "Command failed." : error.message) : "Internal Server Error",
                    is_success: false
                });
                break;
            }
            default: {
                response.status(500).json({
                    code: "500",
                    message: error.message ? (error.message.startsWith("Command failed") ? "Command failed." : error.message) : "Internal Server Error",
                    is_success: false
                });
                break;
            }
        }

        next();
    }
}