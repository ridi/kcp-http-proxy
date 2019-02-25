import { ExpressMiddlewareInterface, Middleware } from "routing-controllers";
import { Request } from "express";

@Middleware({ type: "before" })
export class RequestLoggingAspect implements ExpressMiddlewareInterface {
    use(request: any, response: any, next: (err?: any) => any) {//TODO
        const req = request as Request;
        console.info("REQUEST", req.url);
        next();
    }
}