import * as bodyParser from "body-parser";
import * as dotenv from "dotenv";
import { Application } from "express";
import * as path from "path";
import "reflect-metadata";
import { createExpressServer, getMetadataArgsStorage, useContainer as routingUseContainer } from "routing-controllers";
import { routingControllersToSpec } from "routing-controllers-openapi";
import { Container } from "typedi";
import { Config, TestConfig, Mode } from "./api/common/config";
import { KcpController } from "./api/presentation/controllers";

// load .env
dotenv.config();

// enable di container for controller
routingUseContainer(Container);

// set app root path
Container.set('app.root', path.resolve(__dirname));

// set kcp configuration by mode
Container.set(`config.kcp.${Mode.DEV}`, new TestConfig());
Container.set(`config.kcp.${Mode.PROD}`, new Config(
    process.env.KCP_SITE_CODE,
    process.env.KCP_SITE_KEY,
    process.env.KCP_GROUP_ID
));
Container.set(`config.kcp.${Mode.PROD_TAX}`, new Config(
    process.env.KCP_TAX_DEDUCTION_SITE_CODE,
    process.env.KCP_TAX_DEDUCTION_SITE_KEY,
    process.env.KCP_TAX_DEDUCTION_GROUP_ID
));

// scan controllers
const app: Application = createExpressServer({
    routePrefix: '/api',
    controllers: [
        KcpController
    ]
});

// generate open api schema
const storage = getMetadataArgsStorage();
const spec = routingControllersToSpec(storage);
//console.log(spec);

// to allow json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});