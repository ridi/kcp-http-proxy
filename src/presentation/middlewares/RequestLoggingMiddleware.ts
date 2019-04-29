import { Request, Response } from 'express';
import { ExpressMiddlewareInterface } from 'routing-controllers';

export class RequestLoggingMiddleware implements ExpressMiddlewareInterface {
    private maskBody(body: any): any {
        const masked = {};
        for (const key in body) {
            if (key === 'card_no') {
                masked[key] = body[key].substring(0, 6).padEnd(body[key].length, '*');
            } else if (['card_password', 'card_expiry_date', 'card_tax_no', 'buyer_name', 'buyer_email'].includes(key)) {
                masked[key] = ''.padStart((body[key] || '').length, '*');
            } else if (key.includes('tax_no')) {
                masked[key] = ''.padStart((body[key] || '').length, '*');
            } else {
                masked[key] = body[key];
            }
        }
        return masked;
    }

    public use(request: any, response: any, next: (err?: any) => any) {
        const req = request as Request;
        console.info('REQ:', req.method, req.originalUrl);

        const originalWrite = response.write;
        const originalEnd = response.end;
        const chunks: Buffer[] = [];
        response.write = (...args: any[]) => {
            chunks.push(Buffer.from(args[0]));
            originalWrite.apply(response, args);
        };
        response.end = (...args: any[]) => {
            if (args[0]) {
                chunks.push(Buffer.from(args[0]));
            }

            let body: string = Buffer.concat(chunks).toString('utf8');
            const res = response as Response;

            try {
                body = this.maskBody(JSON.parse(body));
            } catch (err) {
                // ignore parsing body to json
            }

            console.info('REQ:', res.req.method, res.req.originalUrl, this.maskBody(res.req.body), 'RES:', res.statusCode, body);

            originalEnd.apply(response, args);
        };

        next();
    }
}
