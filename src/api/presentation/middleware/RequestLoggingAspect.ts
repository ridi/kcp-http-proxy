import { Request } from "express";
import { getLogger, Logger } from "log4js";
import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";

@Middleware({ type: "before" })
export class RequestLoggingAspect implements ExpressMiddlewareInterface {    

    readonly logger: Logger = getLogger("http");

    use(request: any, response: any, next: (err?: any) => any) {
        const req = request as Request;

        this.logger.info(`${req.method} ${req.url}`);

        next();
    }
}