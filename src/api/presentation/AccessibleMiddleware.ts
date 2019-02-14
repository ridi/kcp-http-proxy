import { ExpressMiddlewareInterface } from "routing-controllers";

export class AccessibleMiddleware implements ExpressMiddlewareInterface {
    use(request: any, response: any, next: (err?: any) => any): any {
        //TODO
        next();
    }
}