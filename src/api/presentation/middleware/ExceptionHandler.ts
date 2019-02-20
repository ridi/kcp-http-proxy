import { ExpressErrorMiddlewareInterface, HttpError, Middleware } from "routing-controllers";
import { InvalidCommandException } from "../../application/exception/InvalidCommandException";
import { PayPlusException } from "../../application/exception/PayPlusException";
import { InvalidRequestException } from "../request/InvalidRequestException";

@Middleware({ type: "after" })
export class ExceptionHandler implements ExpressErrorMiddlewareInterface {
    error(error: any, request: any, response: any, next: (err?: any) => any): void {
        //TODO logging error.message
        switch (error.constructor) {            
            case InvalidRequestException: {
                response.status(400).send({
                    code: "400",
                    message: (error as InvalidRequestException).errors,
                    isSuccess: false,
                });
                break;
            }
            case InvalidCommandException: {
                response.status(400).send({
                    code: "400",
                    message: error.message,
                    isSuccess: false
                });
                break;
            }
            case PayPlusException: {
                response.status(500).send({
                    code: (error as PayPlusException).code,
                    message: error.message,
                    isSuccess: false
                });
                break;
            }
            case HttpError: {
                const httpCode: number = (error as HttpError).httpCode || 500;
                response.status(httpCode).send({
                    code: httpCode.toString(),
                    message: error.message ? (error.message.startsWith("Command failed") ? "Command failed." : error.message) : "Internal Server Error",
                    isSuccess: false
                });
                break;
            }
            default: {
                response.status(500).send({
                    code: "500",
                    message: error.message ? (error.message.startsWith("Command failed") ? "Command failed." : error.message) : "Internal Server Error",
                    isSuccess: false
                });
                break;
            }
        }

        next();
    }
}