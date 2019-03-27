import { Request, Response } from 'express';
import { ExpressMiddlewareInterface } from 'routing-controllers';

export class RequestLoggingMiddleware implements ExpressMiddlewareInterface {
    use(request: any, response: any, next: (err?: any) => any) {
        const req = request as Request;
        console.info('REQ:', req.method, req.originalUrl);

        const originalWrite: Function = response.write;
        const originalEnd: Function = response.end;
        const chunks: Buffer[] = [];
        response.write = (...args: any[]) => {
            chunks.push(Buffer.from(args[0]));
            originalWrite.apply(response, args);
        };
        response.end = (...args: any[]) => {
            if (args[0]) {
                chunks.push(Buffer.from(args[0]));
            }

            const body: string = Buffer.concat(chunks).toString('utf8');
            const res = response as Response;
            console.info('REQ:', res.req.method, res.req.originalUrl, res.req.body, 'RES:', res.statusCode, body);

            originalEnd.apply(response, args);
        }

        next();
    }
}