import { Logger } from "aws-cloudwatch-log";
import { Request } from "express";
import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";
import { Inject } from "typedi";

@Middleware({ type: "before" })
export class RequestLoggingAspect implements ExpressMiddlewareInterface {
    @Inject()
    logger: Logger;

    use(request: any, response: any, next: (err?: any) => any) {//TODO
        const req = request as Request;

        this.logger.log("[INFO]", `${req.method} ${req.url}`, new Date().getTime());
        next();
    }
}