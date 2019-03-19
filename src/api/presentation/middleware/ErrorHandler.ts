import { InvalidCommandException } from "@app/application/exception/InvalidCommandException";
import { PayPlusException } from "@app/application/exception/PayPlusException";
import { InvalidRequestException } from "@app/presentation/request/InvalidRequestException";
import * as Logger from "bunyan";
import { ExpressErrorMiddlewareInterface, HttpError, Middleware } from "routing-controllers";
import { Inject } from "typedi";

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
                    message: (error as InvalidRequestException).errors
                });
                break;
            }
            case InvalidCommandException: {
                response.status(400).json({
                    code: "400",
                    message: error.message
                });
                break;
            }
            case PayPlusException: {
                response.status(500).json({
                    code: (error as PayPlusException).code,
                    message: error.message,
                    command: (error as PayPlusException).command
                });
                break;
            }
            case HttpError: {
                const httpCode: number = (error as HttpError).httpCode || 500;
                response.status(httpCode).json({
                    code: httpCode.toString(),
                    message: error.message ? (error.message.startsWith("Command failed") ? "Command failed." : error.message) : "Internal Server Error"
                });
                break;
            }
            default: {
                response.status(500).json({
                    code: "500",
                    message: error.message ? (error.message.startsWith("Command failed") ? "Command failed." : error.message) : "Internal Server Error"
                });
                break;
            }
        }

        next();
    }
}