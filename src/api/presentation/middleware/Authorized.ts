import * as express from "express";
import * as fs from "fs";
import * as jwt from "jsonwebtoken";
import { ExpressMiddlewareInterface, HttpError } from "routing-controllers";
import { Container } from "typedi";

const pem = fs.readFileSync(Container.get('app.root') + '/resources/ridi-pay_to_ridi-kcp.key.pub');

export class Authorized implements ExpressMiddlewareInterface {
    use(request: express.Request, response: express.Response, next: (err?: any) => any) {
        const authorization: string = request.headers["authorization"];

        let decoded: any;
        try {
            const token: string = authorization.split("Bearer")[1].trim();
            
            decoded = jwt.verify(token, pem, (err, decoded) => decoded);
            if (!decoded) {
                throw "Failed to decode JWT";
            }
        } catch (error) {            
            throw new HttpError(401, "Failed to check authorization.");
        }

        if (!decoded.iss || decoded.iss !== 'ridi-pay') {
            throw new HttpError(401, "Invalid JWT issuer");
        }
        if (!decoded.aud || decoded.aud !== 'ridi-kcp') {
            throw new HttpError(401, "Invalid JWT Audience");
        }            
        if (!decoded.exp || decoded.exp * 1000 < Date.now()) {
            throw new HttpError(401, "Expirted JWT");
        }

        next();
    }
}