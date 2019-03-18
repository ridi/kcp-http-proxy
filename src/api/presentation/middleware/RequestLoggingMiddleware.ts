import * as Logger from "bunyan";
import { Request } from "express";
import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";
import { Inject } from "typedi";

@Middleware({ type: "before" })
export class RequestLoggingMiddleware implements ExpressMiddlewareInterface {    
    @Inject("logger")
    logger: Logger;

    use(request: any, response: any, next: (err?: any) => any) {
        const req = request as Request;

        this.logger.info(`${req.method} ${req.url}`);

        next();
    }
}