import * as Logger from 'bunyan';
import { Request, Response } from 'express';
import { ExpressMiddlewareInterface } from 'routing-controllers';
import { Inject } from 'typedi';

export class RequestLoggingMiddleware implements ExpressMiddlewareInterface {    
    @Inject('logger')
    logger: Logger;

    use(request: any, response: any, next: (err?: any) => any) {
        const req = request as Request;
        const res = response as Response;
        this.logger.info('REQ:', req.method, req.originalUrl);

        const originalWrite = response.write;
        const originalEnd = response.end;
        const chunks = [];
        response.write = (...args) => {
            chunks.push(Buffer.from(args[0]));
            originalWrite.apply(response, args);
        };
        response.end = (...args) => {
            if (args[0]) {
                chunks.push(Buffer.from(args[0]));
            }

            const body = Buffer.concat(chunks).toString('utf8');
            
            this.logger.info('REQ:', res.req.method, res.req.originalUrl, res.req.body, 'RES:', res.statusCode, body);

            originalEnd.apply(response, args);
        }

        next();
    }
}